import { ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { BaseChartComponent } from '../common/base-chart.component';
import { ColorHelper } from '../common/color.helper';
import { scaleLinear, scaleBand } from 'd3-scale';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import * as i0 from "@angular/core";
import * as i1 from "../common/charts/chart.component";
import * as i2 from "../common/axes/x-axis.component";
import * as i3 from "../common/axes/y-axis.component";
import * as i4 from "./box-series.component";
import * as i5 from "@angular/common";
export class BoxChartComponent extends BaseChartComponent {
    constructor() {
        super(...arguments);
        /** Show or hide the legend. */
        this.legend = false;
        this.legendPosition = LegendPosition.Right;
        this.legendTitle = 'Legend';
        this.showGridLines = true;
        this.xAxis = true;
        this.yAxis = true;
        this.showXAxisLabel = true;
        this.showYAxisLabel = true;
        this.roundDomains = false;
        this.roundEdges = true;
        this.strokeColor = '#FFFFFF';
        this.strokeWidth = 2;
        this.tooltipDisabled = false;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        /** Chart Margins (For each side, counterclock wise). */
        this.margin = [10, 20, 10, 20];
        /** Chart X axis dimension. */
        this.xAxisHeight = 0;
        /** Chart Y axis dimension. */
        this.yAxisWidth = 0;
    }
    trackBy(index, item) {
        return item.name;
    }
    update() {
        super.update();
        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin,
            showXAxis: this.xAxis,
            showYAxis: this.yAxis,
            xAxisHeight: this.xAxisHeight,
            yAxisWidth: this.yAxisWidth,
            showXLabel: this.showXAxisLabel,
            showYLabel: this.showYAxisLabel,
            showLegend: this.legend,
            legendPosition: this.legendPosition
        });
        this.xDomain = this.getXDomain();
        this.yDomain = this.getYDomain();
        this.seriesDomain = this.getSeriesDomain();
        this.setScales();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    }
    setColors() {
        let domain = [];
        if (this.schemeType === ScaleType.Ordinal) {
            domain = this.seriesDomain;
        }
        else {
            domain = this.yDomain;
        }
        this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    }
    setScales() {
        this.xScale = this.getXScale(this.xDomain, this.dims.width);
        this.yScale = this.getYScale(this.yDomain, this.dims.height);
    }
    getXScale(domain, width) {
        const scale = scaleBand()
            .domain(domain.map(d => d.toString()))
            .rangeRound([0, width])
            .padding(0.5);
        return scale;
    }
    getYScale(domain, height) {
        const scale = scaleLinear().domain(domain).range([height, 0]);
        return this.roundDomains ? scale.nice() : scale;
    }
    getUniqueBoxChartXDomainValues(results) {
        const valueSet = new Set();
        for (const result of results) {
            valueSet.add(result.name);
        }
        return Array.from(valueSet);
    }
    getXDomain() {
        let domain = [];
        const values = this.getUniqueBoxChartXDomainValues(this.results);
        let min;
        let max;
        if (typeof values[0] === 'string') {
            domain = values.map(val => val.toString());
        }
        else if (typeof values[0] === 'number') {
            const mappedValues = values.map(v => Number(v));
            min = Math.min(...mappedValues);
            max = Math.max(...mappedValues);
            domain = [min, max];
        }
        else {
            const mappedValues = values.map(v => Number(new Date(v)));
            min = Math.min(...mappedValues);
            max = Math.max(...mappedValues);
            domain = [new Date(min), new Date(max)];
        }
        return domain;
    }
    getYDomain() {
        const domain = [];
        for (const results of this.results) {
            for (const d of results.series) {
                if (domain.indexOf(d.value) < 0) {
                    domain.push(d.value);
                }
            }
        }
        const values = [...domain];
        const mappedValues = values.map(v => Number(v));
        const min = Math.min(...mappedValues);
        const max = Math.max(...mappedValues);
        return [min, max];
    }
    getSeriesDomain() {
        return this.results.map(d => `${d.name}`);
    }
    updateYAxisWidth({ width }) {
        this.yAxisWidth = width;
        this.update();
    }
    updateXAxisHeight({ height }) {
        this.xAxisHeight = height;
        this.update();
    }
    onClick(data) {
        this.select.emit(data);
    }
    onActivate(data) {
        this.activate.emit(data);
    }
    onDeactivate(data) {
        this.deactivate.emit(data);
    }
    getLegendOptions() {
        const legendOpts = {
            scaleType: this.schemeType,
            colors: this.colors,
            domain: [],
            position: this.legendPosition,
            title: this.legendTitle
        };
        if (this.schemeType === ScaleType.Ordinal) {
            legendOpts.domain = this.xDomain;
            legendOpts.colors = this.colors;
        }
        else {
            legendOpts.domain = this.yDomain;
            legendOpts.colors = this.colors.scale;
        }
        return legendOpts;
    }
}
BoxChartComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BoxChartComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
BoxChartComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: BoxChartComponent, selector: "ngx-charts-box-chart", inputs: { legend: "legend", legendPosition: "legendPosition", legendTitle: "legendTitle", legendOptionsConfig: "legendOptionsConfig", showGridLines: "showGridLines", xAxis: "xAxis", yAxis: "yAxis", showXAxisLabel: "showXAxisLabel", showYAxisLabel: "showYAxisLabel", roundDomains: "roundDomains", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel", roundEdges: "roundEdges", strokeColor: "strokeColor", strokeWidth: "strokeWidth", tooltipDisabled: "tooltipDisabled", gradient: "gradient" }, outputs: { select: "select", activate: "activate", deactivate: "deactivate" }, queries: [{ propertyName: "tooltipTemplate", first: true, predicate: ["tooltipTemplate"], descendants: true }], usesInheritance: true, ngImport: i0, template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [animations]="animations"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
    >
      <svg:g [attr.transform]="transform" class="box-chart chart">
        <svg:g
          ngx-charts-x-axis
          [showGridLines]="showGridLines"
          [dims]="dims"
          [xScale]="xScale"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          (dimensionsChanged)="updateXAxisHeight($event)"
        />
        <svg:g
          ngx-charts-y-axis
          [showGridLines]="showGridLines"
          [dims]="dims"
          [yScale]="yScale"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          (dimensionsChanged)="updateYAxisWidth($event)"
        />
      </svg:g>
      <svg:g [attr.transform]="transform">
        <svg:g *ngFor="let result of results; trackBy: trackBy">
          <svg:g
            ngx-charts-box-series
            [xScale]="xScale"
            [yScale]="yScale"
            [colors]="colors"
            [roundEdges]="roundEdges"
            [strokeColor]="strokeColor"
            [strokeWidth]="strokeWidth"
            [tooltipDisabled]="tooltipDisabled"
            [tooltipTemplate]="tooltipTemplate"
            [series]="result"
            [dims]="dims"
            [animations]="animations"
            [gradient]="gradient"
            (activate)="onActivate($event)"
            (deactivate)="onDeactivate($event)"
            (select)="onClick($event)"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, isInline: true, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"], components: [{ type: i1.ChartComponent, selector: "ngx-charts-chart", inputs: ["view", "showLegend", "legendOptions", "legendType", "activeEntries", "animations"], outputs: ["legendLabelClick", "legendLabelActivate", "legendLabelDeactivate"] }, { type: i2.XAxisComponent, selector: "g[ngx-charts-x-axis]", inputs: ["xScale", "dims", "trimTicks", "rotateTicks", "maxTickLength", "tickFormatting", "showGridLines", "showLabel", "labelText", "ticks", "xAxisTickCount", "xOrient", "xAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i3.YAxisComponent, selector: "g[ngx-charts-y-axis]", inputs: ["yScale", "dims", "trimTicks", "maxTickLength", "tickFormatting", "ticks", "showGridLines", "showLabel", "labelText", "yAxisTickCount", "yOrient", "referenceLines", "showRefLines", "showRefLabels", "yAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i4.BoxSeriesComponent, selector: "g[ngx-charts-box-series]", inputs: ["dims", "series", "xScale", "yScale", "colors", "animations", "strokeColor", "strokeWidth", "tooltipDisabled", "tooltipTemplate", "tooltipPlacement", "tooltipType", "roundEdges", "gradient"], outputs: ["select", "activate", "deactivate"] }], directives: [{ type: i5.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BoxChartComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-charts-box-chart', template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [animations]="animations"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
    >
      <svg:g [attr.transform]="transform" class="box-chart chart">
        <svg:g
          ngx-charts-x-axis
          [showGridLines]="showGridLines"
          [dims]="dims"
          [xScale]="xScale"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          (dimensionsChanged)="updateXAxisHeight($event)"
        />
        <svg:g
          ngx-charts-y-axis
          [showGridLines]="showGridLines"
          [dims]="dims"
          [yScale]="yScale"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          (dimensionsChanged)="updateYAxisWidth($event)"
        />
      </svg:g>
      <svg:g [attr.transform]="transform">
        <svg:g *ngFor="let result of results; trackBy: trackBy">
          <svg:g
            ngx-charts-box-series
            [xScale]="xScale"
            [yScale]="yScale"
            [colors]="colors"
            [roundEdges]="roundEdges"
            [strokeColor]="strokeColor"
            [strokeWidth]="strokeWidth"
            [tooltipDisabled]="tooltipDisabled"
            [tooltipTemplate]="tooltipTemplate"
            [series]="result"
            [dims]="dims"
            [animations]="animations"
            [gradient]="gradient"
            (activate)="onActivate($event)"
            (deactivate)="onDeactivate($event)"
            (select)="onClick($event)"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"] }]
        }], propDecorators: { legend: [{
                type: Input
            }], legendPosition: [{
                type: Input
            }], legendTitle: [{
                type: Input
            }], legendOptionsConfig: [{
                type: Input
            }], showGridLines: [{
                type: Input
            }], xAxis: [{
                type: Input
            }], yAxis: [{
                type: Input
            }], showXAxisLabel: [{
                type: Input
            }], showYAxisLabel: [{
                type: Input
            }], roundDomains: [{
                type: Input
            }], xAxisLabel: [{
                type: Input
            }], yAxisLabel: [{
                type: Input
            }], roundEdges: [{
                type: Input
            }], strokeColor: [{
                type: Input
            }], strokeWidth: [{
                type: Input
            }], tooltipDisabled: [{
                type: Input
            }], gradient: [{
                type: Input
            }], select: [{
                type: Output
            }], activate: [{
                type: Output
            }], deactivate: [{
                type: Output
            }], tooltipTemplate: [{
                type: ContentChild,
                args: ['tooltipTemplate', { static: false }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm94LWNoYXJ0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9ib3gtY2hhcnQvYm94LWNoYXJ0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBRU4saUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVyRCxPQUFPLEVBQUUsV0FBVyxFQUFlLFNBQVMsRUFBYSxNQUFNLFVBQVUsQ0FBQztBQUMxRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUUzRSxPQUFPLEVBQUUsY0FBYyxFQUFpQixNQUFNLDhCQUE4QixDQUFDO0FBQzdFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7OztBQThENUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGtCQUFrQjtJQTVEekQ7O1FBNkRFLCtCQUErQjtRQUN0QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBQ3hCLG1CQUFjLEdBQW1CLGNBQWMsQ0FBQyxLQUFLLENBQUM7UUFDdEQsZ0JBQVcsR0FBVyxRQUFRLENBQUM7UUFHL0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFDOUIsVUFBSyxHQUFZLElBQUksQ0FBQztRQUN0QixVQUFLLEdBQVksSUFBSSxDQUFDO1FBQ3RCLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9CLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9CLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBRzlCLGVBQVUsR0FBWSxJQUFJLENB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c0JBQTNCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxlQUFlO3NCQUF2QixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBRUksTUFBTTtzQkFBZixNQUFNO2dCQUNHLFFBQVE7c0JBQWpCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFFNkMsZUFBZTtzQkFBbEUsWUFBWTt1QkFBQyxpQkFBaUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ2hhcnRDb21wb25lbnQgfSBmcm9tICcuLi9jb21tb24vYmFzZS1jaGFydC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29sb3JIZWxwZXIgfSBmcm9tICcuLi9jb21tb24vY29sb3IuaGVscGVyJztcbmltcG9ydCB7IEJveENoYXJ0TXVsdGlTZXJpZXMsIEJveENoYXJ0U2VyaWVzLCBJQm94TW9kZWwsIFN0cmluZ09yTnVtYmVyT3JEYXRlIH0gZnJvbSAnLi4vbW9kZWxzL2NoYXJ0LWRhdGEubW9kZWwnO1xuaW1wb3J0IHsgc2NhbGVMaW5lYXIsIFNjYWxlTGluZWFyLCBzY2FsZUJhbmQsIFNjYWxlQmFuZCB9IGZyb20gJ2QzLXNjYWxlJztcbmltcG9ydCB7IGNhbGN1bGF0ZVZpZXdEaW1lbnNpb25zIH0gZnJvbSAnLi4vY29tbW9uL3ZpZXctZGltZW5zaW9ucy5oZWxwZXInO1xuaW1wb3J0IHsgVmlld0RpbWVuc2lvbnMgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvdmlldy1kaW1lbnNpb24uaW50ZXJmYWNlJztcbmltcG9ydCB7IExlZ2VuZFBvc2l0aW9uLCBMZWdlbmRPcHRpb25zIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2xlZ2VuZC5tb2RlbCc7XG5pbXBvcnQgeyBTY2FsZVR5cGUgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvc2NhbGUtdHlwZS5lbnVtJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LWNoYXJ0cy1ib3gtY2hhcnQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZ3gtY2hhcnRzLWNoYXJ0XG4gICAgICBbdmlld109XCJbd2lkdGgsIGhlaWdodF1cIlxuICAgICAgW3Nob3dMZWdlbmRdPVwibGVnZW5kXCJcbiAgICAgIFtsZWdlbmRPcHRpb25zXT1cImxlZ2VuZE9wdGlvbnNcIlxuICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAobGVnZW5kTGFiZWxDbGljayk9XCJvbkNsaWNrKCRldmVudClcIlxuICAgICAgKGxlZ2VuZExhYmVsQWN0aXZhdGUpPVwib25BY3RpdmF0ZSgkZXZlbnQpXCJcbiAgICAgIChsZWdlbmRMYWJlbERlYWN0aXZhdGUpPVwib25EZWFjdGl2YXRlKCRldmVudClcIlxuICAgID5cbiAgICAgIDxzdmc6ZyBbYXR0ci50cmFuc2Zvcm1dPVwidHJhbnNmb3JtXCIgY2xhc3M9XCJib3gtY2hhcnQgY2hhcnRcIj5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy14LWF4aXNcbiAgICAgICAgICBbc2hvd0dyaWRMaW5lc109XCJzaG93R3JpZExpbmVzXCJcbiAgICAgICAgICBbZGltc109XCJkaW1zXCJcbiAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgW3Nob3dMYWJlbF09XCJzaG93WEF4aXNMYWJlbFwiXG4gICAgICAgICAgW2xhYmVsVGV4dF09XCJ4QXhpc0xhYmVsXCJcbiAgICAgICAgICAoZGltZW5zaW9uc0NoYW5nZWQpPVwidXBkYXRlWEF4aXNIZWlnaHQoJGV2ZW50KVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMteS1heGlzXG4gICAgICAgICAgW3Nob3dHcmlkTGluZXNdPVwic2hvd0dyaWRMaW5lc1wiXG4gICAgICAgICAgW2RpbXNdPVwiZGltc1wiXG4gICAgICAgICAgW3lTY2FsZV09XCJ5U2NhbGVcIlxuICAgICAgICAgIFtzaG93TGFiZWxdPVwic2hvd1lBeGlzTGFiZWxcIlxuICAgICAgICAgIFtsYWJlbFRleHRdPVwieUF4aXNMYWJlbFwiXG4gICAgICAgICAgKGRpbWVuc2lvbnNDaGFuZ2VkKT1cInVwZGF0ZVlBeGlzV2lkdGgoJGV2ZW50KVwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2ZzpnPlxuICAgICAgPHN2ZzpnIFthdHRyLnRyYW5zZm9ybV09XCJ0cmFuc2Zvcm1cIj5cbiAgICAgICAgPHN2ZzpnICpuZ0Zvcj1cImxldCByZXN1bHQgb2YgcmVzdWx0czsgdHJhY2tCeTogdHJhY2tCeVwiPlxuICAgICAgICAgIDxzdmc6Z1xuICAgICAgICAgICAgbmd4LWNoYXJ0cy1ib3gtc2VyaWVzXG4gICAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgICBbeVNjYWxlXT1cInlTY2FsZVwiXG4gICAgICAgICAgICBbY29sb3JzXT1cImNvbG9yc1wiXG4gICAgICAgICAgICBbcm91bmRFZGdlc109XCJyb3VuZEVkZ2VzXCJcbiAgICAgICAgICAgIFtzdHJva2VDb2xvcl09XCJzdHJva2VDb2xvclwiXG4gICAgICAgICAgICBbc3Ryb2tlV2lkdGhdPVwic3Ryb2tlV2lkdGhcIlxuICAgICAgICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgICAgICAgW3Rvb2x0aXBUZW1wbGF0ZV09XCJ0b29sdGlwVGVtcGxhdGVcIlxuICAgICAgICAgICAgW3Nlcmllc109XCJyZXN1bHRcIlxuICAgICAgICAgICAgW2RpbXNdPVwiZGltc1wiXG4gICAgICAgICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgICAgICAgIFtncmFkaWVudF09XCJncmFkaWVudFwiXG4gICAgICAgICAgICAoYWN0aXZhdGUpPVwib25BY3RpdmF0ZSgkZXZlbnQpXCJcbiAgICAgICAgICAgIChkZWFjdGl2YXRlKT1cIm9uRGVhY3RpdmF0ZSgkZXZlbnQpXCJcbiAgICAgICAgICAgIChzZWxlY3QpPVwib25DbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2ZzpnPlxuICAgICAgPC9zdmc6Zz5cbiAgICA8L25neC1jaGFydHMtY2hhcnQ+XG4gIGAsXG4gIHN0eWxlVXJsczogWycuLi9jb21tb24vYmFzZS1jaGFydC5jb21wb25lbnQuc2NzcyddLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBCb3hDaGFydENvbXBvbmVudCBleHRlbmRzIEJhc2VDaGFydENvbXBvbmVudCB7XG4gIC8qKiBTaG93IG9yIGhpZGUgdGhlIGxlZ2VuZC4gKi9cbiAgQElucHV0KCkgbGVnZW5kOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGxlZ2VuZFBvc2l0aW9uOiBMZWdlbmRQb3NpdGlvbiA9IExlZ2VuZFBvc2l0aW9uLlJpZ2h0O1xuICBASW5wdXQoKSBsZWdlbmRUaXRsZTogc3RyaW5nID0gJ0xlZ2VuZCc7XG4gIC8qKiBJIHRoaW5rIGl0IGlzIGJldHRlciB0byBoYW5kbGUgbGVnZW5kIG9wdGlvbnMgYXMgc2luZ2xlIElucHV0IG9iamVjdCBvZiB0eXBlIElMZWdlbmRPcHRpb25zICovXG4gIEBJbnB1dCgpIGxlZ2VuZE9wdGlvbnNDb25maWc6IExlZ2VuZE9wdGlvbnM7XG4gIEBJbnB1dCgpIHNob3dHcmlkTGluZXM6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSB4QXhpczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHlBeGlzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgc2hvd1hBeGlzTGFiZWw6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBzaG93WUF4aXNMYWJlbDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHJvdW5kRG9tYWluczogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSB4QXhpc0xhYmVsOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHlBeGlzTGFiZWw6IHN0cmluZztcbiAgQElucHV0KCkgcm91bmRFZGdlczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHN0cm9rZUNvbG9yOiBzdHJpbmcgPSAnI0ZGRkZGRic7XG4gIEBJbnB1dCgpIHN0cm9rZVdpZHRoOiBudW1iZXIgPSAyO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZ3JhZGllbnQ6IGJvb2xlYW47XG5cbiAgQE91dHB1dCgpIHNlbGVjdDogRXZlbnRFbWl0dGVyPElCb3hNb2RlbD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPElCb3hNb2RlbD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8SUJveE1vZGVsPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBAQ29udGVudENoaWxkKCd0b29sdGlwVGVtcGxhdGUnLCB7IHN0YXRpYzogZmFsc2UgfSkgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIC8qKiBJbnB1dCBEYXRhLCB0aGlzIGNhbWUgZnJvbSBCYXNlIENoYXJ0IENvbXBvbmVudC4gKi9cbiAgcmVzdWx0czogQm94Q2hhcnRNdWx0aVNlcmllcztcbiAgLyoqIENoYXJ0IERpbWVuc2lvbnMsIHRoaXMgY2FtZSBmcm9tIEJhc2UgQ2hhcnQgQ29tcG9uZW50LiAqL1xuICBkaW1zOiBWaWV3RGltZW5zaW9ucztcbiAgLyoqIENvbG9yIGRhdGEuICovXG4gIGNvbG9yczogQ29sb3JIZWxwZXI7XG4gIC8qKiBUcmFuc2Zvcm0gc3RyaW5nIGNzcyBhdHRyaWJ1dGUgZm9yIHRoZSBjaGFydCBjb250YWluZXIgKi9cbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG5cbiAgLyoqIENoYXJ0IE1hcmdpbnMgKEZvciBlYWNoIHNpZGUsIGNvdW50ZXJjbG9jayB3aXNlKS4gKi9cbiAgbWFyZ2luOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSA9IFsxMCwgMjAsIDEwLCAyMF07XG5cbiAgLyoqIExlZ2VuZCBPcHRpb25zIG9iamVjdCB0byBoYW5kbGUgcG9zaXRpb25pbmcsIHRpdGxlLCBjb2xvcnMgYW5kIGRvbWFpbi4gKi9cbiAgbGVnZW5kT3B0aW9uczogTGVnZW5kT3B0aW9ucztcblxuICB4U2NhbGU6IFNjYWxlQmFuZDxzdHJpbmc+O1xuICB5U2NhbGU6IFNjYWxlTGluZWFyPG51bWJlciwgbnVtYmVyPjtcbiAgeERvbWFpbjogU3RyaW5nT3JOdW1iZXJPckRhdGVbXTtcbiAgeURvbWFpbjogbnVtYmVyW107XG4gIHNlcmllc0RvbWFpbjogc3RyaW5nW107XG4gIC8qKiBDaGFydCBYIGF4aXMgZGltZW5zaW9uLiAqL1xuICB4QXhpc0hlaWdodDogbnVtYmVyID0gMDtcbiAgLyoqIENoYXJ0IFkgYXhpcyBkaW1lbnNpb24uICovXG4gIHlBeGlzV2lkdGg6IG51bWJlciA9IDA7XG5cbiAgdHJhY2tCeShpbmRleDogbnVtYmVyLCBpdGVtOiBCb3hDaGFydFNlcmllcyk6IFN0cmluZ09yTnVtYmVyT3JEYXRlIHtcbiAgICByZXR1cm4gaXRlbS5uYW1lO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHN1cGVyLnVwZGF0ZSgpO1xuXG4gICAgdGhpcy5kaW1zID0gY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMoe1xuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgbWFyZ2luczogdGhpcy5tYXJnaW4sXG4gICAgICBzaG93WEF4aXM6IHRoaXMueEF4aXMsXG4gICAgICBzaG93WUF4aXM6IHRoaXMueUF4aXMsXG4gICAgICB4QXhpc0hlaWdodDogdGhpcy54QXhpc0hlaWdodCxcbiAgICAgIHlBeGlzV2lkdGg6IHRoaXMueUF4aXNXaWR0aCxcbiAgICAgIHNob3dYTGFiZWw6IHRoaXMuc2hvd1hBeGlzTGFiZWwsXG4gICAgICBzaG93WUxhYmVsOiB0aGlzLnNob3dZQXhpc0xhYmVsLFxuICAgICAgc2hvd0xlZ2VuZDogdGhpcy5sZWdlbmQsXG4gICAgICBsZWdlbmRQb3NpdGlvbjogdGhpcy5sZWdlbmRQb3NpdGlvblxuICAgIH0pO1xuXG4gICAgdGhpcy54RG9tYWluID0gdGhpcy5nZXRYRG9tYWluKCk7XG4gICAgdGhpcy55RG9tYWluID0gdGhpcy5nZXRZRG9tYWluKCk7XG4gICAgdGhpcy5zZXJpZXNEb21haW4gPSB0aGlzLmdldFNlcmllc0RvbWFpbigpO1xuICAgIHRoaXMuc2V0U2NhbGVzKCk7XG4gICAgdGhpcy5zZXRDb2xvcnMoKTtcblxuICAgIHRoaXMubGVnZW5kT3B0aW9ucyA9IHRoaXMuZ2V0TGVnZW5kT3B0aW9ucygpO1xuICAgIHRoaXMudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3RoaXMuZGltcy54T2Zmc2V0fSAsICR7dGhpcy5tYXJnaW5bMF19KWA7XG4gIH1cblxuICBzZXRDb2xvcnMoKTogdm9pZCB7XG4gICAgbGV0IGRvbWFpbjogc3RyaW5nW10gfCBudW1iZXJbXSA9IFtdO1xuICAgIGlmICh0aGlzLnNjaGVtZVR5cGUgPT09IFNjYWxlVHlwZS5PcmRpbmFsKSB7XG4gICAgICBkb21haW4gPSB0aGlzLnNlcmllc0RvbWFpbjtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9tYWluID0gdGhpcy55RG9tYWluO1xuICAgIH1cblxuICAgIHRoaXMuY29sb3JzID0gbmV3IENvbG9ySGVscGVyKHRoaXMuc2NoZW1lLCB0aGlzLnNjaGVtZVR5cGUsIGRvbWFpbiwgdGhpcy5jdXN0b21Db2xvcnMpO1xuICB9XG5cbiAgc2V0U2NhbGVzKCkge1xuICAgIHRoaXMueFNjYWxlID0gdGhpcy5nZXRYU2NhbGUodGhpcy54RG9tYWluLCB0aGlzLmRpbXMud2lkdGgpO1xuICAgIHRoaXMueVNjYWxlID0gdGhpcy5nZXRZU2NhbGUodGhpcy55RG9tYWluLCB0aGlzLmRpbXMuaGVpZ2h0KTtcbiAgfVxuXG4gIGdldFhTY2FsZShkb21haW46IEFycmF5PHN0cmluZyB8IG51bWJlciB8IERhdGU+LCB3aWR0aDogbnVtYmVyKTogU2NhbGVCYW5kPHN0cmluZz4ge1xuICAgIGNvbnN0IHNjYWxlID0gc2NhbGVCYW5kKClcbiAgICAgIC5kb21haW4oZG9tYWluLm1hcChkID0+IGQudG9TdHJpbmcoKSkpXG4gICAgICAucmFuZ2VSb3VuZChbMCwgd2lkdGhdKVxuICAgICAgLnBhZGRpbmcoMC41KTtcblxuICAgIHJldHVybiBzY2FsZTtcbiAgfVxuXG4gIGdldFlTY2FsZShkb21haW46IG51bWJlcltdLCBoZWlnaHQ6IG51bWJlcik6IFNjYWxlTGluZWFyPG51bWJlciwgbnVtYmVyPiB7XG4gICAgY29uc3Qgc2NhbGUgPSBzY2FsZUxpbmVhcigpLmRvbWFpbihkb21haW4pLnJhbmdlKFtoZWlnaHQsIDBdKTtcblxuICAgIHJldHVybiB0aGlzLnJvdW5kRG9tYWlucyA/IHNjYWxlLm5pY2UoKSA6IHNjYWxlO1xuICB9XG5cbiAgZ2V0VW5pcXVlQm94Q2hhcnRYRG9tYWluVmFsdWVzKHJlc3VsdHM6IEJveENoYXJ0TXVsdGlTZXJpZXMpIHtcbiAgICBjb25zdCB2YWx1ZVNldCA9IG5ldyBTZXQ8c3RyaW5nIHwgbnVtYmVyIHwgRGF0ZT4oKTtcbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICB2YWx1ZVNldC5hZGQocmVzdWx0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZVNldCk7XG4gIH1cblxuICBnZXRYRG9tYWluKCk6IEFycmF5PHN0cmluZyB8IG51bWJlciB8IERhdGU+IHtcbiAgICBsZXQgZG9tYWluOiBBcnJheTxzdHJpbmcgfCBudW1iZXIgfCBEYXRlPiA9IFtdO1xuICAgIGNvbnN0IHZhbHVlczogQXJyYXk8c3RyaW5nIHwgbnVtYmVyIHwgRGF0ZT4gPSB0aGlzLmdldFVuaXF1ZUJveENoYXJ0WERvbWFpblZhbHVlcyh0aGlzLnJlc3VsdHMpO1xuICAgIGxldCBtaW46IG51bWJlcjtcbiAgICBsZXQgbWF4OiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZXNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICBkb21haW4gPSB2YWx1ZXMubWFwKHZhbCA9PiB2YWwudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWVzWzBdID09PSAnbnVtYmVyJykge1xuICAgICAgY29uc3QgbWFwcGVkVmFsdWVzID0gdmFsdWVzLm1hcCh2ID0+IE51bWJlcih2KSk7XG4gICAgICBtaW4gPSBNYXRoLm1pbiguLi5tYXBwZWRWYWx1ZXMpO1xuICAgICAgbWF4ID0gTWF0aC5tYXgoLi4ubWFwcGVkVmFsdWVzKTtcbiAgICAgIGRvbWFpbiA9IFttaW4sIG1heF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1hcHBlZFZhbHVlcyA9IHZhbHVlcy5tYXAodiA9PiBOdW1iZXIobmV3IERhdGUodikpKTtcbiAgICAgIG1pbiA9IE1hdGgubWluKC4uLm1hcHBlZFZhbHVlcyk7XG4gICAgICBtYXggPSBNYXRoLm1heCguLi5tYXBwZWRWYWx1ZXMpO1xuICAgICAgZG9tYWluID0gW25ldyBEYXRlKG1pbiksIG5ldyBEYXRlKG1heCldO1xuICAgIH1cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG5cbiAgZ2V0WURvbWFpbigpOiBudW1iZXJbXSB7XG4gICAgY29uc3QgZG9tYWluOiBBcnJheTxudW1iZXIgfCBEYXRlPiA9IFtdO1xuICAgIGZvciAoY29uc3QgcmVzdWx0cyBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgZCBvZiByZXN1bHRzLnNlcmllcykge1xuICAgICAgICBpZiAoZG9tYWluLmluZGV4T2YoZC52YWx1ZSkgPCAwKSB7XG4gICAgICAgICAgZG9tYWluLnB1c2goZC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZXMgPSBbLi4uZG9tYWluXTtcbiAgICBjb25zdCBtYXBwZWRWYWx1ZXMgPSB2YWx1ZXMubWFwKHYgPT4gTnVtYmVyKHYpKTtcblxuICAgIGNvbnN0IG1pbjogbnVtYmVyID0gTWF0aC5taW4oLi4ubWFwcGVkVmFsdWVzKTtcbiAgICBjb25zdCBtYXg6IG51bWJlciA9IE1hdGgubWF4KC4uLm1hcHBlZFZhbHVlcyk7XG5cbiAgICByZXR1cm4gW21pbiwgbWF4XTtcbiAgfVxuXG4gIGdldFNlcmllc0RvbWFpbigpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdWx0cy5tYXAoZCA9PiBgJHtkLm5hbWV9YCk7XG4gIH1cblxuICB1cGRhdGVZQXhpc1dpZHRoKHsgd2lkdGggfSk6IHZvaWQge1xuICAgIHRoaXMueUF4aXNXaWR0aCA9IHdpZHRoO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1cGRhdGVYQXhpc0hlaWdodCh7IGhlaWdodCB9KTogdm9pZCB7XG4gICAgdGhpcy54QXhpc0hlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgb25DbGljayhkYXRhOiBJQm94TW9kZWwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdC5lbWl0KGRhdGEpO1xuICB9XG5cbiAgb25BY3RpdmF0ZShkYXRhOiBJQm94TW9kZWwpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2YXRlLmVtaXQoZGF0YSk7XG4gIH1cblxuICBvbkRlYWN0aXZhdGUoZGF0YTogSUJveE1vZGVsKTogdm9pZCB7XG4gICAgdGhpcy5kZWFjdGl2YXRlLmVtaXQoZGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGdldExlZ2VuZE9wdGlvbnMoKTogTGVnZW5kT3B0aW9ucyB7XG4gICAgY29uc3QgbGVnZW5kT3B0czogTGVnZW5kT3B0aW9ucyA9IHtcbiAgICAgIHNjYWxlVHlwZTogdGhpcy5zY2hlbWVUeXBlLFxuICAgICAgY29sb3JzOiB0aGlzLmNvbG9ycyxcbiAgICAgIGRvbWFpbjogW10sXG4gICAgICBwb3NpdGlvbjogdGhpcy5sZWdlbmRQb3NpdGlvbixcbiAgICAgIHRpdGxlOiB0aGlzLmxlZ2VuZFRpdGxlXG4gICAgfTtcbiAgICBpZiAodGhpcy5zY2hlbWVUeXBlID09PSBTY2FsZVR5cGUuT3JkaW5hbCkge1xuICAgICAgbGVnZW5kT3B0cy5kb21haW4gPSB0aGlzLnhEb21haW47XG4gICAgICBsZWdlbmRPcHRzLmNvbG9ycyA9IHRoaXMuY29sb3JzO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWdlbmRPcHRzLmRvbWFpbiA9IHRoaXMueURvbWFpbjtcbiAgICAgIGxlZ2VuZE9wdHMuY29sb3JzID0gdGhpcy5jb2xvcnMuc2NhbGU7XG4gICAgfVxuICAgIHJldHVybiBsZWdlbmRPcHRzO1xuICB9XG59XG4iXX0=