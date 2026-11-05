import * as turf from '@turf/turf';

export function extractPolygonData(response) {
  let polygonData = [];

  for (const element of response) {
    polygonData = polygonData.concat(element);
  }

  return polygonData;
}

function createConvex(polygonData) {
  const turfPoints = polygonData.map(coord => turf.point(coord));
  const pointsFeatureCollection = turf.featureCollection(turfPoints);
  const convexHull = turf.convex(pointsFeatureCollection)?.geometry?.coordinates[0];
  return convexHull;
}

/** The [[minLat, minLng], [maxLat, maxLng]] box around the points' convex hull. */
export function getPolygonBond(polygonData) {
  const convex = createConvex(polygonData);
  const bounds = convex?.reduce((acc, coord) => [
    [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
    [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
  ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
  return bounds;
}
