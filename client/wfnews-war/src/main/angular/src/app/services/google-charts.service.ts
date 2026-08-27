import { Injectable } from '@angular/core';

const LOADER_SRC = 'https://www.gstatic.com/charts/loader.js';

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
