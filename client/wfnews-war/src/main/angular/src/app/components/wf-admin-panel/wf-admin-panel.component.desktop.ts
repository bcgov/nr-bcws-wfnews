import { ChangeDetectionStrategy, Component } from "@angular/core";
import { WfAdminPanelComponent } from "./wf-admin-panel.component";

@Component({
    selector: 'wf-admin-panel-desktop',
    templateUrl: './wf-admin-panel.component.desktop.html',
    styleUrls: [
      '../common/base-collection/collection.component.scss',
      './wf-admin-panel.component.desktop.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })

export class WfAdminPanelComponentDesktop extends WfAdminPanelComponent {
    columnsToDisplay = ["fireNumber", "fireName", "fireCentre", "wildFireOfNote", "lastUpdated"];
}
