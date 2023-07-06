import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Injectable, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewContainerRef } from "@angular/core";
import { Store } from "@ngrx/store";
import { ApplicationStateService } from "src/app/services/application-state.service";
import { MapConfigService } from "src/app/services/map-config.service";
import { CapacitorService } from "../../services/capacitor-service";
import { NearMeItem } from "../../services/point-id.service";
import { RootState } from "../../store";
import { setNearMeHighlight } from "../../store/application/application.actions";
import { CONSTANTS } from "../../utils";

@Component({
    selector: 'near-me-item-container',
    template: '<div #scrollTarget><ng-template #nearMeItemTarget></ng-template></div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NearMeItemWrapper implements AfterViewInit, OnChanges {
    @Input() nearMeItem: NearMeItem;
    @Input() expanded: boolean = false;
    @Input() showMapInline: boolean = true;
    @ViewChild('nearMeItemTarget', { read: ViewContainerRef }) nearMeItemTarget;
    @ViewChild('scrollTarget') scrollElement: ElementRef;

    childComponent: any

    constructor(
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected cdr: ChangeDetectorRef
    ) { }

    ngAfterViewInit(): void {
        const self = this

        const factory = this.componentFactoryResolver.resolveComponentFactory(this.nearMeItem.component);

        this.nearMeItemTarget.clear()
        this.childComponent = this.nearMeItemTarget.createComponent(factory);

        this.childComponent._component.setNearMeItem(this.nearMeItem)
        this.childComponent._component.setExpanded(this.expanded)
        this.childComponent._component.setShowMapInline(this.showMapInline)
    }

    ngOnChanges(changes: SimpleChanges): void {
        const self = this

        // console.log(this.nearMeItem, changes.expanded.currentValue)
        if (changes.expanded && this.childComponent) {
            this.childComponent._component.setExpanded(changes.expanded.currentValue)
            if ( changes.expanded.currentValue ) {
                setTimeout( function () {
                    self.scrollElement.nativeElement.scrollIntoView()
                }, 500 )
            }
        }
    }
}

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
//

@Injectable()
export class NearMeItemComponentBase implements OnDestroy {
    nearMeItem: NearMeItem;
    expanded: boolean = false
    CONSTANTS = CONSTANTS
    mapConfig
    showMapInline: boolean = true;

    constructor(
        protected store: Store<RootState>,
        protected capacitorService: CapacitorService,
        protected cdr: ChangeDetectorRef,
        protected mapConfigService: MapConfigService,
        protected applicationStateService: ApplicationStateService
    ) {}

    ngOnDestroy(): void {
    }

    setNearMeItem(item: NearMeItem) {
        this.nearMeItem = item
        this.cdr.detectChanges();
    }

    setShowMapInline( show: boolean) {
        this.showMapInline = show;
        this.cdr.detectChanges();
    }

    setExpanded(expanded: boolean) {
        if ( this.expanded == expanded ) return
        this.expanded = expanded
        this.cdr.detectChanges();
    }

    getMapConfig() {
        if (!this.mapConfig) {
            this.mapConfig = this.mapConfigService.getNearMeItemMapConfig( false, this.nearMeItem )
                .then(function (config) {
                    return [config, 'theme=wf']
                })
        }

        return this.mapConfig
    }

    initMap(smk: any) {
    }

    openUrl(url) {
        // console.log('open url-near me', url, this.capacitorService.isMobilePlatform());
        this.capacitorService.openUrl( url )
    }

    viewOnMap(nearMeItem: NearMeItem){
        this.store.dispatch(setNearMeHighlight(nearMeItem, null));
    }

}

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
//

@Component({
    selector: 'near-me-item',
    templateUrl: './near-me-item.component.html',
    styleUrls: [ './near-me-item.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NearMeItemComponent {}
