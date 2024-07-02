import { AfterViewInit, Component, Input } from '@angular/core';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'incident-response-panel',
  templateUrl: './incident-response-panel.component.html',
  styleUrls: ['./incident-response-panel.component.scss']
})
export class IncidentResponsePanelComponent implements AfterViewInit {

  @Input() incident;

  public editor = Editor;
  public responseDisclaimer: string;

  ngAfterViewInit() {
    this.responseDisclaimer = this.incident?.resourceDetail;
  }

  public onReady(editor) {
    editor.enableReadOnlyMode('ck-doc');
  }
}
