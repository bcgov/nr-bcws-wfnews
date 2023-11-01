import { Component } from "@angular/core";
import { ResourcesRoutes } from "@app/utils";
import { AreaRestrictionListComponent } from "./area-restriction-list.component";

@Component({
  selector: 'wf-area-restriction-list-mobile',
  templateUrl: './area-restriction-list.component.mobile.html',
  styleUrls: ['./area-restriction-list.component.mobile.scss']
})
export class AreaRestrictionListComponentMobile extends AreaRestrictionListComponent {

navigateToFullDetails(item: any) {
  if (item.protRsSysID) {
    this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { areaRestrictions: true, restrictionID: item.protRsSysID } }); 
  }
} 

}
