import {ComponentFixture, fakeAsync, flush, TestBed} from "@angular/core/testing";

import {Component, DebugElement} from "@angular/core";
import {of} from "rxjs";
import {getDefaultTestingImportModules} from "../../test/utils/test-module";
import {Store} from "@ngrx/store";
import {By, DomSanitizer} from "@angular/platform-browser";

import {LandingPageComponent} from "../../components/landing-page/landing-page.component";
import {FakeBaseWrapperComponent} from "./fake/fake-base-wrapper.component";
import moment = require("moment");

describe('LandingPageComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let mockTokenService, mockLocationService, mockStore, mockAppStateService, mockAutocompleteService;

    @Component({
        selector: 'host-for-test',
        template: `
            <wfone-landing-page
            ></wfone-landing-page>`,
    })
    class HostComponent {


        constructor() {
        }

    }

    function createHostComponent() : ComponentFixture<HostComponent> {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        return fixture;
    }

    mockStore = jasmine.createSpyObj(['dispatch']);

    beforeEach(() => {


        TestBed.configureTestingModule({
            declarations: [
                FakeBaseWrapperComponent,
                HostComponent,
                LandingPageComponent,
            ],
            // schemas: [NO_ERRORS_SCHEMA],
            imports: getDefaultTestingImportModules(),
            providers: [
                {provide: Location, useValue: mockLocationService},
                {provide: Store, useValue: mockStore},
            ]
        });
    });


    it('should create', fakeAsync(() => {
        fixture = createHostComponent();
        
        mockStore.dispatch.and.callFake(function() {});
        fixture.detectChanges();

        expect(mockStore.dispatch).toHaveBeenCalled();

        let landingPageComp = fixture.debugElement.query(By.directive(LandingPageComponent));
        expect(landingPageComp.componentInstance).toBeDefined();
    }));


    it('should populate landing page info', fakeAsync(() => {
        fixture = createHostComponent();
        let hostComp:HostComponent = fixture.componentInstance;


        mockStore.dispatch.and.callFake(function() {});

        fixture.detectChanges();
        flush();

        expect(mockStore.dispatch).toHaveBeenCalled();

        let landingPageCompDE = fixture.debugElement.query(By.directive(LandingPageComponent));
        let landingPageComp:LandingPageComponent = landingPageCompDE.componentInstance;

        //verify input models were injected properly into component

        //verify viewmodel data matches DOM
        let landingPageViewModel = landingPageComp.getViewModel();

        //My diary elements
        let myDiaryLastUpdateDEs:DebugElement[] = landingPageCompDE.queryAll(By.css("div.dashboard mat-card[routerlink='/diaries'] mat-card-content div"));
        expect(myDiaryLastUpdateDEs.length).toBe(2);

        let elMyDiaryLastUpdateLabel:HTMLElement = myDiaryLastUpdateDEs[0].nativeElement;
        expect(elMyDiaryLastUpdateLabel.innerText).toContain("My Diary");

        let elMyDiaryLastUpdate:HTMLElement = myDiaryLastUpdateDEs[1].nativeElement;
        let diaryLastUpdateDate = moment(landingPageViewModel.diaryLastUpdate).format("DD MMM YYYY");
        expect(elMyDiaryLastUpdate.innerText).toContain(diaryLastUpdateDate);

        //Approval Elements
        let approvalsLastUpdateDEs:DebugElement[] = landingPageCompDE.queryAll(By.css("div.dashboard mat-card[routerlink='/approvals'] mat-card-content div"));
        expect(approvalsLastUpdateDEs.length).toBe(2);

        let elApprovalsLastUpdateLabel:HTMLElement = approvalsLastUpdateDEs[0].nativeElement;
        expect(elApprovalsLastUpdateLabel.innerText).toContain("Approvals");

        let elApprovalsLastUpdateDate:HTMLElement = approvalsLastUpdateDEs[1].nativeElement;
        let approvalsLastUpdateDate = moment(landingPageViewModel.approvalsLastUpdate).format("DD MMM YYYY");
        expect(elApprovalsLastUpdateDate.innerText).toContain(approvalsLastUpdateDate);

        let elApprovalsBadge:HTMLElement = landingPageCompDE.query(By.css("div.dashboard mat-card[routerlink='/approvals'] mat-card-header")).nativeElement;
        expect(elApprovalsBadge.innerText).toEqual(landingPageViewModel.approvalsBadgeNumber.toString());

        //Profile Elements
        let profileLastUpdateDEs:DebugElement[] = landingPageCompDE.queryAll(By.css("div.dashboard mat-card[routerlink='/profile'] mat-card-content div"));
        expect(profileLastUpdateDEs.length).toBe(2);

        let elProfileLastUpdateLabel:HTMLElement = profileLastUpdateDEs[0].nativeElement;
        expect(elProfileLastUpdateLabel.innerText).toContain("Profile");

        let elProfileLastUpdateDate:HTMLElement = profileLastUpdateDEs[1].nativeElement;
        let profileLastUpdateDate = moment(landingPageViewModel.profileLastUpdate).format("DD MMM YYYY");
        expect(elProfileLastUpdateDate.innerText).toContain(profileLastUpdateDate);

    }));


});


describe('LandingPage Action', () => {
    let landingPageComp:LandingPageComponent;
    let mockRouter, mockActivatedRoute, mockSanitizer: DomSanitizer, mockStore, mockFormBuilder, mockTokenService, mockCdr, mockComponentFactoryResolver, mockPointIdService, mockCapacitorService;
    let mockSnackBar, mockDialog, mockConnectionService, mockSnackBarService, mockOverlay, mockAppStateService, mockAutocompleteService, mockAppConfigService;

    beforeEach(() => {

        mockSanitizer = jasmine.createSpyObj(['bypassSecurityTrustResourceUrl']);
        mockStore = jasmine.createSpyObj(['dispatch']);
        mockConnectionService = jasmine.createSpyObj(['monitor']);
        mockConnectionService.monitor.and.callFake(function() {
            return of(null);
        });

        landingPageComp = new LandingPageComponent(mockRouter, mockActivatedRoute, mockSanitizer, mockStore,
            mockFormBuilder, mockSnackBar, mockDialog,mockConnectionService,
            mockSnackBarService, mockOverlay, mockCdr, mockAppConfigService,
            mockAppStateService, mockComponentFactoryResolver,
            mockPointIdService, mockCapacitorService);
    });

    it('should dispatch GetCodeTableDataAction when loadPage method called on component', fakeAsync(() => {


        mockStore.dispatch.and.callFake(function() {});
        landingPageComp.loadPage();

        expect(mockStore.dispatch).toHaveBeenCalled();

    }));

});
