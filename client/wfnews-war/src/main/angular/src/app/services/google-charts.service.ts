import { Injectable } from '@angular/core';

const LOADER_SRC = 'https://www.gstatic.com/charts/loader.js';

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
  private loader: Promise<any>;

  /**
   * Loads the Google loader when a chart is drawn, and not before. The tag used to
   * sit in index.html, where it delayed the first screen by about one second on good
   * Wi-Fi, and much longer on a weak rural connection.
   */
  private load(): Promise<any> {
    if (this.loader) {
      return this.loader;
    }

    patchUserAgentForGoogleCharts();

    this.loader = new Promise<void>((resolve, reject) => {
      if (window['google']?.charts) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = LOADER_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('The Google charts loader did not load.'));
      document.head.appendChild(script);
    }).then(() => {
      const google = window['google'];
      google.charts.load('current', { packages: ['corechart'] });
      return new Promise((res) => google.charts.setOnLoadCallback(res));
    });

    return this.loader;
  }

  getVisualization() {
    return this.load().then(() => window['google'].visualization);
  }
}
