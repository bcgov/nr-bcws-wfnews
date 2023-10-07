import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { WFMapService } from '@app/services/wf-map.service';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'app-wildfires-list-header',
  templateUrl: './wildfires-list-header.component.html',
  styleUrls: ['./wildfires-list-header.component.scss']
})
export class WildfiresListHeaderComponent {

  public selectedTab = 0

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    protected matIconRegistry: MatIconRegistry,
    protected cdr: ChangeDetectorRef,
    protected dialog: MatDialog,
    protected wfMapService: WFMapService
  ) {
  }

  selectTab (tab: number) {
    this.selectedTab = tab
    // swap to the desired tab
    this.cdr.detectChanges();
  }

}
