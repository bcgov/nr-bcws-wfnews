import { Component, Input } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'related-topics-card',
  templateUrl: './related-topics-card.component.html',
  styleUrls: ['./related-topics-card.component.scss']
})
export class RelatedTopicsCardComponent {
  @Input() links?: RelatedTopicsLink[];
  evacueeGuidanceUrl = this.appConfigService.getConfig().externalAppConfig['evacueeGuidanceUrl'].toString();
  localGovSystemsurl = this.appConfigService.getConfig().externalAppConfig['localGovernmentSystemsUrl'].toString();
  emargencyAlertsUrl = this.appConfigService.getConfig().externalAppConfig['emergencyAlertsUrl'].toString();

  constructor(private appConfigService: AppConfigService) {}
}

export interface RelatedTopicsLink {
  text: string;
  url: string;
}

/** The Related Topics of a fire ban, the same on the desktop and the phone page. */
export function fireBanRelatedTopics(appConfigService: AppConfigService): RelatedTopicsLink[] {
  const external = appConfigService.getConfig().externalAppConfig;
  return [
    { text: 'Current Fire Bans and Restrictions', url: external['bansRestrictionsUrl'].toString() },
    { text: 'Forest Use Restrictions', url: external['bansForestUseUrl'].toString() },
    { text: 'Open Burning', url: external['bansOpenBurningUrl'].toString() },
  ];
}

/** The Related Topics of an area restriction. */
export function areaRestrictionRelatedTopics(appConfigService: AppConfigService): RelatedTopicsLink[] {
  const external = appConfigService.getConfig().externalAppConfig;
  return [
    { text: 'Current Area Restrictions', url: external['currentRestrictions'].toString() },
    { text: 'Recreational Sites and Trail Closures', url: external['recSiteTrailsClosures'].toString() },
    { text: 'BC Parks Closures', url: external['parksClosures'].toString() },
  ];
}

/** The Related Topics of a danger rating. */
export function dangerRatingRelatedTopics(appConfigService: AppConfigService): RelatedTopicsLink[] {
  const external = appConfigService.getConfig().externalAppConfig;
  return [
    { text: 'Fire Danger Rating', url: external['fireDangerUrl'].toString() },
    { text: 'Current Fire Bans and Restrictions', url: external['bansRestrictionsUrl'].toString() },
    { text: 'Fire Danger Class', url: external['dangerSummary'].toString() },
    { text: 'High Risk Activities', url: external['highRiskActvitiesUrl'].toString() },
  ];
}
