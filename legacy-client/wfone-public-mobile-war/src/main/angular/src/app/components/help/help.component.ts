import {AfterViewInit, ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges, ViewChildren, ViewChild, ElementRef, HostListener, QueryList, OnDestroy, NgZone} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {HelpComponentModel} from "./help.component.model";
import {HELP_CONTENT_TYPES, WFOnePublicMobileRoutes} from "../../utils";
import { HelpDocumentService } from "src/app/services/help-document.service";
import {Location} from '@angular/common';

@Component({
    selector: 'wfone-help',
    templateUrl: './help.component.html',
    styleUrls: ['../base/base.component.scss', './help.component.scss','../../services/help-document.service/help-document.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpComponent extends BaseComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
    HELP_CONTENT_TYPES = HELP_CONTENT_TYPES;
    backRoute = WFOnePublicMobileRoutes.LANDING;
    @ViewChild ('helpList') helpList: ElementRef;
    @ViewChildren ('helpListItem') helpListItems : QueryList<any>;
    title = "Help";
    currentTopic
    previousTopics = [];

    keyManager: any;

    isFocused = false;

    private helpDocumentService: HelpDocumentService
    private zone: NgZone
    docHtml

    initComponent() {
        super.initComponent()

        this.helpDocumentService = this.injector.get( HelpDocumentService )
        this.zone = this.injector.get( NgZone )
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.HELP )
    }

    ngOnInit() {
        const self = this

        this.route.params.subscribe( p => {
            this.currentTopic = p.topic
            var doc = this.helpDocumentService.getDocument( p.topic )
            this.docHtml = doc.html
            this.title = doc.title
            this.helpDocumentService.setTopicSeen( p.topic )
            this.cdr.detectChanges()
        } )

        window[ 'markdownEventEmitter' ].on( 'click', function ( ev ) {
            self.zone.run( function () {
                if ( ev.arg.topic ) {
                    self.previousTopics.push( self.currentTopic )
                    self.router.navigate( [ WFOnePublicMobileRoutes.HELP, ev.arg.topic ] )            
                }
            } )
        } )

        super.ngOnInit();
    }
    
    ngOnDestroy() {
        window[ 'markdownEventEmitter' ].off( 'click' )
    }

    navigateToBackRoute() {
        if ( this.previousTopics.length == 0 ) 
            return super.navigateToBackRoute()

        let t = this.previousTopics.pop()

        this.router.navigate( [ WFOnePublicMobileRoutes.HELP, t ] )   
    }

    initModels() {
        this.model = new HelpComponentModel(this.sanitizer);
        this.viewModel = new HelpComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    @HostListener('window:keydown', ['$event']) 
    keyFunc(event) {
        if(this.router.url == "/"+WFOnePublicMobileRoutes.HELP && this.isFocused) {
            if (event.code !== 'Tab' && event.keyCode !== 13) {
            this.keyManager.onKeydown(event)
            this.focusMonitor.focusVia(this.keyManager.activeItem._element.nativeElement, "keyboard")
            } else if(event.shiftKey && event.key === "Tab"){
                event.preventDefault();
                this.eventEmitterService.onKeyboardShiftTabPress('help');
                this.eventEmitterService.sideNavAccessLocked(false);
                this.isFocused = false;
            }
        }
    }

    elementFocused(){
        this.isFocused = true;
        this.eventEmitterService.sideNavAccessLocked(true);
    }

    getViewModel(): HelpComponentModel {
        return <HelpComponentModel>this.viewModel;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    public onKeydownMain(event): void {
        if (event.shiftKey && event.key === "Tab"){
                 event.preventDefault();
                 this.eventEmitterService.onKeyboardShiftTabPress('help');
         }
    }


    navigateToHelpContent(definitionType: HELP_CONTENT_TYPES) {
        this.router.navigate([WFOnePublicMobileRoutes.HELP_CONTENT],
            {queryParams: { refererPage: WFOnePublicMobileRoutes.HELP, type: definitionType }});
            this.isFocused = false;
        return false;
    }

    onKeydownHelpItem(event, definitionType: HELP_CONTENT_TYPES){
        if(event.keyCode == 13){
            event.preventDefault();
            this.navigateToHelpContent(definitionType);
        }
    }

}
