import { model } from 'geomagnetism';

/**
 * Degrees from true north to magnetic north at a place, east positive (WMM).
 * Past the model's end date it keeps the last model rather than throwing.
 */
export function declinationAt(latitude: number, longitude: number, when = new Date()): number {
  return model(when, { allowOutOfBoundsModel: true }).point([latitude, longitude]).decl;
}

/** A compass reading from magnetic north, turned to true north, from 0 to under 360. */
export function toTrueNorth(magneticHeading: number, declination: number): number {
  return (((magneticHeading + declination) % 360) + 360) % 360;
}
