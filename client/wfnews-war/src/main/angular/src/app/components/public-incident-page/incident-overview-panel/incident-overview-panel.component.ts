import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { isMobileView } from '@app/utils';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import { AppConfigService } from '@wf1/core-ui';

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

  public getResponseTypeDescription(code: string) {
    if (code === 'MONITOR') {
      return 'When a fire is being monitored, this means BC Wildfire Service is observing and analyzing the fire but it\'s not immediately suppressed. It may be allowed to burn to achieve ecological or resource management objectives and is used on remote fires that do not threaten values.';
    } else if (code === 'MODIFIED') {
      return 'During a modified response, a wildfire is managed using a combination of techniques with the goal to minimize damage while maximizing ecological benefits from the fire. This response method is used when there is no immediate threat to values.';
    } else if (code === 'FULL') {
      return 'The suppression of an unwanted wildfire to limit spread.';
    }
  }
}
