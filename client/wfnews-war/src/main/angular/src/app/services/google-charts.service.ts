import { Injectable } from '@angular/core';

@Injectable()
export class GoogleChartsService {
  private loaded: Promise<any>;

  constructor() {
    const google = window['google'];
    google.charts.load('current', { packages: ['corechart'] });
  }

  getVisualization() {
    const google = window['google'];

    return new Promise(function(res, rej) {
      google.charts.setOnLoadCallback(res);
    }).then(function() {
      return google.visualization;
    });
  }
}
