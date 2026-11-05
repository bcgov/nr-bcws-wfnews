import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';

@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
  sortAddressList(results: any, value: string) {
    let address = null;
    let trimmedAddress = null;
    let valueLength = null;
    let valueMatch = null;
    results.forEach((result) => {
      address = this.getFullAddress(result);
      result.address = address.trim();
      trimmedAddress = result.address;
      valueLength = value.length;
      if (trimmedAddress != null) {
        valueMatch = trimmedAddress.substring(0, valueLength);
      }

      if (
        address != null &&
        valueLength != null &&
        valueMatch != null &&
        (value.toUpperCase() === address.toUpperCase() ||
          value.toUpperCase() === valueMatch.toUpperCase())
      ) {
        const index = results.indexOf(result);
        if (index !== -1) {
          results.splice(index, 1);
        }
        const resultToBeUnshifted = result;

        results.unshift(resultToBeUnshifted);
      }
    });

    return results;
  }

  getFullAddress(location) {
    let result = '';

    if (location.civicNumber) {
      result += location.civicNumber;
    }

    if (location.streetName) {
      result += ' ' + location.streetName;
    }

    if (location.streetQualifier) {
      result += ' ' + location.streetQualifier;
    }

    if (location.streetType) {
      result += ' ' + location.streetType;
    }

    return result;
  }

  isIPhone(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone/.test(userAgent);
  }

  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLon = this.deg2rad(lon2 - lon1);
    const x = Math.sin(dLon) * Math.cos(this.deg2rad(lat2));
    const y =
      Math.cos(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) -
      Math.sin(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.cos(dLon);
    const bearing = Math.atan2(x, y);
    const bearingDegrees = this.rad2deg(bearing);
    return (bearingDegrees + 360) % 360;
  }

  formatDDM(decimal: number) {
    decimal = Math.abs(decimal);
    const d = Math.abs(Math.trunc(decimal));
    return d + '° ' + (60 * (decimal - d)).toFixed(3) + '\'';
  }

  isAttributePresent(array, attributeName, attributeValue) {
    return array.some(existingItem => existingItem.attributes[attributeName] === attributeValue);
  }

  checkIfLandscapeMode() {
    // also return true if this is table portrait mode wfnews-2022. 
    if (
      (window.innerWidth > window.innerHeight) ||
      (window.innerWidth <= 1024 && window.innerWidth >= 768 && window.innerHeight > window.innerWidth)) {
      return true;
    } else {
      return false;
    }
  }

  hasSQLKeywords(jsonBlob) {
    //detect standalone sql words
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b(?!\s*\*)/i;
    const sqlDetected = sqlKeywords.test(jsonBlob);
    return sqlDetected;
  }

  extractPolygonData(response) {
    let polygonData = [];

    for (const element of response) {
      polygonData = polygonData.concat(element);
    }

    return polygonData;
  }

  createConvex(polygonData) {
    const turfPoints = polygonData.map(coord => turf.point(coord));
    const pointsFeatureCollection = turf.featureCollection(turfPoints);
    const convexHull = turf.convex(pointsFeatureCollection)?.geometry?.coordinates[0];
    return convexHull;
  }

  getPolygonBond(polygonData) {
    const convex = this.createConvex(polygonData);
    const bounds = convex?.reduce((acc, coord) => [
      [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
      [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
    ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
    return bounds;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }

}
