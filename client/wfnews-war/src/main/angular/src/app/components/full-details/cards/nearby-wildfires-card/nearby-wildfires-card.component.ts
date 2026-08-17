import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleIncident } from '@app/services/published-incident-service';

@Component({
  selector: 'nearby-wildfires-card',
  templateUrl: './nearby-wildfires-card.component.html',
  styleUrls: ['./nearby-wildfires-card.component.scss']
})
export class NearbyWildfiresCardComponent {

  @Input() incidents: SimpleIncident[] = [];
  @Input() bookmarkedIncidentNumbers: string[] = [];

  @Output() bookmarkClicked = new EventEmitter<{ incident: SimpleIncident; isBookmarked: boolean }>();
  @Output() viewDetailsClicked = new EventEmitter<SimpleIncident>();

  isBookmarked = (incident: SimpleIncident) =>
    this.bookmarkedIncidentNumbers?.includes(incident?.fireYear + ':' + incident?.incidentNumberLabel);

  getBookmarkIconPath = (incident: SimpleIncident) =>
    this.isBookmarked(incident) ? 'assets/images/svg-icons/bookmark-blue.svg' : 'assets/images/svg-icons/bookmark.svg';

  toggleBookmark = (incident: SimpleIncident) => {
    this.bookmarkClicked.emit({ incident, isBookmarked: !this.isBookmarked(incident) });
  };

  onViewDetailsClicked = (incident: SimpleIncident) => this.viewDetailsClicked.emit(incident);

}