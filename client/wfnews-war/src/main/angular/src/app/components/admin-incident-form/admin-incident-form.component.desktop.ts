import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminIncidentForm } from './admin-incident-form.component';

@Component({
    selector: 'wf-admin-incident-desktop',
    templateUrl: './admin-incident-form.component.html',
    styleUrls: [
      '../common/base-collection/collection.component.scss',
      './admin-incident-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })

export class AdminIncidentFormDesktop extends AdminIncidentForm {
}
