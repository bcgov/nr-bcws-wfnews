import { Component } from '@angular/core';
import { BansListComponent } from './bans-list.component';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wf-bans-list-mobile',
  templateUrl: './bans-list.component.mobile.html',
  styleUrls: ['./bans-list.component.mobile.scss'],
})
export class BansListComponentMobile extends BansListComponent {
  navigateToFullDetails(item: any) {
    if (item.id !== undefined && item.id !== null) {
      this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
        queryParams: {
          type: 'bans-prohibitions',
          id: item.id,
          source: [ResourcesRoutes.WILDFIRESLIST],
        },
      });
    }
  }
}
