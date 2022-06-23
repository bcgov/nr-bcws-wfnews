import { Component, Input } from '@angular/core';

@Component({
    selector: 'wfim-panel-container',
    templateUrl: './wfim-panel-container.component.html',
    styleUrls: ['./wfim-panel-container.component.scss']
})
export class WfimPanelContainerComponent {
    @Input() showLeftPanel = true
    @Input() showRightPanel = true

    constructor(
    ) {
    }
}
