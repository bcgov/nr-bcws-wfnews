import { Component, Input } from '@angular/core';
import { DISCLAIMER_TEXT } from '@app/constants';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'incident-response-panel',
  templateUrl: './incident-response-panel.component.html',
  styleUrls: ['./incident-response-panel.component.scss']
})
export class IncidentResponsePanelComponent {

  @Input() incident;

  responseDisclaimer = DISCLAIMER_TEXT.RESPONSE;

  public editor = Editor;

  public onReady(editor) {
    editor.enableReadOnlyMode('ck-doc');
  }
}
