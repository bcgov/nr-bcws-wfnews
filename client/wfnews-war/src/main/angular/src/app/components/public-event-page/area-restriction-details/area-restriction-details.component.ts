import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AdvisoryButtonArgs,
  AdvisorySectionStyle,
} from '@app/components/common/advisory-section/advisory-section.component';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { SimpleIncident } from '@app/services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'area-restriction-details',
  templateUrl: './area-restriction-details.component.html',
  styleUrls: ['./area-restriction-details.component.scss']
})
export class AreaRestrictionDetailsComponent {

  @Input() areaRestriction: any;
  @Input() incidents: SimpleIncident[];
  @Input() bookmarkedIncidentNumbers: string[] = [];

  @Output() bookmarkClicked = new EventEmitter<{ incident: SimpleIncident; isBookmarked: boolean }>();

  @Output() viewDetailsClicked = new EventEmitter<SimpleIncident>();

  isBookmarked = (incident: SimpleIncident) => this.bookmarkedIncidentNumbers?.includes(incident?.incidentNumber);

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
      text: 'Current Area Restrictions',
      url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions'
    },
    {
      text: 'Recreational Sites and Trail Closures',
      url: 'https://www.sitesandtrailsbc.ca/search?status=closed&view=list'
    },
    {
      text: 'BC Parks Closures',
      url: 'https://bcparks.ca/active-advisories/?type=wildfire'
    },
  ];

  constructor(private appConfigService: AppConfigService) { }

  getBulletinLink() {
    return this.areaRestriction?.attributes.BULLETIN_URL
      || this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string;
  }

  handleAdvisoryClick = () => {
    window.open(this.getBulletinLink(), '_blank');
  };

  handleBookmarkClicked = (incident: SimpleIncident, isBookmarked: boolean) => {
    this.bookmarkClicked.emit({ incident, isBookmarked });
  };

  handleViewDetailsClicked = (incident: SimpleIncident) => {
    this.viewDetailsClicked.emit(incident);
  };

}
