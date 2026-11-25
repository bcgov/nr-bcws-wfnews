import { Injectable } from '@angular/core';
import { IonicStorageService } from './ionic-storage.service';

export interface OfflineReport {
  submissionID: string;
  queuedTimestamp: number;
  syncAttempts: number;
  resource: string;
  image1?: string;
  image2?: string;
  image3?: string;
}

export const OFFLINE_REPORT_QUEUE_KEY = 'offlineReportQueue';
// The one-report store from before the queue. Its value is read once, then removed.
export const LEGACY_OFFLINE_REPORT_KEY = 'offlineReportData';

@Injectable({
  providedIn: 'root',
})
export class OfflineReportQueueService {
  // A submit and a Sync can run together; one chain stops one write replacing the other.
  private chain: Promise<unknown> = Promise.resolve();
  private migrated = false;

  constructor(private storage: IonicStorageService) {}

  add(item: OfflineReport): Promise<void> {
    return this.update((queue) =>
      queue.some((queued) => queued.submissionID === item.submissionID)
        ? queue
        : [...queue, item],
    );
  }

  list(): Promise<OfflineReport[]> {
    return this.run(() => this.load());
  }

  remove(submissionID: string): Promise<void> {
    return this.update((queue) =>
      queue.filter((item) => item.submissionID !== submissionID),
    );
  }

  markAttempt(submissionID: string): Promise<void> {
    return this.update((queue) =>
      queue.map((item) =>
        item.submissionID === submissionID
          ? { ...item, syncAttempts: item.syncAttempts + 1 }
          : item,
      ),
    );
  }

  private update(change: (queue: OfflineReport[]) => OfflineReport[]): Promise<void> {
    return this.run(async () => {
      const queue = await this.load();
      const next = change(queue);
      if (next !== queue) {
        await this.storage.set(OFFLINE_REPORT_QUEUE_KEY, next);
      }
    });
  }

  private run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.chain.then(task);
    this.chain = result.catch(() => undefined);
    return result;
  }

  private async load(): Promise<OfflineReport[]> {
    const queue: OfflineReport[] = (await this.storage.get(OFFLINE_REPORT_QUEUE_KEY)) ?? [];
    if (this.migrated) {
      return queue;
    }

    const legacy = await this.storage.get(LEGACY_OFFLINE_REPORT_KEY);
    if (legacy) {
      let item: OfflineReport | null = null;
      try {
        item = fromLegacy(legacy);
      } catch (error) {
        // Unreadable, so it is dropped; keeping it would block every queue call.
        console.error('Old offline report is unreadable', error);
      }
      if (item && !queue.some((queued) => queued.submissionID === item.submissionID)) {
        queue.push(item);
      }
      await this.storage.set(OFFLINE_REPORT_QUEUE_KEY, queue);
      await this.storage.remove(LEGACY_OFFLINE_REPORT_KEY);
    }
    this.migrated = true;
    return queue;
  }
}

function fromLegacy(value: string): OfflineReport {
  const form = JSON.parse(value);
  const resource = form.resource ? JSON.parse(form.resource) : {};
  const queuedTimestamp = Number(resource.submittedTimestamp) || Date.now();
  return {
    // Reports from before Submission IDs still need a key in the list.
    submissionID: resource.submissionID || `legacy-${queuedTimestamp}`,
    queuedTimestamp,
    syncAttempts: 0,
    resource: form.resource,
    image1: form.image1,
    image2: form.image2,
    image3: form.image3,
  };
}
