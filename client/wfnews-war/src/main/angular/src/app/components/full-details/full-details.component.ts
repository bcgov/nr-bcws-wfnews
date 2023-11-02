import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wfnews-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss']
})
export class FullDetailsComponent implements OnInit {
  public params: ParamMap

  constructor(private router: ActivatedRoute, private route: Router) {
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: ParamMap) => {
      this.params = params
    })
  }

  back() {
    if (this.params && this.params['source']){
      this.route.navigate(this.params['source']);
    }
    else this.route.navigate([ResourcesRoutes.DASHBOARD]);
  }

  exit() {
    this.route.navigate([ResourcesRoutes.DASHBOARD]);
  }


}
