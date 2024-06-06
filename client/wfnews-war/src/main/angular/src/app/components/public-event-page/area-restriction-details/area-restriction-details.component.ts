import { Component, Input } from '@angular/core';
import { AdvisorySectionStyle } from '@app/components/common/advisory-section/advisory-section.component';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'area-restriction-details',
  templateUrl: './area-restriction-details.component.html',
  styleUrls: ['./area-restriction-details.component.scss']
})
export class AreaRestrictionDetailsComponent {

  @Input() areaRestriction: any;

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
    },
    clickHandler: () => {
      window.open(this.getBulletinLink(), '_blank');
    }
  };

  relatedTopicLinks: RelatedTopicsLink[] = [
    { 
      text: 'Current Area Restrictions', 
      url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions' 
    },
    { 
      text: 'Recreational Sites and Trail Closures', 
      url: 'https://www.sitesandtrailsbc.ca/closures.aspx' 
    },
    { 
      text: 'BC Parks Closures', 
      url: 'https://bcparks.ca/active-advisories/?type=wildfire' 
    },
  ];

  constructor( private appConfigService: AppConfigService ) {}

  getBulletinLink() {
    return this.areaRestriction?.attributes.BULLETIN_URL 
      || this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string;
  }
}
