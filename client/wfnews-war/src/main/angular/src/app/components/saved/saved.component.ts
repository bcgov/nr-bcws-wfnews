import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wfnews-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})

export class SavedComponent {
  public savedLocations: any = [];
  public savedWildfires: any = [];

  constructor(
    protected router: Router,
  ) {
  }

  addNewLocation() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }
}
