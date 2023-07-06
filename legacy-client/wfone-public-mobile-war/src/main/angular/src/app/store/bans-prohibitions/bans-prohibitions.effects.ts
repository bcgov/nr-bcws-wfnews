import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {catchError, concatMap, map, mergeMap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {Action, Store} from "@ngrx/store";
import {RootState} from "../index";
import {
    LOAD_CURRENT_BANS_PROHIBITIONS,
    loadCurrentBansProhibitionsError,
    loadCurrentBansProhibitionsSuccess
} from "./bans-prohibitions.actions";
import {
    convertToBanProhibition,
    convertToBanProhibitionRSSFeed,
    convertToErrorState
} from "../../conversion/conversion-from-rest";
import {ArcGisService} from "../../services/arc-gis.service";
import {
    VmBanProhibition,
    VmBanProhibitionRSSFeed,
    VmBanProhibitionRSSItem,
    VmFireCentre,
    VmFireStatus
} from "../../conversion/models";
import {FireStatsRsrc, StatsFeatureBaseRsrc} from "../../conversion/resources";
import {FIRE_CENTRES, getNoBanProhibition} from "../../utils";
import {LoadOverviewActiveFireStatsAction} from "../current-stats/current-stats.actions";
import {NgxXml2jsonService} from "ngx-xml2json";
import {TitleCasePipe} from "@angular/common";


@Injectable()
export class BansProhibitionsEffects {
    constructor(
        private actions: Actions,
        private arcGisService: ArcGisService,
        private store$: Store<RootState>,
        private ngxXml2jsonService: NgxXml2jsonService
    ) {
    }

    @Effect()
    getBansProhibitions: Observable<Action> = this.actions
        .pipe(
            ofType<LoadOverviewActiveFireStatsAction>(LOAD_CURRENT_BANS_PROHIBITIONS),
            mergeMap(payload => this.arcGisService.getBanRSSFeed()
                .pipe(
                    map((response: any) => {
                        // console.log('getBanRSSFeed response: ', response);
                        const banProhibRSSFeed: VmBanProhibitionRSSFeed = convertToBanProhibitionRSSFeed(this.ngxXml2jsonService, response);
                        return [banProhibRSSFeed];
                    })
                )
            ),
            map((args) => {
                const responseBanRSSFeed: VmBanProhibitionRSSFeed = args[0];
                return [responseBanRSSFeed];
            }),
            mergeMap((args) => {
                const banProhibRSSFeed: VmBanProhibitionRSSFeed = args[0];

                return this.arcGisService.getBansProhibitionsStats()
                    .pipe(
                        concatMap((responseFireStatRsrc: FireStatsRsrc) => {
                            const tempResult = responseFireStatRsrc.features.map((item: StatsFeatureBaseRsrc) =>
                                convertToBanProhibition(item.attributes));
                            const result = this.appendFireCentresWithNoBansProhibitions(tempResult);
                            this.updateBanProhibitionItemsWithRSSFeedInfo(result, banProhibRSSFeed);
                            result.sort((a, b) => a.fireCentre.displayOrder - b.fireCentre.displayOrder);
                            // console.log('final result: ', result);
                            return [loadCurrentBansProhibitionsSuccess(result)];
                        }),
                        catchError(error => {
                            return of(
                                loadCurrentBansProhibitionsError(convertToErrorState(error)),
                            );
                        })
                    );
            }),
        );

    appendFireCentresWithNoBansProhibitions(fireCentresWithBansProhibitions: VmBanProhibition[]): VmBanProhibition[] {
        const fireCentreNamesWithBansProhibitions =  fireCentresWithBansProhibitions.map(item => item.fireCentre.name);
        const fireCentresWithNoBansAndProhibitions = this.getFireCentresWithNoBansAndProhibitions(fireCentreNamesWithBansProhibitions);
        // console.log('fireCentresWithNoBansAndProhibitions: ', fireCentresWithNoBansAndProhibitions);

        const result = [...fireCentresWithBansProhibitions];
        fireCentresWithNoBansAndProhibitions.forEach((item: VmFireCentre) => {
            const noBanProhibitionItem = getNoBanProhibition(item);
            result.push(noBanProhibitionItem);
        });
        // console.log('appendFireCentresWithNoBansProhibitions result: ', result);
        return result;
    }

    getFireCentresWithNoBansAndProhibitions(fireCentresWithBansAndProhibitions: string[]) {
        const result = FIRE_CENTRES.filter((fireCentre: VmFireCentre) => {
            const match = fireCentresWithBansAndProhibitions.find(name => name === fireCentre.name);
            if (match) { return false; }
            return true;
        });
        // console.log('result: ', result);
        return result;
    }

    updateBanProhibitionItemsWithRSSFeedInfo(banProhibitions: VmBanProhibition[], banProhibRSSFeed: VmBanProhibitionRSSFeed) {
        const titlecasePipe: TitleCasePipe = new TitleCasePipe();

        banProhibitions.forEach((item: VmBanProhibition) => {
            const rssFeedItem: VmBanProhibitionRSSItem = banProhibRSSFeed.items.find((rssItem: VmBanProhibitionRSSItem) => {
                return rssItem.fireCentre === item.fireCentre;
            });

            // console.log("rssitem: ", rssFeedItem);

            item.prohibitionsUrl = rssFeedItem.link;

            if (rssFeedItem.openFireBanInEffect) {
                item.hasProhibitions = true;
                item.openFireBanInEffect = true;
                item.openFiresStatus = VmFireStatus.PROHIBITIONS;
                item.openFiresDesc = titlecasePipe.transform(VmFireStatus[VmFireStatus.PROHIBITIONS]);
            }

            if (rssFeedItem.campFireBanInEffect) {
                item.hasProhibitions = true;
                item.campFireBanInEffect = true;
                item.campfiresStatus = VmFireStatus.PROHIBITIONS;
                item.campfiresStatusDesc = titlecasePipe.transform(VmFireStatus[VmFireStatus.PROHIBITIONS]);
            }

            if (rssFeedItem.forestUseRestrictionsInEffect) {
                item.hasProhibitions = true;
                item.forestUseRestrictionsInEffect = true;
                item.forestUseStatus = VmFireStatus.RESTRICTED;
                item.forestUseDesc = titlecasePipe.transform(VmFireStatus[VmFireStatus.RESTRICTED]);
            }

            // console.log("updateBanProhibitionItemsWithRSSFeedInfo item: ", item);
        });
    }


}

