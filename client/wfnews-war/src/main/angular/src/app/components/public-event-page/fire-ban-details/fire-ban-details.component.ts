import { Component, Input, OnInit } from '@angular/core';
import { AdvisorySectionStyle } from '@app/components/common/advisory-section/advisory-section.component';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'fire-ban-details',
  templateUrl: './fire-ban-details.component.html',
  styleUrls: ['./fire-ban-details.component.scss']
})
export class FireBanDetailsComponent implements OnInit {

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
  advisorySectionButtonArgs: IconButtonArgs = {
    label: 'Go to the Bulletin',
    iconPath: '/assets/images/svg-icons/link.svg',
    componentStyle: {
      backgroundColor: '#036',
      labelColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      border: 'none'
    }
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
