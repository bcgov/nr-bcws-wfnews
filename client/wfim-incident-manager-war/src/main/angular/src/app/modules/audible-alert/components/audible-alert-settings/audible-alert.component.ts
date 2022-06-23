import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TreeviewItem } from "ngx-treeview";
import { RootState } from '../../../../store';
import { UpdateRofAudibleAlert } from "../../../../store/rof/rof.actions";
import { selectAudibleAlertState } from '../../../../store/rof/rof.selectors';
import { getOptionsCodeHierarchyIndexForCode, getOrgCodeOptions } from "../../../../utils";

@Component({
    selector: 'wfim-audible-alert-panel',
    templateUrl: './audible-alert.component.html',
    styleUrls: [
        './audible-alert.component.scss',
        './treeview-checkbox.scss',
        '../../../../components/marker-layer-base.component.scss'
    ]
})
export class AudibleAlertComponent implements OnInit, OnDestroy {
    public TOOLTIP_DELAY = 500;

    audibleAlertSub

    alertUnacknowledged = false
    alertReceivedFromPM = false

    treeviewConfig = {
        hasAllCheckBox: false,
        hasFilter: false,
        hasCollapseExpand: false,
        decoupleChildFromParent: false,
        maxHeight: 5000
    };

    items: TreeviewItem[];
    selectedValues: string[] = [];

    constructor(
        private store: Store<RootState>,
    ) { }

    ngOnInit() {
        this.audibleAlertSub = this.store.pipe(select(selectAudibleAlertState())).subscribe((a) => {
            console.log(a)

            this.alertReceivedFromPM = a.enableReceivedFromPM
            this.alertUnacknowledged = a.enableUnacknowledged
            this.selectedValues = a.selectedZoneIds

            if ( 'enabled' in a ) {
                this.alertReceivedFromPM = a[ 'enabled' ]
                this.alertUnacknowledged = a[ 'enabled' ]
            }
        });

        this.items = formatFireCenterTreeviewOptions( this.selectedValues );
    }

    ngOnDestroy() {
        if ( this.audibleAlertSub )
            this.audibleAlertSub.unsubscribe();
    }

    onSelectedChange(event) {
        this.selectedValues = event;
    }

    onSave() {
        this.store.dispatch(new UpdateRofAudibleAlert(this.alertUnacknowledged, this.alertReceivedFromPM, this.selectedValues));
    }
}

function formatFireCenterTreeviewOptions( selected ): TreeviewItem[] {
    let fireCentreCodes = getOrgCodeOptions('FIRE_CENTRE_CODE');
    let zoneCodes = getOrgCodeOptions('ZONE_CODE');

    let fireCentreTreeview: TreeviewItem[] = fireCentreCodes.map(option => (new TreeviewItem({ text: option.description, value: option.code, disabled: false, checked: false, collapsed: true })));
    fireCentreTreeview.forEach(fireCentre => {
        let zoneIdsForFireCentre: any[] = getOptionsCodeHierarchyIndexForCode('FIRE_CENTRE_ZONE_XREF', fireCentre.value);
        let zoneCodesForFireCentre = zoneCodes.filter(zone => zoneIdsForFireCentre.includes(zone.code));
        let zoneCentreTreeview: TreeviewItem[] = zoneCodesForFireCentre.map(option => (new TreeviewItem({
            text: option.description,
            value: option.code,
            disabled: false,
            collapsed: true,
            checked: selected.includes(option.code)
        })));

        fireCentre.children = zoneCentreTreeview;

    });
    if (fireCentreTreeview && fireCentreTreeview.length > 0) {
        fireCentreTreeview[0].collapsed = false;
    }

    return fireCentreTreeview;
}

