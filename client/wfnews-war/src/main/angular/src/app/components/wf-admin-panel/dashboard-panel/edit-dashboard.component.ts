import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomImageUploader } from '@app/components/admin-incident-form/incident-details-panel/custom-uploader';
import { PublishDialogComponent } from '@app/components/admin-incident-form/publish-dialog/publish-dialog.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

export class SituationReport {
  public reportGuid: string;
  public incidentTeamCount = 0;
  public crewCount = 0;
  public aviationCount = 0;
  public heavyEquipmentCount = 0;
  public structureProtectionCount = 0;
  public situationOverview: string;
  public situationReportDate: Date;
  public publishedInd = true;
  public createdTimestamp: Date;
  public archivedInd = false;
  public revisionCount = 0;
  public createUser: string;
  public createDate: Date;
  public updateUser: string;
  public updateDate: Date;
  public type = 'http://wfnews.nrs.gov.bc.ca/v1/situationReport';
}

@Component({
  selector: 'admin-edit-dashboard',
  templateUrl: './edit-dashboard.component.html',
  styleUrls: ['./edit-dashboard.component.scss'],
})
export class AdminEditDashboard implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public Editor = Editor;
  public situationReport: SituationReport;
  public previousSituationReport: SituationReport;
  public publishDisabled = false;

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private snackbarService: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.situationReport = new SituationReport();
    this.publishedIncidentService
      .fetchSituationReportList(0, 9999, true)
      .toPromise()
      .then((results) => {
        if (results?.collection) {
          if (results.collection.length > 1) {
            results.collection.sort((a, b) =>
              new Date(a.situationReportDate) > new Date(b.situationReportDate)
                ? -1
                : new Date(b.situationReportDate) >
                    new Date(a.situationReportDate)
                  ? 1
                  : 0,
            );
          }

          this.previousSituationReport = results.collection[0];

          this.situationReport.aviationCount =
            this.previousSituationReport.aviationCount;
          this.situationReport.crewCount =
            this.previousSituationReport.crewCount;
          this.situationReport.heavyEquipmentCount =
            this.previousSituationReport.heavyEquipmentCount;
          this.situationReport.incidentTeamCount =
            this.previousSituationReport.incidentTeamCount;
          this.situationReport.structureProtectionCount =
            this.previousSituationReport.structureProtectionCount;
          this.situationReport.situationOverview =
            this.previousSituationReport.situationOverview;

          // If we have more than 1 published report returned
          // that means an archive process failed. Un-publish all reports except
          // the latest one
          const publishedReports = results.collection.filter(
            (r) => r.publishedInd,
          );
          if (publishedReports.length > 1) {
            publishedReports.sort((a, b) =>
              new Date(a.situationReportDate) > new Date(b.situationReportDate)
                ? -1
                : new Date(b.situationReportDate) >
                    new Date(a.situationReportDate)
                  ? 1
                  : 0,
            );
            for (const report of publishedReports) {
              if (
                report.reportGuid !== this.previousSituationReport.reportGuid
              ) {
                report.publishedInd = false;
                report.archivedInd = true;
                this.publishedIncidentService
                  .updateSituationReport(report)
                  .toPromise()
                  .catch((err) =>
                    console.error(`Failed to unpublish report: ${err}`),
                  );
              }
            }
          }
        }

        this.cdr.markForCheck();
      })
      .catch((err) => {
        this.snackbarService.open(
          'Failed to load Situation Report. If the issue persist contact support: ' +
            JSON.stringify(err),
          'OK',
          { duration: 100000, panelClass: 'snackbar-error' },
        );
      });
  }

  // for decoupled editor
  public onReady(editor) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement(),
      );

    editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
      new CustomImageUploader(loader);
  }

  async publishChanges() {
    this.publishDisabled = true;

    const dialogRef = this.dialog.open(PublishDialogComponent, {
      width: '350px',
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (!result?.publish) {
      this.publishDisabled = false;
      this.cdr.markForCheck();
      return;
    }

    // un-publish the previous report
    if (this.previousSituationReport) {
      try {
        this.previousSituationReport.publishedInd = false;
        this.previousSituationReport.archivedInd = true;
        (this.previousSituationReport as any)['@type'] =
          'SituationReportResource';

        await this.publishedIncidentService
          .updateSituationReport(this.previousSituationReport)
          .toPromise();
      } catch (err) {
        this.snackbarService.open(
          'Failed to un-publish previous report. Please wait a moment and try again. If the issue persist contact support: ' +
            JSON.stringify(err),
          'OK',
          { duration: 100000, panelClass: 'snackbar-error' },
        );
        this.publishDisabled = false;
        return;
      }
    }

    try {
      // create/publish the new report
      this.situationReport.publishedInd = true;
      this.situationReport.reportGuid = null;
      this.situationReport.archivedInd = false;
      this.situationReport.createdTimestamp = new Date();
      this.situationReport.situationReportDate = new Date();
      (this.situationReport as any)['@type'] = 'SituationReportResource';

      await this.publishedIncidentService
        .createSituationReport(this.situationReport)
        .toPromise();
      // notify user
      this.snackbarService.open(
        'Situation Report Published Successfully',
        'OK',
        { duration: 100000, panelClass: 'snackbar-success-v2' },
      );
    } catch (err) {
      this.snackbarService.open(
        'Failed to publish Situation report. Please wait a moment and try again. If the issue persist contact support: ' +
          JSON.stringify(err),
        'OK',
        { duration: 100000, panelClass: 'snackbar-error' },
      );
    }

    this.publishDisabled = false;
  }
}
