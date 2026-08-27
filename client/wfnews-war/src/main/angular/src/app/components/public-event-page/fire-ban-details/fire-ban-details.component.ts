import { Component, Input, OnInit } from '@angular/core';
import {
  AdvisoryButtonArgs,
  AdvisorySectionStyle,
} from '@app/components/common/advisory-section/advisory-section.component';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { AppConfigService } from '@wf1/core-ui';
import { INFORMATION_TEXTS } from '../../../constants';

@Component({
  selector: 'fire-ban-details',
  templateUrl: './fire-ban-details.component.html',
  styleUrls: ['./fire-ban-details.component.scss']
})
export class FireBanDetailsComponent implements OnInit {

  infoBulletinText = INFORMATION_TEXTS.LEGAL_ORDERS_INFO_BULLETIN;

  @Input() fireBan: any;

  category = {};

  advisorySectionComponentStyle: AdvisorySectionStyle = {
    backgroundColor: '#F0F5FF',
    dividerColor: '#DBDFED',
    outerBorderColor: '#DBDFED',
    logo: {
      logoPath: '/assets/images/logo/bc-wildfire-service-logo-transparent.png',
      width: 274,
      height: 80
    },
    icon: {
      iconPath: '/assets/images/svg-icons/carbon_bullhorn-selected.svg',
      iconCircleColor: '#D9DEEE',
    }
  };
  advisorySectionButtonArgs: AdvisoryButtonArgs = {
    label: 'Go to the Bulletin',
    iconPath: '/assets/images/svg-icons/link.svg',
    variant: 'primary',
  };

  relatedTopicLinks: RelatedTopicsLink[] = [
    { 
      text: 'Current Fire Bans and Restrictions', 
      url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions' 
    },
    { 
      text: 'Forest Use Restrictions', 
      url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions/forest-use-restrictions' 
    },
    { 
      text: 'Open Burning', 
      url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions/open-burning' 
    },
  ];

  constructor( private appConfigService: AppConfigService ) {
  }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.category[1] = this.fireBan?.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('1') 
      || this.fireBan?.attributes.ACCESS_PROHIBITION_DESCRIPTION.toLowerCase().includes('campfires');
    this.category[2] = this.fireBan?.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('2');
    this.category[3] = this.fireBan?.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('3');
  }

  getBulletinLink() {
    return this.fireBan?.attributes.BULLETIN_URL 
      || this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string;
  }

  handleAdvisoryClick = () => {
    window.open(this.getBulletinLink(), '_blank');
  };
  
}
