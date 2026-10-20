/**
 * The DOM elements a MapLibre marker draws, in place of Leaflet's divIcon.
 *
 * This file imports nothing, so both `utils/index.ts` and `utils/preview-map.ts`
 * can use it without an import cycle.
 */

/** The pulsing dot that marks a selected Incident. The SCSS owns its size. */
export function animatedIcon(fillColour?: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'animated-icon';
  if (fillColour) {
    el.style.backgroundColor = fillColour;
  }
  el.style.pointerEvents = 'none';
  return el;
}

/**
 * One beat of the marker. MapLibre centres the element with a percent
 * transform, so a size change re-centres it and no margin is needed.
 */
export function pulse(icon: HTMLElement): void {
  const grow = icon.style.width === '10px';
  icon.style.width = grow ? '20px' : '10px';
  icon.style.height = grow ? '20px' : '10px';
  icon.style.boxShadow = grow
    ? '4px 4px 4px rgba(0, 0, 0, 0.65)'
    : '0px 0px 0px transparent';
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
