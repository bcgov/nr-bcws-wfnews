function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function rad2deg(rad: number): number {
  return rad * (180 / Math.PI);
}

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLon = deg2rad(lon2 - lon1);
  const x = Math.sin(dLon) * Math.cos(deg2rad(lat2));
  const y =
    Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
    Math.sin(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.cos(dLon);
  const bearing = Math.atan2(x, y);
  const bearingDegrees = rad2deg(bearing);
  return (bearingDegrees + 360) % 360;
}

/** Degrees and decimal minutes, without the sign. */
export function formatDDM(decimal: number) {
  decimal = Math.abs(decimal);
  const d = Math.abs(Math.trunc(decimal));
  return d + '° ' + (60 * (decimal - d)).toFixed(3) + '\'';
}
