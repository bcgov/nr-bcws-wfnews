import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { isMobileView } from '@app/utils';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import { AppConfigService } from '@wf1/core-ui';
import { getResponseTypeDescription } from '../../../utils/index';

@Component({
  selector: 'incident-overview-panel',
  templateUrl: './incident-overview-panel.component.html',
  styleUrls: ['./incident-overview-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentOverviewPanel {
  @Input() public incident;

  public Editor = Editor;
  public isMobileView = isMobileView;
  public getResponseTypeDescription = getResponseTypeDescription;

  constructor(
    private sanitizer: DomSanitizer,
    protected appConfigService: AppConfigService,
  ) {}

  formatHtml(html: string) {
    return html; // We don't want to execute script tags:: this.sanitizer.bypassSecurityTrustHtml(html)
  }

  public printPage() {
    const printContents =
      document.getElementsByClassName('page-container')[0].innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  }

  public onReady(editor) {
    editor.enableReadOnlyMode('ck-doc');
  }
}
