import { of } from 'rxjs';
import { PublicIncidentPageComponent } from './public-incident-page.component';
import { IncidentTabsComponent } from './incident-tabs/incident-tabs.component';

describe('PublicIncidentPageComponent - Tab Selection and Sharing', () => {
  let component: PublicIncidentPageComponent;
  let mockActivatedRoute: any;
  let mockCdr: any;
  let mockAgolService: any;
  let mockPublishedIncidentService: any;
  let mockHttp: any;
  let mockAppConfigService: any;
  let mockCurrentRouter: any;

  beforeEach(() => {
    mockActivatedRoute = {
      queryParams: of({ incidentNumber: 'K50123', fireYear: '2024' }),
      snapshot: { queryParams: {} },
    };
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockAgolService = {
      getFirePerimetre: jasmine.createSpy('getFirePerimetre').and.returnValue(of({ extent: null })),
      getEvacOrdersByEventNumber: jasmine.createSpy('getEvacOrdersByEventNumber').and.returnValue(of({ features: [] })),
      getAreaRestrictions: jasmine.createSpy('getAreaRestrictions').and.returnValue(of({ features: [] })),
    };
    mockPublishedIncidentService = {
      fetchPublishedIncident: jasmine.createSpy('fetchPublishedIncident').and.returnValue(
        of({
          incidentName: 'Test Fire',
          latitude: 50.1,
          longitude: -120.1,
          incidentSizeEstimatedHa: 100,
          declaredOutDate: null,
          lastUpdatedTimestamp: 1620000000000,
          discoveryDate: 1610000000000,
          updateDate: 1620000000000,
          contactOrgUnitIdentifer: '123',
        })
      ),
      fetchExternalUri: jasmine.createSpy('fetchExternalUri').and.returnValue(of({ collection: [] })),
      fetchPublishedIncidentAttachments: jasmine.createSpy('fetchPublishedIncidentAttachments').and.returnValue(of({ collection: [] })),
      fetchAttachments: jasmine.createSpy('fetchAttachments').and.returnValue(of({ collection: [] })),
    };
    mockHttp = {
      get: jasmine.createSpy('get').and.returnValue(of({})),
    };
    mockAppConfigService = {
      getConfig: () => ({
        application: { baseUrl: 'https://wildfires.gov.bc.ca/' },
        externalAppConfig: {
          bcWildfireResponsePage: 'https://response.page',
        },
      }),
    };
    mockCurrentRouter = {
      url: '/incidents?incidentNumber=K50123&fireYear=2024',
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    component = new PublicIncidentPageComponent(
      mockActivatedRoute,
      mockCdr,
      mockAgolService,
      mockPublishedIncidentService,
      mockHttp,
      mockAppConfigService,
      mockCurrentRouter
    );
    component.snowPlowHelper = jasmine.createSpy('snowPlowHelper');
  });

  describe('getTabIndexFromParam', () => {
    it('should map Details correctly', () => {
      expect(component.getTabIndexFromParam('Details')).toBe(0);
      expect(component.getTabIndexFromParam('details')).toBe(0);
    });

    it('should map Response correctly', () => {
      expect(component.getTabIndexFromParam('Response')).toBe(1);
      expect(component.getTabIndexFromParam('response')).toBe(1);
    });

    it('should map Gallery correctly', () => {
      expect(component.getTabIndexFromParam('Gallery')).toBe(2);
      expect(component.getTabIndexFromParam('gallery')).toBe(2);
    });

    it('should map Maps correctly', () => {
      expect(component.getTabIndexFromParam('Maps')).toBe(3);
      expect(component.getTabIndexFromParam('maps')).toBe(3);
    });

    it('should default to 0 for null, undefined, or unrecognized value', () => {
      expect(component.getTabIndexFromParam(null)).toBe(0);
      expect(component.getTabIndexFromParam(undefined)).toBe(0);
      expect(component.getTabIndexFromParam('')).toBe(0);
      expect(component.getTabIndexFromParam('unknown-tab')).toBe(0);
    });
  });

  describe('onTabChange', () => {
    it('should update selectedTabIndex and navigate with tab queryParam', () => {
      component.onTabChange(1);

      expect(component.selectedTabIndex).toBe(1);
      expect(mockCurrentRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { tab: 'Response' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      expect(component.snowPlowHelper).toHaveBeenCalledWith(
        'https://wildfires.gov.bc.ca/incidents?incidentNumber=K50123&fireYear=2024',
        {
          action: 'incident_details_response_click',
          text: 'Response',
        }
      );
    });

    it('should accept MatTabChangeEvent-like object with index', () => {
      component.onTabChange({ index: 2 } as any);

      expect(component.selectedTabIndex).toBe(2);
      expect(mockCurrentRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { tab: 'Gallery' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('should not navigate redundantly if tab is already selected and in route', () => {
      component.selectedTabIndex = 3;
      mockActivatedRoute.snapshot.queryParams = { tab: 'Maps' };

      component.onTabChange(3);

      expect(mockCurrentRouter.navigate).not.toHaveBeenCalled();
    });

    it('should ignore invalid index', () => {
      spyOn(console, 'warn');
      component.onTabChange(99);

      expect(component.selectedTabIndex).toBe(0);
      expect(mockCurrentRouter.navigate).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Invalid tab index:', 99);
    });
  });

  describe('ngOnInit tab loading and sharing', () => {
    it('should select the tab specified in queryParams on init', async () => {
      mockActivatedRoute.queryParams = of({
        incidentNumber: 'K50123',
        fireYear: '2024',
        tab: 'Gallery',
      });

      component.ngOnInit();
      await Promise.resolve();

      expect(component.selectedTabIndex).toBe(2);
      expect(mockPublishedIncidentService.fetchPublishedIncident).toHaveBeenCalledWith('K50123', '2024');
    });

    it('should default to Details and navigate to set tab=Details when tab queryParam is missing', async () => {
      mockActivatedRoute.queryParams = of({
        incidentNumber: 'K50123',
        fireYear: '2024',
      });

      component.ngOnInit();
      await Promise.resolve();

      expect(component.selectedTabIndex).toBe(0);
      expect(mockCurrentRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { tab: 'Details' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('should not re-fetch incident when only queryParams tab changes for the same incident', async () => {
      component.incidentNumber = 'K50123';
      component.fireYear = '2024';
      component.incident = { incidentName: 'Test Fire' };
      component.isLoading = false;

      mockActivatedRoute.queryParams = of({
        incidentNumber: 'K50123',
        fireYear: '2024',
        tab: 'Response',
      });

      component.ngOnInit();
      await Promise.resolve();

      expect(component.selectedTabIndex).toBe(1);
      expect(mockPublishedIncidentService.fetchPublishedIncident).not.toHaveBeenCalled();
      expect(mockCdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('IncidentTabsComponent', () => {
    it('should emit tabChange when handleTabChange is called', () => {
      const tabsComponent = new IncidentTabsComponent();
      spyOn(tabsComponent.tabChange, 'emit');

      tabsComponent.handleTabChange(2);

      expect(tabsComponent.selectedTabIndex).toBe(2);
      expect(tabsComponent.tabChange.emit).toHaveBeenCalledWith({ index: 2 } as any);
    });
  });
});

