import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy, ContentChild, Output, EventEmitter } from '@angular/core';
import { scaleBand } from 'd3-scale';
import { BaseChartComponent } from '../common/base-chart.component';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { getScaleType } from '../common/domain.helper';
import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import * as i0 from "@angular/core";
import * as i1 from "../common/charts/chart.component";
import * as i2 from "../common/axes/x-axis.component";
import * as i3 from "../common/axes/y-axis.component";
import * as i4 from "./heat-map-cell-series.component";
import * as i5 from "@angular/common";
export class HeatMapComponent extends BaseChartComponent {
    constructor() {
        super(...arguments);
        this.legendTitle = 'Legend';
        this.legendPosition = LegendPosition.Right;
        this.innerPadding = 8;
        this.trimXAxisTicks = true;
        this.trimYAxisTicks = true;
        this.rotateXAxisTicks = true;
        this.maxXAxisTickLength = 16;
        this.maxYAxisTickLength = 16;
        this.tooltipDisabled = false;
        this.activeEntries = [];
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.margin = [10, 20, 10, 20];
        this.xAxisHeight = 0;
        this.yAxisWidth = 0;
        this.scaleType = ScaleType.Linear;
    }
    update() {
        super.update();
        this.formatDates();
        this.xDomain = this.getXDomain();
        this.yDomain = this.getYDomain();
        this.valueDomain = this.getValueDomain();
        this.scaleType = getScaleType(this.valueDomain, false);
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
            legendType: this.scaleType,
            legendPosition: this.legendPosition
        });
        if (this.scaleType === ScaleType.Linear) {
            let min = this.min;
            let max = this.max;
            if (!this.min) {
                min = Math.min(0, ...this.valueDomain);
            }
            if (!this.max) {
                max = Math.max(...this.valueDomain);
            }
            this.valueDomain = [min, max];
        }
        this.xScale = this.getXScale();
        this.yScale = this.getYScale();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
        this.rects = this.getRects();
    }
    getXDomain() {
        const domain = [];
        for (const group of this.results) {
            if (!domain.includes(group.name)) {
                domain.push(group.name);
            }
        }
        return domain;
    }
    getYDomain() {
        const domain = [];
        for (const group of this.results) {
            for (const d of group.series) {
                if (!domain.includes(d.name)) {
                    domain.push(d.name);
                }
            }
        }
        return domain;
    }
    getValueDomain() {
        const domain = [];
        for (const group of this.results) {
            for (const d of group.series) {
                if (!domain.includes(d.value)) {
                    domain.push(d.value);
                }
            }
        }
        return domain;
    }
    /**
     * Converts the input to gap paddingInner in fraction
     * Supports the following inputs:
     *    Numbers: 8
     *    Strings: "8", "8px", "8%"
     *    Arrays: [8,2], "8,2", "[8,2]"
     *    Mixed: [8,"2%"], ["8px","2%"], "8,2%", "[8,2%]"
     *
     * @memberOf HeatMapComponent
     */
    getDimension(value, index = 0, N, L) {
        if (typeof value === 'string') {
            value = value
                .replace('[', '')
                .replace(']', '')
                .replace('px', '')
                // tslint:disable-next-line: quotemark
                .replace("'", '');
            if (value.includes(',')) {
                value = value.split(',');
            }
        }
        if (Array.isArray(value) && typeof index === 'number') {
            return this.getDimension(value[index], null, N, L);
        }
        if (typeof value === 'string' && value.includes('%')) {
            return +value.replace('%', '') / 100;
        }
        return N / (L / +value + 1);
    }
    getXScale() {
        const f = this.getDimension(this.innerPadding, 0, this.xDomain.length, this.dims.width);
        return scaleBand().rangeRound([0, this.dims.width]).domain(this.xDomain).paddingInner(f);
    }
    getYScale() {
        const f = this.getDimension(this.innerPadding, 1, this.yDomain.length, this.dims.height);
        return scaleBand().rangeRound([this.dims.height, 0]).domain(this.yDomain).paddingInner(f);
    }
    getRects() {
        const rects = [];
        this.xDomain.map(xVal => {
            this.yDomain.map(yVal => {
                rects.push({
                    x: this.xScale(xVal),
                    y: this.yScale(yVal),
                    rx: 3,
                    width: this.xScale.bandwidth(),
                    height: this.yScale.bandwidth(),
                    fill: 'rgba(200,200,200,0.03)'
                });
            });
        });
        return rects;
    }
    onClick(data) {
        this.select.emit(data);
    }
    setColors() {
        this.colors = new ColorHelper(this.scheme, this.scaleType, this.valueDomain);
    }
    getLegendOptions() {
        return {
            scaleType: this.scaleType,
            domain: this.valueDomain,
            colors: this.scaleType === ScaleType.Ordinal ? this.colors : this.colors.scale,
            title: this.scaleType === ScaleType.Ordinal ? this.legendTitle : undefined,
            position: this.legendPosition
        };
    }
    updateYAxisWidth({ width }) {
        this.yAxisWidth = width;
        this.update();
    }
    updateXAxisHeight({ height }) {
        this.xAxisHeight = height;
        this.update();
    }
    onActivate(event, group, fromLegend = false) {
        const item = Object.assign({}, event);
        if (group) {
            item.series = group.name;
        }
        const items = this.results
            .map(g => g.series)
            .flat()
            .filter(i => {
            if (fromLegend) {
                return i.label === item.name;
            }
            else {
                return i.name === item.name && i.series === item.series;
            }
        });
        this.activeEntries = [...items];
        this.activate.emit({ value: item, entries: this.activeEntries });
    }
    onDeactivate(event, group, fromLegend = false) {
        const item = Object.assign({}, event);
        if (group) {
            item.series = group.name;
        }
        this.activeEntries = this.activeEntries.filter(i => {
            if (fromLegend) {
                return i.label !== item.name;
            }
            else {
                return !(i.name === item.name && i.series === item.series);
            }
        });
        this.deactivate.emit({ value: item, entries: this.activeEntries });
    }
}
HeatMapComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: HeatMapComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
HeatMapComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: HeatMapComponent, selector: "ngx-charts-heat-map", inputs: { legend: "legend", legendTitle: "legendTitle", legendPosition: "legendPosition", xAxis: "xAxis", yAxis: "yAxis", showXAxisLabel: "showXAxisLabel", showYAxisLabel: "showYAxisLabel", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel", gradient: "gradient", innerPadding: "innerPadding", trimXAxisTicks: "trimXAxisTicks", trimYAxisTicks: "trimYAxisTicks", rotateXAxisTicks: "rotateXAxisTicks", maxXAxisTickLength: "maxXAxisTickLength", maxYAxisTickLength: "maxYAxisTickLength", xAxisTickFormatting: "xAxisTickFormatting", yAxisTickFormatting: "yAxisTickFormatting", xAxisTicks: "xAxisTicks", yAxisTicks: "yAxisTicks", tooltipDisabled: "tooltipDisabled", tooltipText: "tooltipText", min: "min", max: "max", activeEntries: "activeEntries" }, outputs: { activate: "activate", deactivate: "deactivate" }, queries: [{ propertyName: "tooltipTemplate", first: true, predicate: ["tooltipTemplate"], descendants: true }], usesInheritance: true, ngImport: i0, template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [animations]="animations"
      [legendOptions]="legendOptions"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="heat-map chart">
        <svg:g
          ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="xScale"
          [dims]="dims"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          [trimTicks]="trimXAxisTicks"
          [rotateTicks]="rotateXAxisTicks"
          [maxTickLength]="maxXAxisTickLength"
          [tickFormatting]="xAxisTickFormatting"
          [ticks]="xAxisTicks"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:rect
          *ngFor="let rect of rects"
          [attr.x]="rect.x"
          [attr.y]="rect.y"
          [attr.rx]="rect.rx"
          [attr.width]="rect.width"
          [attr.height]="rect.height"
          [attr.fill]="rect.fill"
        />
        <svg:g
          ngx-charts-heat-map-cell-series
          [xScale]="xScale"
          [yScale]="yScale"
          [colors]="colors"
          [data]="results"
          [gradient]="gradient"
          [animations]="animations"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="tooltipText"
          (select)="onClick($event)"
          (activate)="onActivate($event, undefined)"
          (deactivate)="onDeactivate($event, undefined)"
        />
      </svg:g>
    </ngx-charts-chart>
  `, isInline: true, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"], components: [{ type: i1.ChartComponent, selector: "ngx-charts-chart", inputs: ["view", "showLegend", "legendOptions", "legendType", "activeEntries", "animations"], outputs: ["legendLabelClick", "legendLabelActivate", "legendLabelDeactivate"] }, { type: i2.XAxisComponent, selector: "g[ngx-charts-x-axis]", inputs: ["xScale", "dims", "trimTicks", "rotateTicks", "maxTickLength", "tickFormatting", "showGridLines", "showLabel", "labelText", "ticks", "xAxisTickCount", "xOrient", "xAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i3.YAxisComponent, selector: "g[ngx-charts-y-axis]", inputs: ["yScale", "dims", "trimTicks", "maxTickLength", "tickFormatting", "ticks", "showGridLines", "showLabel", "labelText", "yAxisTickCount", "yOrient", "referenceLines", "showRefLines", "showRefLabels", "yAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i4.HeatCellSeriesComponent, selector: "g[ngx-charts-heat-map-cell-series]", inputs: ["data", "colors", "xScale", "yScale", "gradient", "tooltipDisabled", "tooltipText", "tooltipTemplate", "animations"], outputs: ["select", "activate", "deactivate"] }], directives: [{ type: i5.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i5.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: HeatMapComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-charts-heat-map', template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [animations]="animations"
      [legendOptions]="legendOptions"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="heat-map chart">
        <svg:g
          ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="xScale"
          [dims]="dims"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          [trimTicks]="trimXAxisTicks"
          [rotateTicks]="rotateXAxisTicks"
          [maxTickLength]="maxXAxisTickLength"
          [tickFormatting]="xAxisTickFormatting"
          [ticks]="xAxisTicks"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:rect
          *ngFor="let rect of rects"
          [attr.x]="rect.x"
          [attr.y]="rect.y"
          [attr.rx]="rect.rx"
          [attr.width]="rect.width"
          [attr.height]="rect.height"
          [attr.fill]="rect.fill"
        />
        <svg:g
          ngx-charts-heat-map-cell-series
          [xScale]="xScale"
          [yScale]="yScale"
          [colors]="colors"
          [data]="results"
          [gradient]="gradient"
          [animations]="animations"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="tooltipText"
          (select)="onClick($event)"
          (activate)="onActivate($event, undefined)"
          (deactivate)="onDeactivate($event, undefined)"
        />
      </svg:g>
    </ngx-charts-chart>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"] }]
        }], propDecorators: { legend: [{
                type: Input
            }], legendTitle: [{
                type: Input
            }], legendPosition: [{
                type: Input
            }], xAxis: [{
                type: Input
            }], yAxis: [{
                type: Input
            }], showXAxisLabel: [{
                type: Input
            }], showYAxisLabel: [{
                type: Input
            }], xAxisLabel: [{
                type: Input
            }], yAxisLabel: [{
                type: Input
            }], gradient: [{
                type: Input
            }], innerPadding: [{
                type: Input
            }], trimXAxisTicks: [{
                type: Input
            }], trimYAxisTicks: [{
                type: Input
            }], rotateXAxisTicks: [{
                type: Input
            }], maxXAxisTickLength: [{
                type: Input
            }], maxYAxisTickLength: [{
                type: Input
            }], xAxisTickFormatting: [{
                type: Input
            }], yAxisTickFormatting: [{
                type: Input
            }], xAxisTicks: [{
                type: Input
            }], yAxisTicks: [{
                type: Input
            }], tooltipDisabled: [{
                type: Input
            }], tooltipText: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], activeEntries: [{
                type: Input
            }], activate: [{
                type: Output
            }], deactivate: [{
                type: Output
            }], tooltipTemplate: [{
                type: ContentChild,
                args: ['tooltipTemplate']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhdC1tYXAuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2hlYXQtbWFwL2hlYXQtbWFwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLFlBQVksRUFFWixNQUFNLEVBQ04sWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFckMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQWlCLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7OztBQWdGNUQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGtCQUFrQjtJQXJFeEQ7O1FBdUVXLGdCQUFXLEdBQVcsUUFBUSxDQUFDO1FBQy9CLG1CQUFjLEdBQW1CLGNBQWMsQ0FBQyxLQUFLLENBQUM7UUFRdEQsaUJBQVksR0FBMEMsQ0FBQyxDQUFDO1FBQ3hELG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9CLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9CLHFCQUFnQixHQUFZLElBQUksQ0FBQztRQUNqQyx1QkFBa0IsR0FBVyxFQUFFLENBQUM7UUFDaEMsdUJBQWtCLEdBQVcsRUFBRSxDQUFDO1FBS2hDLG9CQUFlLEdBQVksS0FBSyxDQUFD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QUFtQjtzQkFBM0IsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLEdBQUc7c0JBQVgsS0FBSztnQkFDRyxHQUFHO3NCQUFYLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFFSSxRQUFRO3NCQUFqQixNQUFNO2dCQUNHLFVBQVU7c0JBQW5CLE1BQU07Z0JBRTBCLGVBQWU7c0JBQS9DLFlBQVk7dUJBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb250ZW50Q2hpbGQsXG4gIFRlbXBsYXRlUmVmLFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IHNjYWxlQmFuZCB9IGZyb20gJ2QzLXNjYWxlJztcblxuaW1wb3J0IHsgQmFzZUNoYXJ0Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2UtY2hhcnQuY29tcG9uZW50JztcbmltcG9ydCB7IGNhbGN1bGF0ZVZpZXdEaW1lbnNpb25zIH0gZnJvbSAnLi4vY29tbW9uL3ZpZXctZGltZW5zaW9ucy5oZWxwZXInO1xuaW1wb3J0IHsgQ29sb3JIZWxwZXIgfSBmcm9tICcuLi9jb21tb24vY29sb3IuaGVscGVyJztcbmltcG9ydCB7IGdldFNjYWxlVHlwZSB9IGZyb20gJy4uL2NvbW1vbi9kb21haW4uaGVscGVyJztcbmltcG9ydCB7IExlZ2VuZE9wdGlvbnMsIExlZ2VuZFBvc2l0aW9uIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2xlZ2VuZC5tb2RlbCc7XG5pbXBvcnQgeyBWaWV3RGltZW5zaW9ucyB9IGZyb20gJy4uL2NvbW1vbi90eXBlcy92aWV3LWRpbWVuc2lvbi5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgU2NhbGVUeXBlIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL3NjYWxlLXR5cGUuZW51bSc7XG5cbmludGVyZmFjZSBSZWN0SXRlbSB7XG4gIGZpbGw6IHN0cmluZztcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHJ4OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtY2hhcnRzLWhlYXQtbWFwJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmd4LWNoYXJ0cy1jaGFydFxuICAgICAgW3ZpZXddPVwiW3dpZHRoLCBoZWlnaHRdXCJcbiAgICAgIFtzaG93TGVnZW5kXT1cImxlZ2VuZFwiXG4gICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgIFtsZWdlbmRPcHRpb25zXT1cImxlZ2VuZE9wdGlvbnNcIlxuICAgICAgKGxlZ2VuZExhYmVsQ2xpY2spPVwib25DbGljaygkZXZlbnQpXCJcbiAgICA+XG4gICAgICA8c3ZnOmcgW2F0dHIudHJhbnNmb3JtXT1cInRyYW5zZm9ybVwiIGNsYXNzPVwiaGVhdC1tYXAgY2hhcnRcIj5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy14LWF4aXNcbiAgICAgICAgICAqbmdJZj1cInhBeGlzXCJcbiAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgW2RpbXNdPVwiZGltc1wiXG4gICAgICAgICAgW3Nob3dMYWJlbF09XCJzaG93WEF4aXNMYWJlbFwiXG4gICAgICAgICAgW2xhYmVsVGV4dF09XCJ4QXhpc0xhYmVsXCJcbiAgICAgICAgICBbdHJpbVRpY2tzXT1cInRyaW1YQXhpc1RpY2tzXCJcbiAgICAgICAgICBbcm90YXRlVGlja3NdPVwicm90YXRlWEF4aXNUaWNrc1wiXG4gICAgICAgICAgW21heFRpY2tMZW5ndGhdPVwibWF4WEF4aXNUaWNrTGVuZ3RoXCJcbiAgICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwieEF4aXNUaWNrRm9ybWF0dGluZ1wiXG4gICAgICAgICAgW3RpY2tzXT1cInhBeGlzVGlja3NcIlxuICAgICAgICAgIChkaW1lbnNpb25zQ2hhbmdlZCk9XCJ1cGRhdGVYQXhpc0hlaWdodCgkZXZlbnQpXCJcbiAgICAgICAgPjwvc3ZnOmc+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMteS1heGlzXG4gICAgICAgICAgKm5nSWY9XCJ5QXhpc1wiXG4gICAgICAgICAgW3lTY2FsZV09XCJ5U2NhbGVcIlxuICAgICAgICAgIFtkaW1zXT1cImRpbXNcIlxuICAgICAgICAgIFtzaG93TGFiZWxdPVwic2hvd1lBeGlzTGFiZWxcIlxuICAgICAgICAgIFtsYWJlbFRleHRdPVwieUF4aXNMYWJlbFwiXG4gICAgICAgICAgW3RyaW1UaWNrc109XCJ0cmltWUF4aXNUaWNrc1wiXG4gICAgICAgICAgW21heFRpY2tMZW5ndGhdPVwibWF4WUF4aXNUaWNrTGVuZ3RoXCJcbiAgICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwieUF4aXNUaWNrRm9ybWF0dGluZ1wiXG4gICAgICAgICAgW3RpY2tzXT1cInlBeGlzVGlja3NcIlxuICAgICAgICAgIChkaW1lbnNpb25zQ2hhbmdlZCk9XCJ1cGRhdGVZQXhpc1dpZHRoKCRldmVudClcIlxuICAgICAgICA+PC9zdmc6Zz5cbiAgICAgICAgPHN2ZzpyZWN0XG4gICAgICAgICAgKm5nRm9yPVwibGV0IHJlY3Qgb2YgcmVjdHNcIlxuICAgICAgICAgIFthdHRyLnhdPVwicmVjdC54XCJcbiAgICAgICAgICBbYXR0ci55XT1cInJlY3QueVwiXG4gICAgICAgICAgW2F0dHIucnhdPVwicmVjdC5yeFwiXG4gICAgICAgICAgW2F0dHIud2lkdGhdPVwicmVjdC53aWR0aFwiXG4gICAgICAgICAgW2F0dHIuaGVpZ2h0XT1cInJlY3QuaGVpZ2h0XCJcbiAgICAgICAgICBbYXR0ci5maWxsXT1cInJlY3QuZmlsbFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMtaGVhdC1tYXAtY2VsbC1zZXJpZXNcbiAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgW3lTY2FsZV09XCJ5U2NhbGVcIlxuICAgICAgICAgIFtjb2xvcnNdPVwiY29sb3JzXCJcbiAgICAgICAgICBbZGF0YV09XCJyZXN1bHRzXCJcbiAgICAgICAgICBbZ3JhZGllbnRdPVwiZ3JhZGllbnRcIlxuICAgICAgICAgIFthbmltYXRpb25zXT1cImFuaW1hdGlvbnNcIlxuICAgICAgICAgIFt0b29sdGlwRGlzYWJsZWRdPVwidG9vbHRpcERpc2FibGVkXCJcbiAgICAgICAgICBbdG9vbHRpcFRlbXBsYXRlXT1cInRvb2x0aXBUZW1wbGF0ZVwiXG4gICAgICAgICAgW3Rvb2x0aXBUZXh0XT1cInRvb2x0aXBUZXh0XCJcbiAgICAgICAgICAoc2VsZWN0KT1cIm9uQ2xpY2soJGV2ZW50KVwiXG4gICAgICAgICAgKGFjdGl2YXRlKT1cIm9uQWN0aXZhdGUoJGV2ZW50LCB1bmRlZmluZWQpXCJcbiAgICAgICAgICAoZGVhY3RpdmF0ZSk9XCJvbkRlYWN0aXZhdGUoJGV2ZW50LCB1bmRlZmluZWQpXCJcbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnOmc+XG4gICAgPC9uZ3gtY2hhcnRzLWNoYXJ0PlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3R5bGVVcmxzOiBbJy4uL2NvbW1vbi9iYXNlLWNoYXJ0LmNvbXBvbmVudC5zY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgSGVhdE1hcENvbXBvbmVudCBleHRlbmRzIEJhc2VDaGFydENvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGxlZ2VuZDogYm9vbGVhbjtcbiAgQElucHV0KCkgbGVnZW5kVGl0bGU6IHN0cmluZyA9ICdMZWdlbmQnO1xuICBASW5wdXQoKSBsZWdlbmRQb3NpdGlvbjogTGVnZW5kUG9zaXRpb24gPSBMZWdlbmRQb3NpdGlvbi5SaWdodDtcbiAgQElucHV0KCkgeEF4aXM6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHlBeGlzOiBib29sZWFuO1xuICBASW5wdXQoKSBzaG93WEF4aXNMYWJlbDogYm9vbGVhbjtcbiAgQElucHV0KCkgc2hvd1lBeGlzTGFiZWw6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHhBeGlzTGFiZWw6IHN0cmluZztcbiAgQElucHV0KCkgeUF4aXNMYWJlbDogc3RyaW5nO1xuICBASW5wdXQoKSBncmFkaWVudDogYm9vbGVhbjtcbiAgQElucHV0KCkgaW5uZXJQYWRkaW5nOiBudW1iZXIgfCBudW1iZXJbXSB8IHN0cmluZyB8IHN0cmluZ1tdID0gODtcbiAgQElucHV0KCkgdHJpbVhBeGlzVGlja3M6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSB0cmltWUF4aXNUaWNrczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHJvdGF0ZVhBeGlzVGlja3M6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBtYXhYQXhpc1RpY2tMZW5ndGg6IG51bWJlciA9IDE2O1xuICBASW5wdXQoKSBtYXhZQXhpc1RpY2tMZW5ndGg6IG51bWJlciA9IDE2O1xuICBASW5wdXQoKSB4QXhpc1RpY2tGb3JtYXR0aW5nOiBhbnk7XG4gIEBJbnB1dCgpIHlBeGlzVGlja0Zvcm1hdHRpbmc6IGFueTtcbiAgQElucHV0KCkgeEF4aXNUaWNrczogYW55W107XG4gIEBJbnB1dCgpIHlBeGlzVGlja3M6IGFueVtdO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdG9vbHRpcFRleHQ6IGFueTtcbiAgQElucHV0KCkgbWluOiBudW1iZXI7XG4gIEBJbnB1dCgpIG1heDogbnVtYmVyO1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXSA9IFtdO1xuXG4gIEBPdXRwdXQoKSBhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBAQ29udGVudENoaWxkKCd0b29sdGlwVGVtcGxhdGUnKSB0b29sdGlwVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgZGltczogVmlld0RpbWVuc2lvbnM7XG4gIHhEb21haW46IHN0cmluZ1tdO1xuICB5RG9tYWluOiBzdHJpbmdbXTtcbiAgdmFsdWVEb21haW46IGFueVtdO1xuICB4U2NhbGU6IGFueTtcbiAgeVNjYWxlOiBhbnk7XG4gIGNvbG9yczogQ29sb3JIZWxwZXI7XG4gIGNvbG9yU2NhbGU6IGFueTtcbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gIHJlY3RzOiBSZWN0SXRlbVtdO1xuICBtYXJnaW46IG51bWJlcltdID0gWzEwLCAyMCwgMTAsIDIwXTtcbiAgeEF4aXNIZWlnaHQ6IG51bWJlciA9IDA7XG4gIHlBeGlzV2lkdGg6IG51bWJlciA9IDA7XG4gIGxlZ2VuZE9wdGlvbnM6IExlZ2VuZE9wdGlvbnM7XG4gIHNjYWxlVHlwZTogU2NhbGVUeXBlID0gU2NhbGVUeXBlLkxpbmVhcjtcblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgc3VwZXIudXBkYXRlKCk7XG5cbiAgICB0aGlzLmZvcm1hdERhdGVzKCk7XG5cbiAgICB0aGlzLnhEb21haW4gPSB0aGlzLmdldFhEb21haW4oKTtcbiAgICB0aGlzLnlEb21haW4gPSB0aGlzLmdldFlEb21haW4oKTtcbiAgICB0aGlzLnZhbHVlRG9tYWluID0gdGhpcy5nZXRWYWx1ZURvbWFpbigpO1xuXG4gICAgdGhpcy5zY2FsZVR5cGUgPSBnZXRTY2FsZVR5cGUodGhpcy52YWx1ZURvbWFpbiwgZmFsc2UpO1xuXG4gICAgdGhpcy5kaW1zID0gY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMoe1xuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgbWFyZ2luczogdGhpcy5tYXJnaW4sXG4gICAgICBzaG93WEF4aXM6IHRoaXMueEF4aXMsXG4gICAgICBzaG93WUF4aXM6IHRoaXMueUF4aXMsXG4gICAgICB4QXhpc0hlaWdodDogdGhpcy54QXhpc0hlaWdodCxcbiAgICAgIHlBeGlzV2lkdGg6IHRoaXMueUF4aXNXaWR0aCxcbiAgICAgIHNob3dYTGFiZWw6IHRoaXMuc2hvd1hBeGlzTGFiZWwsXG4gICAgICBzaG93WUxhYmVsOiB0aGlzLnNob3dZQXhpc0xhYmVsLFxuICAgICAgc2hvd0xlZ2VuZDogdGhpcy5sZWdlbmQsXG4gICAgICBsZWdlbmRUeXBlOiB0aGlzLnNjYWxlVHlwZSBhcyBhbnksXG4gICAgICBsZWdlbmRQb3NpdGlvbjogdGhpcy5sZWdlbmRQb3NpdGlvblxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuTGluZWFyKSB7XG4gICAgICBsZXQgbWluID0gdGhpcy5taW47XG4gICAgICBsZXQgbWF4ID0gdGhpcy5tYXg7XG4gICAgICBpZiAoIXRoaXMubWluKSB7XG4gICAgICAgIG1pbiA9IE1hdGgubWluKDAsIC4uLnRoaXMudmFsdWVEb21haW4pO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLm1heCkge1xuICAgICAgICBtYXggPSBNYXRoLm1heCguLi50aGlzLnZhbHVlRG9tYWluKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsdWVEb21haW4gPSBbbWluLCBtYXhdO1xuICAgIH1cblxuICAgIHRoaXMueFNjYWxlID0gdGhpcy5nZXRYU2NhbGUoKTtcbiAgICB0aGlzLnlTY2FsZSA9IHRoaXMuZ2V0WVNjYWxlKCk7XG5cbiAgICB0aGlzLnNldENvbG9ycygpO1xuICAgIHRoaXMubGVnZW5kT3B0aW9ucyA9IHRoaXMuZ2V0TGVnZW5kT3B0aW9ucygpO1xuXG4gICAgdGhpcy50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGhpcy5kaW1zLnhPZmZzZXR9ICwgJHt0aGlzLm1hcmdpblswXX0pYDtcbiAgICB0aGlzLnJlY3RzID0gdGhpcy5nZXRSZWN0cygpO1xuICB9XG5cbiAgZ2V0WERvbWFpbigpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZG9tYWluID0gW107XG4gICAgZm9yIChjb25zdCBncm91cCBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGlmICghZG9tYWluLmluY2x1ZGVzKGdyb3VwLm5hbWUpKSB7XG4gICAgICAgIGRvbWFpbi5wdXNoKGdyb3VwLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkb21haW47XG4gIH1cblxuICBnZXRZRG9tYWluKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBkb21haW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5yZXN1bHRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgZ3JvdXAuc2VyaWVzKSB7XG4gICAgICAgIGlmICghZG9tYWluLmluY2x1ZGVzKGQubmFtZSkpIHtcbiAgICAgICAgICBkb21haW4ucHVzaChkLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbWFpbjtcbiAgfVxuXG4gIGdldFZhbHVlRG9tYWluKCk6IGFueVtdIHtcbiAgICBjb25zdCBkb21haW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5yZXN1bHRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgZ3JvdXAuc2VyaWVzKSB7XG4gICAgICAgIGlmICghZG9tYWluLmluY2x1ZGVzKGQudmFsdWUpKSB7XG4gICAgICAgICAgZG9tYWluLnB1c2goZC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBpbnB1dCB0byBnYXAgcGFkZGluZ0lubmVyIGluIGZyYWN0aW9uXG4gICAqIFN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgaW5wdXRzOlxuICAgKiAgICBOdW1iZXJzOiA4XG4gICAqICAgIFN0cmluZ3M6IFwiOFwiLCBcIjhweFwiLCBcIjglXCJcbiAgICogICAgQXJyYXlzOiBbOCwyXSwgXCI4LDJcIiwgXCJbOCwyXVwiXG4gICAqICAgIE1peGVkOiBbOCxcIjIlXCJdLCBbXCI4cHhcIixcIjIlXCJdLCBcIjgsMiVcIiwgXCJbOCwyJV1cIlxuICAgKlxuICAgKiBAbWVtYmVyT2YgSGVhdE1hcENvbXBvbmVudFxuICAgKi9cbiAgZ2V0RGltZW5zaW9uKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBBcnJheTxzdHJpbmcgfCBudW1iZXI+LCBpbmRleDogbnVtYmVyID0gMCwgTjogbnVtYmVyLCBMOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlXG4gICAgICAgIC5yZXBsYWNlKCdbJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCddJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCdweCcsICcnKVxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IHF1b3RlbWFya1xuICAgICAgICAucmVwbGFjZShcIidcIiwgJycpO1xuXG4gICAgICBpZiAodmFsdWUuaW5jbHVkZXMoJywnKSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCcsJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREaW1lbnNpb24odmFsdWVbaW5kZXhdLCBudWxsLCBOLCBMKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUuaW5jbHVkZXMoJyUnKSkge1xuICAgICAgcmV0dXJuICt2YWx1ZS5yZXBsYWNlKCclJywgJycpIC8gMTAwO1xuICAgIH1cbiAgICByZXR1cm4gTiAvIChMIC8gK3ZhbHVlICsgMSk7XG4gIH1cblxuICBnZXRYU2NhbGUoKTogYW55IHtcbiAgICBjb25zdCBmID0gdGhpcy5nZXREaW1lbnNpb24odGhpcy5pbm5lclBhZGRpbmcsIDAsIHRoaXMueERvbWFpbi5sZW5ndGgsIHRoaXMuZGltcy53aWR0aCk7XG4gICAgcmV0dXJuIHNjYWxlQmFuZCgpLnJhbmdlUm91bmQoWzAsIHRoaXMuZGltcy53aWR0aF0pLmRvbWFpbih0aGlzLnhEb21haW4pLnBhZGRpbmdJbm5lcihmKTtcbiAgfVxuXG4gIGdldFlTY2FsZSgpOiBhbnkge1xuICAgIGNvbnN0IGYgPSB0aGlzLmdldERpbWVuc2lvbih0aGlzLmlubmVyUGFkZGluZywgMSwgdGhpcy55RG9tYWluLmxlbmd0aCwgdGhpcy5kaW1zLmhlaWdodCk7XG4gICAgcmV0dXJuIHNjYWxlQmFuZCgpLnJhbmdlUm91bmQoW3RoaXMuZGltcy5oZWlnaHQsIDBdKS5kb21haW4odGhpcy55RG9tYWluKS5wYWRkaW5nSW5uZXIoZik7XG4gIH1cblxuICBnZXRSZWN0cygpOiBSZWN0SXRlbVtdIHtcbiAgICBjb25zdCByZWN0cyA9IFtdO1xuXG4gICAgdGhpcy54RG9tYWluLm1hcCh4VmFsID0+IHtcbiAgICAgIHRoaXMueURvbWFpbi5tYXAoeVZhbCA9PiB7XG4gICAgICAgIHJlY3RzLnB1c2goe1xuICAgICAgICAgIHg6IHRoaXMueFNjYWxlKHhWYWwpLFxuICAgICAgICAgIHk6IHRoaXMueVNjYWxlKHlWYWwpLFxuICAgICAgICAgIHJ4OiAzLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnhTY2FsZS5iYW5kd2lkdGgoKSxcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMueVNjYWxlLmJhbmR3aWR0aCgpLFxuICAgICAgICAgIGZpbGw6ICdyZ2JhKDIwMCwyMDAsMjAwLDAuMDMpJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlY3RzO1xuICB9XG5cbiAgb25DbGljayhkYXRhKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3QuZW1pdChkYXRhKTtcbiAgfVxuXG4gIHNldENvbG9ycygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbG9ycyA9IG5ldyBDb2xvckhlbHBlcih0aGlzLnNjaGVtZSwgdGhpcy5zY2FsZVR5cGUsIHRoaXMudmFsdWVEb21haW4pO1xuICB9XG5cbiAgZ2V0TGVnZW5kT3B0aW9ucygpOiBMZWdlbmRPcHRpb25zIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NhbGVUeXBlOiB0aGlzLnNjYWxlVHlwZSxcbiAgICAgIGRvbWFpbjogdGhpcy52YWx1ZURvbWFpbixcbiAgICAgIGNvbG9yczogdGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5PcmRpbmFsID8gdGhpcy5jb2xvcnMgOiB0aGlzLmNvbG9ycy5zY2FsZSxcbiAgICAgIHRpdGxlOiB0aGlzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLk9yZGluYWwgPyB0aGlzLmxlZ2VuZFRpdGxlIDogdW5kZWZpbmVkLFxuICAgICAgcG9zaXRpb246IHRoaXMubGVnZW5kUG9zaXRpb25cbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlWUF4aXNXaWR0aCh7IHdpZHRoIH06IHsgd2lkdGg6IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy55QXhpc1dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZVhBeGlzSGVpZ2h0KHsgaGVpZ2h0IH06IHsgaGVpZ2h0OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIHRoaXMueEF4aXNIZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIG9uQWN0aXZhdGUoZXZlbnQsIGdyb3VwLCBmcm9tTGVnZW5kOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBpdGVtID0gT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQpO1xuICAgIGlmIChncm91cCkge1xuICAgICAgaXRlbS5zZXJpZXMgPSBncm91cC5uYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5yZXN1bHRzXG4gICAgICAubWFwKGcgPT4gZy5zZXJpZXMpXG4gICAgICAuZmxhdCgpXG4gICAgICAuZmlsdGVyKGkgPT4ge1xuICAgICAgICBpZiAoZnJvbUxlZ2VuZCkge1xuICAgICAgICAgIHJldHVybiBpLmxhYmVsID09PSBpdGVtLm5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGkubmFtZSA9PT0gaXRlbS5uYW1lICYmIGkuc2VyaWVzID09PSBpdGVtLnNlcmllcztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLmFjdGl2ZUVudHJpZXMgPSBbLi4uaXRlbXNdO1xuICAgIHRoaXMuYWN0aXZhdGUuZW1pdCh7IHZhbHVlOiBpdGVtLCBlbnRyaWVzOiB0aGlzLmFjdGl2ZUVudHJpZXMgfSk7XG4gIH1cblxuICBvbkRlYWN0aXZhdGUoZXZlbnQsIGdyb3VwLCBmcm9tTGVnZW5kOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBpdGVtID0gT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQpO1xuICAgIGlmIChncm91cCkge1xuICAgICAgaXRlbS5zZXJpZXMgPSBncm91cC5uYW1lO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlRW50cmllcyA9IHRoaXMuYWN0aXZlRW50cmllcy5maWx0ZXIoaSA9PiB7XG4gICAgICBpZiAoZnJvbUxlZ2VuZCkge1xuICAgICAgICByZXR1cm4gaS5sYWJlbCAhPT0gaXRlbS5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICEoaS5uYW1lID09PSBpdGVtLm5hbWUgJiYgaS5zZXJpZXMgPT09IGl0ZW0uc2VyaWVzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZGVhY3RpdmF0ZS5lbWl0KHsgdmFsdWU6IGl0ZW0sIGVudHJpZXM6IHRoaXMuYWN0aXZlRW50cmllcyB9KTtcbiAgfVxufVxuIl19