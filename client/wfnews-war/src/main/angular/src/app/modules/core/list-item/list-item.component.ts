import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    IconSize,
    IconType,
    IncidentType, IncidentTypeAgencyAssist,
    IncidentTypeFieldActivity,
    IncidentTypeWithStatus, ReportOfFireType
} from "@wf1/core-ui";
import { WfimMapService } from '../../../services/wfim-map.service';
import { Info, ListItemConfig } from './list-item-config';

export class InternalListItemConfig {
    icon: {
        type: IconType;
        size: IconSize;
        colourCode: IncidentType | IncidentTypeWithStatus | IncidentTypeAgencyAssist | IncidentTypeFieldActivity | ReportOfFireType;
        isBlinking: boolean;
        isCancelled: boolean;
        isAssignedToIncident: boolean;
    };
    time?: string;
    title: string;
    titleLevelInfo: Info;
    infoRows: [[Info, Info]];
    location?: [number, number];
    geometry?: any;
    hasAttachments?: boolean
}

@Component({
    selector: 'wf1-list-item',
    templateUrl: './list-item.component.html',
    styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
    public TOOLTIP_DELAY = 500;

    @Input() config: ListItemConfig;
    @Input() mapElement: string;

    @Output() itemSelect = new EventEmitter<ListItemConfig>();

    internalConfig: InternalListItemConfig;

    constructor(
        protected wfimMapService: WfimMapService
    ) { }

    ngOnInit() {
        if (this.config) {
            this.internalConfig = new InternalListItemConfig();
            this.internalConfig.icon = {
                type: this.config.icon as IconType,
                size: (this.config.time) ? IconSize.LIST_SMALL : IconSize.LIST_LARGE,
                colourCode: (this.config.iconColourCode !== undefined)
                    ? this.config.iconColourCode : IncidentType.DEFAULT,
                isBlinking: (this.config.iconIsBlinking !== undefined)
                    ? this.config.iconIsBlinking : false,
                isCancelled: (this.config.iconIsCancelled !== undefined)
                    ? this.config.iconIsCancelled : false,
                isAssignedToIncident: (this.config.iconIsAssignedToIncident !== undefined)
                    ? this.config.iconIsAssignedToIncident : false,
            };

            this.internalConfig.time = this.config.time;
            this.internalConfig.title = this.config.title;
            this.internalConfig.infoRows = <[[Info, Info]]><unknown>[];
            let currentRow = <[Info, Info]>[null, null];

            for (let index = 0; index < this.config.info.length; index++) {
                if (index == 0) {
                    this.internalConfig.titleLevelInfo = this.config.info[index];
                } else {
                    let isFirstRowEntry = (index % 2);
                    if (isFirstRowEntry) {
                        currentRow[0] = this.config.info[index];
                    } else {
                        currentRow[1] = this.config.info[index];
                        this.internalConfig.infoRows.push(currentRow);
                        currentRow = <[Info, Info]>[null, null];
                    }
                }
            }
            this.internalConfig.location = this.config.location;
            this.internalConfig.geometry = this.config.geometry;
            if (currentRow[0]) { //If odd number of items, push half-finished row into set.
                this.internalConfig.infoRows.push(currentRow);
            }

            this.internalConfig.hasAttachments = this.config.hasAttachments
        }
    }

    handleMouseEvent(config: ListItemConfig) {
        if ( !config )
            return this.wfimMapService.clearHighlight()

        if ( config.location )
            return this.wfimMapService.putHighlight( config.location )

        if ( config.geometry )
            return this.wfimMapService.putHighlight( window[ 'turf' ].pointOnFeature( config.geometry ).geometry.coordinates )
    }

    handleClick() {
        this.itemSelect.emit(this.config);
    }

    zoomToPlace(config: ListItemConfig) {
        if ( !config ) return

        if ( config.location )
            return this.wfimMapService.zoomToPoint( config.location )

        if ( config.geometry )
            return this.wfimMapService.zoomToGeometry( config.geometry )
    }
}
