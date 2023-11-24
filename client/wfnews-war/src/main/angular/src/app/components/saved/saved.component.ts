import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@app/services/notification.service';
import { ResourcesRoutes } from '@app/utils';
import { SpatialUtilsService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})

export class SavedComponent implements OnInit {
  public savedLocations: any = [];
  public savedWildfires: any = [];

  constructor(
    protected router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    protected spatialUtilService: SpatialUtilsService,
  ) {
  }

  ngOnInit(): void {
      // Fetch the notificationSettings.
      this.notificationService.getUserNotificationPreferences().then(response =>{
        if (response.notifications){
          this.savedLocations = response.notifications;
        }
        this.cdr.detectChanges()
      }). catch(error => {
        console.log(error)
      }
    )
  }
  addNewLocation() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }

  getFormattedCoords(coords): string {
    return this.spatialUtilService.formatCoordinates([coords[0],coords[1]]);
  }
}
