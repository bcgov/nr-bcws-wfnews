import { Component } from '@angular/core';
import { EvacListComponent } from './evac-list.component';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wf-evac-list-mobile',
  templateUrl: './evac-list.component.mobile.html',
  styleUrls: ['./evac-list.component.mobile.scss'],
})
export class EvacListComponentMobile extends EvacListComponent {
  navToFullDetails(item: any) {
    let type: string;
    if (item && item.status && item.emrgOAAsysID !== undefined && item.emrgOAAsysID !== null) {
      switch (item.status) {
          case 'Alert':
              type = 'evac-alert';
              break;
          case 'Order':
              type = 'evac-order';
              break;
          default:
              console.error('Invalid status for evacuation: ' + item.emrgOAAsysID);
              break;
      }
    }
    this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
      queryParams: {
        type,
        id: item.emrgOAAsysID,
        source: [ResourcesRoutes.WILDFIRESLIST],
      },
    });
  }
}
