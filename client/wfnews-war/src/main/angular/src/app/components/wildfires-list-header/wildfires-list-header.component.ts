import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { WFMapService } from '@app/services/wf-map.service';
import { isMobileView } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'app-wildfires-list-header',
  templateUrl: './wildfires-list-header.component.html',
  styleUrls: ['./wildfires-list-header.component.scss'],
})
export class WildfiresListHeaderComponent implements OnInit {
  public selectedTab = 0;

  public isMobileView = isMobileView;

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    private activatedRoute: ActivatedRoute,
    protected matIconRegistry: MatIconRegistry,
    protected cdr: ChangeDetectorRef,
    protected dialog: MatDialog,
    protected wfMapService: WFMapService,
  ) {}

  selectTab(tab: number) {
    this.selectedTab = tab;
    // swap to the desired tab
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['tab']) {
        const tab = params['tab'];
        this.selectTab(Number(tab));
      }
    });
  }
}
