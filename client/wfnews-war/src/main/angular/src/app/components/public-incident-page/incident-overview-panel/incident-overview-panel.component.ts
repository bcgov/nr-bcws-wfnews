import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'incident-overview-panel',
  templateUrl: './incident-overview-panel.component.html',
  styleUrls: ['./incident-overview-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentOverviewPanel {
  @Input() public incident

  public Editor = Editor

  constructor (private sanitizer: DomSanitizer) { }

  formatHtml (html: string) {
    return html // We don't want to execute script tags:: this.sanitizer.bypassSecurityTrustHtml(html)
  }

  public printPage() {
    const printContents = document.getElementsByClassName('page-container')[0].innerHTML
    const originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
  }

  public onReady( editor ) {
    editor.enableReadOnlyMode('ck-doc')
  }
}
