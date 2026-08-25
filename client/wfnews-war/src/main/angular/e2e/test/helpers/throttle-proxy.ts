/**
 * An HTTP proxy that makes the network bad on purpose.
 *
 * Why a proxy, and not the Chrome DevTools throttle. Three services send their
 * requests with `CapacitorHttp`, which is DEX code, not the Payload. A DevTools
 * throttle does not touch those, so the Active Wildfire Map and the Saved
 * Location reads would look good on 2G and the report would be wrong. The
 * device proxy setting is obeyed by the WebView and by the DEX code together.
 *
 * It does not read the traffic. HTTPS stays a CONNECT tunnel, so no certificate
 * is needed. It only delays bytes, meters bytes and counts hosts.
 */
import { Server, Socket, connect, createServer } from 'node:net';

export interface Shape {
  /** Kilobits each second, device to server. 0 is no limit. */
  upKbps: number;
  /** Kilobits each second, server to device. 0 is no limit. */
  downKbps: number;
  /** Added one time to each new connection. This is the round trip time. */
  latencyMs: number;
  /** The part of connections that die in the middle, from 0 to 1. */
  stallRate: number;
}

export interface HostCount {
  host: string;
  connections: number;
  bytesDown: number;
  bytesUp: number;
}

export interface Counters {
  connections: number;
  bytesDown: number;
  bytesUp: number;
  /** Connections that this proxy killed on purpose, for a lossy profile. */
  stalled: number;
  /** Connections that never opened. */
  failed: number;
  /** One line for each way a connection failed, so a DNS miss is not read as a refusal. */
  failures: string[];
  /** The last moment that any byte moved. Idle time tells a Journey it is settled. */
  lastActivity: number;
  hosts: HostCount[];
}

const EMPTY_SHAPE: Shape = { upKbps: 0, downKbps: 0, latencyMs: 0, stallRate: 0 };

function bytesEachSecond(kbps: number): number {
  return kbps > 0 ? (kbps * 1000) / 8 : 0;
}

/**
 * Moves bytes from `src` to `dst` at no more than `bytesPerSec`. It sends one
 * slice every 50 ms, because a smaller slice costs more timers than it buys in
 * accuracy.
 */
function throttledPipe(
  src: Socket,
  dst: Socket,
  bytesPerSec: number,
  onBytes: (n: number) => void,
): void {
  if (bytesPerSec <= 0) {
    src.on('data', (chunk: Buffer) => {
      onBytes(chunk.length);
      if (!dst.write(chunk)) src.pause();
    });
    dst.on('drain', () => src.resume());
    src.on('end', () => dst.end());
    return;
  }

  const sliceMs = 50;
  const sliceBytes = Math.max(512, Math.round((bytesPerSec * sliceMs) / 1000));
  let queue = Buffer.alloc(0);
  let ended = false;
  let timer: NodeJS.Timeout | null = null;

  function send(): void {
    timer = null;
    if (queue.length > 0) {
      const slice = queue.subarray(0, sliceBytes);
      queue = queue.subarray(slice.length);
      onBytes(slice.length);
      dst.write(slice);
    }
    if (queue.length > 0) timer = setTimeout(send, sliceMs);
    else if (ended) dst.end();
    else src.resume();
  }

  src.on('data', (chunk: Buffer) => {
    queue = Buffer.concat([queue, chunk]);
    src.pause();
    if (!timer) timer = setTimeout(send, sliceMs);
  });
  src.on('end', () => {
    ended = true;
    if (!timer && queue.length === 0) dst.end();
  });
  src.on('error', () => {
    ended = true;
    if (timer) clearTimeout(timer);
    dst.destroy();
  });
}

export class ThrottleProxy {
  private server: Server | null = null;
  private sockets = new Set<Socket>();
  private shape: Shape = EMPTY_SHAPE;
  private counters: Counters = ThrottleProxy.zero();
  private hosts = new Map<string, HostCount>();

  private static zero(): Counters {
    return {
      connections: 0,
      bytesDown: 0,
      bytesUp: 0,
      stalled: 0,
      failed: 0,
      failures: [],
      lastActivity: Date.now(),
      hosts: [],
    };
  }

  setShape(shape: Shape): void {
    this.shape = shape;
  }

  /** Starts a Journey with clean numbers. */
  reset(): void {
    this.counters = ThrottleProxy.zero();
    this.hosts.clear();
  }

  snapshot(): Counters {
    const hosts = [...this.hosts.values()].sort((a, b) => b.bytesDown - a.bytesDown);
    return { ...this.counters, hosts };
  }

  /** How long since the last byte. A Journey is settled when this is large. */
  idleMs(): number {
    return Date.now() - this.counters.lastActivity;
  }

  listen(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = createServer((client) => this.accept(client));
      server.on('error', reject);
      // Bind to localhost only. `adb reverse` gives the device a way in over USB,
      // so the proxy is never open to the network.
      server.listen(port, '127.0.0.1', () => {
        this.server = server;
        resolve(port);
      });
    });
  }

  async close(): Promise<void> {
    for (const socket of this.sockets) socket.destroy();
    this.sockets.clear();
    await new Promise<void>((resolve) => {
      if (!this.server) return resolve();
      this.server.close(() => resolve());
      this.server = null;
    });
  }

  private track(socket: Socket): void {
    this.sockets.add(socket);
    socket.on('close', () => this.sockets.delete(socket));
    socket.on('error', () => socket.destroy());
  }

  private hostCount(host: string): HostCount {
    let entry = this.hosts.get(host);
    if (!entry) {
      entry = { host, connections: 0, bytesDown: 0, bytesUp: 0 };
      this.hosts.set(host, entry);
    }
    return entry;
  }

  private accept(client: Socket): void {
    this.track(client);
    client.once('data', (first: Buffer) => {
      const header = first.toString('latin1');

      const tunnel = /^CONNECT\s+([^\s:]+):(\d+)/i.exec(header);
      if (tunnel) {
        this.open(client, tunnel[1], Number(tunnel[2]), null, true);
        return;
      }

      // A plain HTTP proxy request holds the whole URL on the request line. Put it
      // back into the origin form, because an origin server expects that form.
      const plain = /^([A-Z]+)\s+http:\/\/([^/\s:]+)(?::(\d+))?(\S*)/i.exec(header);
      if (plain) {
        const rest = first.subarray(header.indexOf('\r\n'));
        const line = Buffer.from(`${plain[1]} ${plain[4] || '/'} HTTP/1.1`, 'latin1');
        this.open(client, plain[2], Number(plain[3] || 80), Buffer.concat([line, rest]), false);
        return;
      }

      // Not a proxy request. Let it fail at once, and do not hold the socket open.
      client.destroy();
    });
  }

  private open(
    client: Socket,
    host: string,
    port: number,
    firstPacket: Buffer | null,
    isTunnel: boolean,
  ): void {
    const shape = this.shape;
    const entry = this.hostCount(host);
    entry.connections += 1;
    this.counters.connections += 1;

    const dies = shape.stallRate > 0 && Math.random() < shape.stallRate;

    setTimeout(() => {
      const upstream = connect({ host, port });
      this.track(upstream);

      upstream.on('error', (error: NodeJS.ErrnoException) => {
        this.counters.failed += 1;
        const line = `${host}:${port} ${error.code || error.message}`;
        if (!this.counters.failures.includes(line)) this.counters.failures.push(line);
        client.destroy();
      });

      upstream.on('connect', () => {
        if (isTunnel) client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        else if (firstPacket) upstream.write(firstPacket);

        throttledPipe(client, upstream, bytesEachSecond(shape.upKbps), (n) => {
          this.counters.bytesUp += n;
          entry.bytesUp += n;
          this.counters.lastActivity = Date.now();
        });
        throttledPipe(upstream, client, bytesEachSecond(shape.downKbps), (n) => {
          this.counters.bytesDown += n;
          entry.bytesDown += n;
          this.counters.lastActivity = Date.now();
        });

        if (dies) {
          // A lossy network drops a connection after it started, not before. This
          // is the case that a retry must recover from.
          setTimeout(
            () => {
              this.counters.stalled += 1;
              upstream.destroy();
              client.destroy();
            },
            500 + Math.random() * 2500,
          );
        }
      });
    }, shape.latencyMs);
  }
}
