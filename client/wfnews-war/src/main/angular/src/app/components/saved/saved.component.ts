import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@app/services/notification.service';
import { ResourcesRoutes } from '@app/utils';

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
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
      // Fetch the notificationSettings.
      this.notificationService.getUserNotificationPreferences().then(response =>{
        this.savedLocations = response.notifications;
        this.cdr.detectChanges()
      }). catch(error => {
        console.log(error)
      }
    )
  }
  addNewLocation() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }
}
