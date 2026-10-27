/**
 * The DOM elements a MapLibre marker draws.
 *
 * This file imports nothing, so both `utils/index.ts` and `utils/preview-map.ts`
 * can use it without an import cycle.
 */

/**
 * The marker for a selected Incident: its icon, pinged by the marker-ping SCSS.
 * iconUrl is the stage or fire of note SVG, so it matches every other marker.
 */
export function animatedIcon(iconUrl?: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'animated-icon marker-ping';
  if (iconUrl) {
    el.style.backgroundImage = `url("${iconUrl}")`;
  } else {
    el.style.backgroundColor = '#355992';
  }
  el.style.pointerEvents = 'none';
  return el;
}

/** Plays the ping again; the reflow between the class changes restarts the CSS animation. */
export function replayPing(el: HTMLElement | null): void {
  if (!el) {
    return;
  }
  el.classList.remove('marker-ping');
  // A call, because the production minifier removes a bare offsetWidth read.
  el.getBoundingClientRect();
  el.classList.add('marker-ping');
}

/** Pings any marker element; an img cannot carry the ring itself, so it is wrapped. */
export function pingMarker(marker: HTMLElement): HTMLElement {
  const el = document.createElement('div');
  el.className = 'marker-ping';
  el.style.pointerEvents = 'none';
  el.appendChild(marker);
  return el;
}

/** The pin a preview panel drops on the place it zooms to. */
export function pinDropElement(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-icon-class';
  el.innerHTML =
    '<div class="custom-marker" style="margin-top:-30px">' +
    '<img alt="icon" src="/assets/images/svg-icons/pin-drop.svg"/></div>';
  el.style.pointerEvents = 'none';
  return el;
}
