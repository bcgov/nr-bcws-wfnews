import { Component } from "@angular/core"
import { CustomImageUploader } from "@app/components/admin-incident-form/incident-details-panel/custom-uploader";
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'admin-edit-dashboard',
  templateUrl: './edit-dashboard.component.html',
  styleUrls: ['./edit-dashboard.component.scss']
})
export class AdminEditDashboard {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public Editor = Editor;

  public situationReport
  public crewCount = 0
  public aviationCount = 0
  public incidentManagementTeamCount = 0
  public heavyEquipmentCount = 0
  public structureProtection = 0

  constructor() { }

    // for decoupled editor
    public onReady(editor) {
      editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );

      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new CustomImageUploader(loader);
    }
}
