import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

if (environment.production) {
  enableProdMode();
}

// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  // The boot watchdog in index.html waits on this instead of guessing from a timer.
  .then(() => {
    (window as any).__wfnewsBooted = true;
  })
  .catch(console.warn);
