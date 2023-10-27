import { Component, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'wfnews-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss']
})
export class FullDetailsComponent implements OnInit {
  router: ActivatedRoute;
  areaRestrictions: boolean;
  restrictionID: string

constructor(router: ActivatedRoute){
  this.router = router;
}

 ngOnInit(): void {
  this.router.queryParams.subscribe((params: ParamMap) => {
    if (params && params['areaRestrictions'] && params['restrictionID']) {
    this.areaRestrictions = true
    this.restrictionID = params['restrictionID'];
 }
});

 }

}
