import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AGOLService } from '@app/services/AGOL-service';
import { snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import moment from 'moment';

@Component({
  selector: 'evacuations-widget',
  templateUrl: './evacuations-widget.component.html',
  styleUrls: ['./evacuations-widget.component.scss'],
})
export class EvacuationsWidget implements AfterViewInit {
  public startupComplete = false;
  public evacOrders = 0;
  public evacAlerts = 0;
  public evacList = [];
  public snowPlowHelper = snowPlowHelper

  constructor(private agolService: AGOLService,
    private appConfigService: AppConfigService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.agolService
      .getEvacOrders(null, null, {
        returnCentroid: false,
        returnGeometry: false,
      })
      .toPromise()
      .then((evacs) => {
        if (evacs?.features) {
          this.evacOrders = evacs.features.filter(
            (e) => e.attributes.ORDER_ALERT_STATUS === 'Order',
          ).length;
          this.evacAlerts = evacs.features.filter(
            (e) => e.attributes.ORDER_ALERT_STATUS === 'Alert',
          ).length;

          for (const element of evacs.features) {
            this.evacList.push({
              name: element.attributes.EVENT_NAME,
              eventType: element.attributes.EVENT_TYPE,
              status: element.attributes.ORDER_ALERT_STATUS,
              agency: element.attributes.ISSUING_AGENCY,
              preOcCode: element.attributes.PREOC_CODE,
              emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
              issuedOn: this.convertToDate(element.attributes.DATE_MODIFIED),
              issuedOnRaw: element.attributes.DATE_MODIFIED,
            });
          }

          // sort the list by date
          this.evacList.sort((a, b) =>
            a.issuedOnRaw > b.issuedOnRaw
              ? -1
              : b.issuedOnRaw > a.issuedOnRaw
                ? 1
                : 0,
          );
          // only keep the first 4
          if (this.evacList.length > 4) {
            this.evacList = this.evacList.slice(0, 4);
          }
        }

        this.startupComplete = true;
      });
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  snowplowCaller() {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.snowPlowHelper(url, {
      action: 'dashboard_click',
      text: 'Evacuations View All',
    });
  }
}
