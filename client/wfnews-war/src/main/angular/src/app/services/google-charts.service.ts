import { Injectable } from '@angular/core';

function patchUserAgentForGoogleCharts() {
  try {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent || '';
      if (ua.includes('bc-wildfire') && !/WebKit|Chrome|Safari|Gecko/i.test(ua)) {
        const isIos = ua.includes('ios');
        const fallbackUA = isIos
          ? `Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Safari/604.1 ${ua}`
          : `Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 Chrome/100.0.0.0 Mobile Safari/537.36 ${ua}`;

        Object.defineProperty(window.navigator, 'userAgent', {
          get: () => fallbackUA,
          configurable: true,
        });
      }
    }
  } catch (e) {
    console.warn('Could not patch userAgent for Google Charts', e);
  }
}

@Injectable()
export class GoogleChartsService {
  private loaded: Promise<any>;

  constructor() {
    patchUserAgentForGoogleCharts();
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
