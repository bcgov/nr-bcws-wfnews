import { Component } from '@angular/core';
import { ReportOfFire } from '@app/components/report-of-fire/reportOfFireModel';
import { RoFPage } from '@app/components/report-of-fire/rofPage';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'rof-call-page',
  templateUrl: './rof-call-page.component.html',
  styleUrls: ['./rof-call-page.component.scss'],
})
export class RofCallPage extends RoFPage {
  location: any;

  callInfo = [
    {
      title: 'Location',
      info: 'Where is the fire? How far up the hillside? Closest intersection?',
    },
    {
      title: 'Size',
      info: 'Metres? Hectares? Size of a house? Size of a football field?',
    },
    { title: 'Rate of spread', info: 'How quickly is the fire spreading?' },
    { title: 'Fuel', info: 'What is burning? Grass, bushes, trees?' },
    {
      title: 'Smoke/flames',
      info: 'What colour is the smoke? Are the flames visible?',
    },
    { title: 'Threat', info: 'Are there any people or buildings at risk?' },
    { title: 'Action', info: 'Is anyone fighting the fire?' },
    {
      title: 'Campfires',
      info: 'Can you tell if it is wood burning or is it a propane campfire?',
    },
  ];

  public constructor(
    private appConfig: AppConfigService,
    private commonUtilityService: CommonUtilityService,
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.message = data.message.split('\n');
    this.useMyCurrentLocation();
  }

  call() {
    const rofPhoneNumber = this.appConfig
      .getConfig()
      .externalAppConfig['contactInformation']['rofPhoneNumber'].toString();
    const phoneNumber = 'tel:' + rofPhoneNumber;
    window.open(phoneNumber, '_blank');
  }

  async useMyCurrentLocation() {
    this.location = await this.commonUtilityService.getCurrentLocationPromise();
  }

  formate(coordinate) {
    return this.commonUtilityService.formatDDM(Number(coordinate));
  }
}
