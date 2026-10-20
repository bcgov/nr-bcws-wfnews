/**
 * Reading animation frames out of a WMS GetCapabilities document.
 * Apart from the tool so it can be unit tested: two dimension elements,
 * ISO periods, and documents that list hundreds of layers.
 */

/**
 * A capabilities document lists every layer the service publishes, so take the
 * time dimension belonging to the layer we asked for, not the first in the file.
 * WMS 1.3.0 uses `<Dimension name="time">`, 1.1.1 uses `<Extent name="time">`.
 */
export function timeDimensionFor(
  doc: Document,
  layerName?: string,
): Element | null {
  if (layerName) {
    const names = doc.getElementsByTagName('Name');
    for (let i = 0; i < names.length; i++) {
      if (names[i].textContent.trim() !== layerName) {
        continue;
      }
      const layer = names[i].parentNode as Element;
      const dim =
        layer.querySelector('Dimension[name="time"]') ||
        layer.querySelector('Extent[name="time"]');
      if (dim) {
        return dim;
      }
    }
  }

  return (
    doc.querySelector('Dimension[name="time"]') ||
    doc.querySelector('Extent[name="time"]')
  );
}

/** An ISO 8601 duration in milliseconds, the subset WMS services publish. */
export function parsePeriod(period: string): number {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    (period || '').trim(),
  );
  if (!m) {
    return 0;
  }

  return (
    (Number(m[1] || 0) * 86400 +
      Number(m[2] || 0) * 3600 +
      Number(m[3] || 0) * 60 +
      Number(m[4] || 0)) *
    1000
  );
}

/** The frame cap. A one-minute period over a year would otherwise fill memory. */
export const MAX_FRAMES = 1000;

/**
 * A dimension value is either a comma list of instants, or start/end/period.
 * Returns epoch milliseconds, oldest first.
 */
export function expandTimes(value: string): number[] {
  const out: number[] = [];

  (value || '').split(',').forEach((raw) => {
    const part = raw.trim();
    if (!part) {
      return;
    }

    const bits = part.split('/');
    if (bits.length < 3) {
      const t = Date.parse(bits[0]);
      if (!isNaN(t)) {
        out.push(t);
      }
      return;
    }

    const start = Date.parse(bits[0]);
    const end = Date.parse(bits[1]);
    const step = parsePeriod(bits[2]);
    if (isNaN(start) || isNaN(end) || !step) {
      return;
    }

    for (let t = start, n = 0; t <= end && n < MAX_FRAMES; t += step, n++) {
      out.push(t);
    }
  });

  return out.sort((a, b) => a - b);
}

/** Fetches the capabilities and returns the frames for one layer. */
export function readCapabilitiesTimes(
  url: string,
  layerName?: string,
): Promise<number[]> {
  return fetch(url)
    .then((r) => {
      if (!r.ok) {
        throw new Error('GetCapabilities ' + r.status);
      }
      return r.text();
    })
    .then((xml) => {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const el = timeDimensionFor(doc, layerName);
      return el ? expandTimes(el.textContent.trim()) : [];
    })
    .catch((e) => {
      console.warn('time-dimension: no times available:', e.message);
      return [];
    });
}
