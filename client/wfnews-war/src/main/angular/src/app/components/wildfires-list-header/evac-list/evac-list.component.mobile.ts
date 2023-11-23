import { Component } from "@angular/core";
import { EvacListComponent } from "./evac-list.component";
import { ResourcesRoutes } from "@app/utils";

@Component({
    selector: 'wf-evac-list-mobile',
    templateUrl: './evac-list.component.mobile.html',
    styleUrls: ['./evac-list.component.mobile.scss']
  })

export class EvacListComponentMobile extends EvacListComponent {

  navToFullDetails(item: any) {
    let type: string;
    if (item && item.status && item.emrgOAAsysID) {
      if (item.status === 'Alert') type = "evac-alert";
      else if (item.status === 'Order') type = "evac-order";
      else console.error('Inavlid status for evacuation: ' + item.emrgOAAsysID);
    }
    this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { type: type, id: item.emrgOAAsysID, source: [ResourcesRoutes.WILDFIRESLIST] } }); 
  }

}
