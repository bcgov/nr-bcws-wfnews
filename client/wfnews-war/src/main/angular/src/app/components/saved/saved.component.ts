import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wfnews-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})

export class SavedComponent {

  constructor(
    protected router: Router,
  ) {
  }
  openAddLocationPage(){
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }
}
