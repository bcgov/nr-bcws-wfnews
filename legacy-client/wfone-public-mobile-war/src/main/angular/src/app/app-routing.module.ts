import { CapacitorService } from './services/capacitor-service';
import { LatestNewsDetailContainer } from './containers/latest-news-detail/latest-news-detail-container.component';
import { NotificationDetailContainer } from './containers/notification-detail/notification-detail-container.component';
import {NgModule} from "@angular/core";
import {Router, RouterModule, Routes} from "@angular/router";

import {LandingPageContainer} from "./containers/landing/landing-page-container.component";
import {WFOnePublicMobileRoutes} from "./utils";
import {ReportOfFireContainer} from "./containers/report-of-fire/report-of-fire-container.component";
import {FeedbackContainer} from "./containers/feedback/feedback-container.component";
import {LatestNewsContainer} from "./containers/latest-news/latest-news-container.component";
import {HelpContainer} from "./containers/help/help-container.component";
import {BansAndProhibitionsContainer} from "./containers/bans-and-prohibitions/bans-and-prohibitions-container.component";
import {ApplicationStateService} from "./services/application-state.service";
import {DisclaimerContainer} from "./containers/disclaimer/disclaimer-container.component";
import {CurrentStatsContainer} from "./containers/current-stats/current-stats-container.component";
// tslint:disable-next-line:max-line-length
import {BansAndProhibitionsDetailContainer} from "./containers/bans-and-prohibitions-detail/bans-and-prohibitions-detail-container.component";
import {HelpContentContainer} from "./containers/help-content/help-content-container.component";
import {AdvisoriesContainer} from "./containers/advisories/advisories-container.component";
import { NotificationsContainer } from "./containers/notifications/notifications-container.component";
import { WFStatsComponent } from './components/wf-stats.component.ts/wf-stats.component';
import { throwToolbarMixedModesError } from '@angular/material';

let routes: Routes = [
    {path: WFOnePublicMobileRoutes.LANDING, component: LandingPageContainer, pathMatch: 'full', data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.REPORT_OF_FIRE, component: ReportOfFireContainer, pathMatch: 'full', data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.FEEDBACK, component: FeedbackContainer, pathMatch: 'full', data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS, component: LatestNewsContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.HELP + '/:topic', component: HelpContainer, pathMatch: 'full', data: { shouldDetach: true } },
    {path: WFOnePublicMobileRoutes.ADVISORIES, component: AdvisoriesContainer, pathMatch: 'full',
        data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS, component: BansAndProhibitionsContainer, pathMatch: 'full',
        data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS_DETAIL, component: BansAndProhibitionsDetailContainer, pathMatch: 'full',
        data: { shouldDetach: true}},
    // {path: WFOnePublicMobileRoutes.HELP_CONTENT, component: HelpContentContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.DISCLAIMER, component: DisclaimerContainer, pathMatch: 'full', data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.CURRENT_STATS, component: WFStatsComponent, pathMatch: 'full', data: { shouldDetach: true}},
    {path: WFOnePublicMobileRoutes.NOTIFICATIONS, component: NotificationsContainer, pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.NOTIFICATION_DETAIL, component: NotificationDetailContainer, pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.NOTIFICATION_DETAIL + '/:queryParams', component: NotificationDetailContainer},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL, component: LatestNewsDetailContainer,pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL + '/:queryParams', component: LatestNewsDetailContainer},
    // {path: WFOnePublicMobileRoutes.CURRENT_STATS, component: CurrentStatsContainer, pathMatch: 'full', data: { shouldDetach: true}}
    //{path: '**', redirectTo: WFOnePublicMobileRoutes.LANDING}

];

let tablet_routes: Routes = [
    {path: WFOnePublicMobileRoutes.LANDING, component: LandingPageContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.REPORT_OF_FIRE, component: ReportOfFireContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.FEEDBACK, component: FeedbackContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS, component: LatestNewsContainer, pathMatch: 'full', data: { shouldDetach: false}},
    // {path: WFOnePublicMobileRoutes.HELP, component: HelpContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.ADVISORIES, component: AdvisoriesContainer, pathMatch: 'full',
        data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS, component: BansAndProhibitionsContainer, pathMatch: 'full',
        data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS_DETAIL, component: BansAndProhibitionsDetailContainer, pathMatch: 'full',
        data: { shouldDetach: false}},
    // {path: WFOnePublicMobileRoutes.HELP_CONTENT, component: HelpContentContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.DISCLAIMER, component: DisclaimerContainer, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.CURRENT_STATS, component: WFStatsComponent, pathMatch: 'full', data: { shouldDetach: false}},
    {path: WFOnePublicMobileRoutes.NOTIFICATIONS, component: NotificationsContainer, pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.NOTIFICATION_DETAIL, component: NotificationDetailContainer, pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.NOTIFICATION_DETAIL + '/:queryParams', component: NotificationDetailContainer},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL, component: LatestNewsDetailContainer,pathMatch: 'full'},
    {path: WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL + '/:queryParams', component: LatestNewsDetailContainer},
    // {path: WFOnePublicMobileRoutes.CURRENT_STATS, component: CurrentStatsContainer, pathMatch: 'full', data: { shouldDetach: false}}
    //{path: '**', redirectTo: WFOnePublicMobileRoutes.LANDING}

];


@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {

    public constructor(private router: Router,
        private applicationStateService: ApplicationStateService,
        private capacitorService: CapacitorService
    ) {
        if ( this.applicationStateService.getIsMobileResolution() ) {
            console.log('mobile resolution');
            // router.resetConfig(mobile_routes);
        }
        else {
            this.capacitorService.isWeb.then( b => {
                if ( !b ) router.resetConfig(tablet_routes);
            } )
        }
    }

    public addDefaultRoute(){
        routes.push({path: '**', redirectTo: WFOnePublicMobileRoutes.LANDING});
        tablet_routes.push({path: '**', redirectTo: WFOnePublicMobileRoutes.LANDING});
    }

}
