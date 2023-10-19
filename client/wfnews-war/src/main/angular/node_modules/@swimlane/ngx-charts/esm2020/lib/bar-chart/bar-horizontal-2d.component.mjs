import { Component, Input, ViewEncapsulation, Output, EventEmitter, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleBand, scaleLinear } from 'd3-scale';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { ScaleType } from '../common/types/scale-type.enum';
import { LegendPosition } from '../common/types/legend.model';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import * as i0 from "@angular/core";
import * as i1 from "../common/charts/chart.component";
import * as i2 from "../common/grid-panel-series.component";
import * as i3 from "../common/axes/x-axis.component";
import * as i4 from "../common/axes/y-axis.component";
import * as i5 from "./series-horizontal.component";
import * as i6 from "@angular/common";
export class BarHorizontal2DComponent extends BaseChartComponent {
    constructor() {
        super(...arguments);
        this.legend = false;
        this.legendTitle = 'Legend';
        this.legendPosition = LegendPosition.Right;
        this.tooltipDisabled = false;
        this.showGridLines = true;
        this.activeEntries = [];
        this.trimXAxisTicks = true;
        this.trimYAxisTicks = true;
        this.rotateXAxisTicks = true;
        this.maxXAxisTickLength = 16;
        this.maxYAxisTickLength = 16;
        this.groupPadding = 16;
        this.barPadding = 8;
        this.roundDomains = false;
        this.roundEdges = true;
        this.showDataLabel = false;
        this.noBarWhenZero = true;
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.margin = [10, 20, 10, 20];
        this.xAxisHeight = 0;
        this.yAxisWidth = 0;
        this.dataLabelMaxWidth = { negative: 0, positive: 0 };
        this.isSSR = false;
        this.barOrientation = BarOrientation;
        this.trackBy = (index, item) => {
            return item.name;
        };
    }
    ngOnInit() {
        if (isPlatformServer(this.platformId)) {
            this.isSSR = true;
        }
    }
    update() {
        super.update();
        if (!this.showDataLabel) {
            this.dataLabelMaxWidth = { negative: 0, positive: 0 };
        }
        this.margin = [10, 20 + this.dataLabelMaxWidth.positive, 10, 20 + this.dataLabelMaxWidth.negative];
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
            legendType: this.schemeType,
            legendPosition: this.legendPosition
        });
        this.formatDates();
        this.groupDomain = this.getGroupDomain();
        this.innerDomain = this.getInnerDomain();
        this.valueDomain = this.getValueDomain();
        this.groupScale = this.getGroupScale();
        this.innerScale = this.getInnerScale();
        this.valueScale = this.getValueScale();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    }
    getGroupScale() {
        const spacing = this.groupDomain.length / (this.dims.height / this.groupPadding + 1);
        return scaleBand()
            .rangeRound([0, this.dims.height])
            .paddingInner(spacing)
            .paddingOuter(spacing / 2)
            .domain(this.groupDomain);
    }
    getInnerScale() {
        const height = this.groupScale.bandwidth();
        const spacing = this.innerDomain.length / (height / this.barPadding + 1);
        return scaleBand().rangeRound([0, height]).paddingInner(spacing).domain(this.innerDomain);
    }
    getValueScale() {
        const scale = scaleLinear().range([0, this.dims.width]).domain(this.valueDomain);
        return this.roundDomains ? scale.nice() : scale;
    }
    getGroupDomain() {
        const domain = [];
        for (const group of this.results) {
            if (!domain.includes(group.label)) {
                domain.push(group.label);
            }
        }
        return domain;
    }
    getInnerDomain() {
        const domain = [];
        for (const group of this.results) {
            for (const d of group.series) {
                if (!domain.includes(d.label)) {
                    domain.push(d.label);
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
        const min = Math.min(0, ...domain);
        const max = this.xScaleMax ? Math.max(this.xScaleMax, ...domain) : Math.max(0, ...domain);
        return [min, max];
    }
    groupTransform(group) {
        return `translate(0, ${this.groupScale(group.label)})`;
    }
    onClick(data, group) {
        if (group) {
            data.series = group.name;
        }
        this.select.emit(data);
    }
    setColors() {
        let domain;
        if (this.schemeType === ScaleType.Ordinal) {
            domain = this.innerDomain;
        }
        else {
            domain = this.valueDomain;
        }
        this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    }
    getLegendOptions() {
        const opts = {
            scaleType: this.schemeType,
            colors: undefined,
            domain: [],
            title: undefined,
            position: this.legendPosition
        };
        if (opts.scaleType === ScaleType.Ordinal) {
            opts.domain = this.innerDomain;
            opts.colors = this.colors;
            opts.title = this.legendTitle;
        }
        else {
            opts.domain = this.valueDomain;
            opts.colors = this.colors.scale;
        }
        return opts;
    }
    updateYAxisWidth({ width }) {
        this.yAxisWidth = width;
        this.update();
    }
    updateXAxisHeight({ height }) {
        this.xAxisHeight = height;
        this.update();
    }
    onDataLabelMaxWidthChanged(event, groupIndex) {
        if (event.size.negative) {
            this.dataLabelMaxWidth.negative = Math.max(this.dataLabelMaxWidth.negative, event.size.width);
        }
        else {
            this.dataLabelMaxWidth.positive = Math.max(this.dataLabelMaxWidth.positive, event.size.width);
        }
        if (groupIndex === this.results.length - 1) {
            setTimeout(() => this.update());
        }
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
BarHorizontal2DComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BarHorizontal2DComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
BarHorizontal2DComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: BarHorizontal2DComponent, selector: "ngx-charts-bar-horizontal-2d", inputs: { legend: "legend", legendTitle: "legendTitle", legendPosition: "legendPosition", xAxis: "xAxis", yAxis: "yAxis", showXAxisLabel: "showXAxisLabel", showYAxisLabel: "showYAxisLabel", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel", tooltipDisabled: "tooltipDisabled", gradient: "gradient", showGridLines: "showGridLines", activeEntries: "activeEntries", schemeType: "schemeType", trimXAxisTicks: "trimXAxisTicks", trimYAxisTicks: "trimYAxisTicks", rotateXAxisTicks: "rotateXAxisTicks", maxXAxisTickLength: "maxXAxisTickLength", maxYAxisTickLength: "maxYAxisTickLength", xAxisTickFormatting: "xAxisTickFormatting", yAxisTickFormatting: "yAxisTickFormatting", xAxisTicks: "xAxisTicks", yAxisTicks: "yAxisTicks", groupPadding: "groupPadding", barPadding: "barPadding", roundDomains: "roundDomains", roundEdges: "roundEdges", xScaleMax: "xScaleMax", showDataLabel: "showDataLabel", dataLabelFormatting: "dataLabelFormatting", noBarWhenZero: "noBarWhenZero" }, outputs: { activate: "activate", deactivate: "deactivate" }, queries: [{ propertyName: "tooltipTemplate", first: true, predicate: ["tooltipTemplate"], descendants: true }], usesInheritance: true, ngImport: i0, template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelActivate)="onActivate($event, undefined, true)"
      (legendLabelDeactivate)="onDeactivate($event, undefined, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="bar-chart chart">
        <svg:g
          ngx-charts-grid-panel-series
          [xScale]="valueScale"
          [yScale]="groupScale"
          [data]="results"
          [dims]="dims"
          [orient]="barOrientation.Horizontal"
        ></svg:g>
        <svg:g
          ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="valueScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
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
          [yScale]="groupScale"
          [dims]="dims"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          [yAxisOffset]="dataLabelMaxWidth.negative"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>

        <svg:g *ngIf="!isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [xScale]="valueScale"
              [activeEntries]="activeEntries"
              [yScale]="innerScale"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [roundEdges]="roundEdges"
              [animations]="animations"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [xScale]="valueScale"
              [activeEntries]="activeEntries"
              [yScale]="innerScale"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [roundEdges]="roundEdges"
              [animations]="animations"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, isInline: true, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"], components: [{ type: i1.ChartComponent, selector: "ngx-charts-chart", inputs: ["view", "showLegend", "legendOptions", "legendType", "activeEntries", "animations"], outputs: ["legendLabelClick", "legendLabelActivate", "legendLabelDeactivate"] }, { type: i2.GridPanelSeriesComponent, selector: "g[ngx-charts-grid-panel-series]", inputs: ["data", "dims", "xScale", "yScale", "orient"] }, { type: i3.XAxisComponent, selector: "g[ngx-charts-x-axis]", inputs: ["xScale", "dims", "trimTicks", "rotateTicks", "maxTickLength", "tickFormatting", "showGridLines", "showLabel", "labelText", "ticks", "xAxisTickCount", "xOrient", "xAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i4.YAxisComponent, selector: "g[ngx-charts-y-axis]", inputs: ["yScale", "dims", "trimTicks", "maxTickLength", "tickFormatting", "ticks", "showGridLines", "showLabel", "labelText", "yAxisTickCount", "yOrient", "referenceLines", "showRefLines", "showRefLabels", "yAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i5.SeriesHorizontal, selector: "g[ngx-charts-series-horizontal]", inputs: ["dims", "type", "series", "xScale", "yScale", "colors", "tooltipDisabled", "gradient", "activeEntries", "seriesName", "tooltipTemplate", "roundEdges", "animations", "showDataLabel", "dataLabelFormatting", "noBarWhenZero"], outputs: ["select", "activate", "deactivate", "dataLabelWidthChanged"] }], directives: [{ type: i6.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i6.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], animations: [
        trigger('animationState', [
            transition(':leave', [
                style({
                    opacity: 1,
                    transform: '*'
                }),
                animate(500, style({ opacity: 0, transform: 'scale(0)' }))
            ])
        ])
    ], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BarHorizontal2DComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-charts-bar-horizontal-2d', template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelActivate)="onActivate($event, undefined, true)"
      (legendLabelDeactivate)="onDeactivate($event, undefined, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="bar-chart chart">
        <svg:g
          ngx-charts-grid-panel-series
          [xScale]="valueScale"
          [yScale]="groupScale"
          [data]="results"
          [dims]="dims"
          [orient]="barOrientation.Horizontal"
        ></svg:g>
        <svg:g
          ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="valueScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
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
          [yScale]="groupScale"
          [dims]="dims"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          [yAxisOffset]="dataLabelMaxWidth.negative"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>

        <svg:g *ngIf="!isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [xScale]="valueScale"
              [activeEntries]="activeEntries"
              [yScale]="innerScale"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [roundEdges]="roundEdges"
              [animations]="animations"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [xScale]="valueScale"
              [activeEntries]="activeEntries"
              [yScale]="innerScale"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [roundEdges]="roundEdges"
              [animations]="animations"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, animations: [
                        trigger('animationState', [
                            transition(':leave', [
                                style({
                                    opacity: 1,
                                    transform: '*'
                                }),
                                animate(500, style({ opacity: 0, transform: 'scale(0)' }))
                            ])
                        ])
                    ], styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"] }]
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
            }], tooltipDisabled: [{
                type: Input
            }], gradient: [{
                type: Input
            }], showGridLines: [{
                type: Input
            }], activeEntries: [{
                type: Input
            }], schemeType: [{
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
            }], groupPadding: [{
                type: Input
            }], barPadding: [{
                type: Input
            }], roundDomains: [{
                type: Input
            }], roundEdges: [{
                type: Input
            }], xScaleMax: [{
                type: Input
            }], showDataLabel: [{
                type: Input
            }], dataLabelFormatting: [{
                type: Input
            }], noBarWhenZero: [{
                type: Input
            }], activate: [{
                type: Output
            }], deactivate: [{
                type: Output
            }], tooltipTemplate: [{
                type: ContentChild,
                args: ['tooltipTemplate']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLWhvcml6b250YWwtMmQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2Jhci1jaGFydC9iYXItaG9yaXpvbnRhbC0yZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsaUJBQWlCLEVBQ2pCLE1BQU0sRUFDTixZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLFlBQVksRUFHYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFMUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBR3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM1RCxPQUFPLEVBQWlCLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQzs7Ozs7Ozs7QUFtSXRFLE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxrQkFBa0I7SUFqSWhFOztRQWtJVyxXQUFNLEdBQVksS0FBSyxDQUFDO1FBQ3hCLGdCQUFXLEdBQVcsUUFBUSxDQUFDO1FBQy9CLG1CQUFjLEdBQW1CLGNBQWMsQ0FBQyxLQUFLLENBQUM7UUFPdEQsb0JBQWUsR0FBWSxL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QWIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csZ0JBQWdCO3NCQUF4QixLQUFLO2dCQUNHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFDRyxrQkFBa0I7c0JBQTFCLEtBQUs7Z0JBQ0csbUJBQW1CO3NCQUEzQixLQUFLO2dCQUNHLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csbUJBQW1CO3NCQUEzQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBRUksUUFBUTtzQkFBakIsTUFBTTtnQkFDRyxVQUFVO3NCQUFuQixNQUFNO2dCQUUwQixlQUFlO3NCQUEvQyxZQUFZO3VCQUFDLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbnRlbnRDaGlsZCxcbiAgVGVtcGxhdGVSZWYsXG4gIFRyYWNrQnlGdW5jdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgdHJpZ2dlciwgc3R5bGUsIGFuaW1hdGUsIHRyYW5zaXRpb24gfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHsgc2NhbGVCYW5kLCBzY2FsZUxpbmVhciB9IGZyb20gJ2QzLXNjYWxlJztcblxuaW1wb3J0IHsgY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMgfSBmcm9tICcuLi9jb21tb24vdmlldy1kaW1lbnNpb25zLmhlbHBlcic7XG5pbXBvcnQgeyBDb2xvckhlbHBlciB9IGZyb20gJy4uL2NvbW1vbi9jb2xvci5oZWxwZXInO1xuaW1wb3J0IHsgRGF0YUl0ZW0gfSBmcm9tICcuLi9tb2RlbHMvY2hhcnQtZGF0YS5tb2RlbCc7XG5cbmltcG9ydCB7IEJhc2VDaGFydENvbXBvbmVudCB9IGZyb20gJy4uL2NvbW1vbi9iYXNlLWNoYXJ0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTY2FsZVR5cGUgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvc2NhbGUtdHlwZS5lbnVtJztcbmltcG9ydCB7IExlZ2VuZE9wdGlvbnMsIExlZ2VuZFBvc2l0aW9uIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2xlZ2VuZC5tb2RlbCc7XG5pbXBvcnQgeyBWaWV3RGltZW5zaW9ucyB9IGZyb20gJy4uL2NvbW1vbi90eXBlcy92aWV3LWRpbWVuc2lvbi5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgQmFyT3JpZW50YXRpb24gfSBmcm9tICcuLi9jb21tb24vdHlwZXMvYmFyLW9yaWVudGF0aW9uLmVudW0nO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtY2hhcnRzLWJhci1ob3Jpem9udGFsLTJkJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmd4LWNoYXJ0cy1jaGFydFxuICAgICAgW3ZpZXddPVwiW3dpZHRoLCBoZWlnaHRdXCJcbiAgICAgIFtzaG93TGVnZW5kXT1cImxlZ2VuZFwiXG4gICAgICBbbGVnZW5kT3B0aW9uc109XCJsZWdlbmRPcHRpb25zXCJcbiAgICAgIFthY3RpdmVFbnRyaWVzXT1cImFjdGl2ZUVudHJpZXNcIlxuICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAobGVnZW5kTGFiZWxBY3RpdmF0ZSk9XCJvbkFjdGl2YXRlKCRldmVudCwgdW5kZWZpbmVkLCB0cnVlKVwiXG4gICAgICAobGVnZW5kTGFiZWxEZWFjdGl2YXRlKT1cIm9uRGVhY3RpdmF0ZSgkZXZlbnQsIHVuZGVmaW5lZCwgdHJ1ZSlcIlxuICAgICAgKGxlZ2VuZExhYmVsQ2xpY2spPVwib25DbGljaygkZXZlbnQpXCJcbiAgICA+XG4gICAgICA8c3ZnOmcgW2F0dHIudHJhbnNmb3JtXT1cInRyYW5zZm9ybVwiIGNsYXNzPVwiYmFyLWNoYXJ0IGNoYXJ0XCI+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMtZ3JpZC1wYW5lbC1zZXJpZXNcbiAgICAgICAgICBbeFNjYWxlXT1cInZhbHVlU2NhbGVcIlxuICAgICAgICAgIFt5U2NhbGVdPVwiZ3JvdXBTY2FsZVwiXG4gICAgICAgICAgW2RhdGFdPVwicmVzdWx0c1wiXG4gICAgICAgICAgW2RpbXNdPVwiZGltc1wiXG4gICAgICAgICAgW29yaWVudF09XCJiYXJPcmllbnRhdGlvbi5Ib3Jpem9udGFsXCJcbiAgICAgICAgPjwvc3ZnOmc+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMteC1heGlzXG4gICAgICAgICAgKm5nSWY9XCJ4QXhpc1wiXG4gICAgICAgICAgW3hTY2FsZV09XCJ2YWx1ZVNjYWxlXCJcbiAgICAgICAgICBbZGltc109XCJkaW1zXCJcbiAgICAgICAgICBbc2hvd0dyaWRMaW5lc109XCJzaG93R3JpZExpbmVzXCJcbiAgICAgICAgICBbc2hvd0xhYmVsXT1cInNob3dYQXhpc0xhYmVsXCJcbiAgICAgICAgICBbbGFiZWxUZXh0XT1cInhBeGlzTGFiZWxcIlxuICAgICAgICAgIFt0cmltVGlja3NdPVwidHJpbVhBeGlzVGlja3NcIlxuICAgICAgICAgIFtyb3RhdGVUaWNrc109XCJyb3RhdGVYQXhpc1RpY2tzXCJcbiAgICAgICAgICBbbWF4VGlja0xlbmd0aF09XCJtYXhYQXhpc1RpY2tMZW5ndGhcIlxuICAgICAgICAgIFt0aWNrRm9ybWF0dGluZ109XCJ4QXhpc1RpY2tGb3JtYXR0aW5nXCJcbiAgICAgICAgICBbdGlja3NdPVwieEF4aXNUaWNrc1wiXG4gICAgICAgICAgKGRpbWVuc2lvbnNDaGFuZ2VkKT1cInVwZGF0ZVhBeGlzSGVpZ2h0KCRldmVudClcIlxuICAgICAgICA+PC9zdmc6Zz5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy15LWF4aXNcbiAgICAgICAgICAqbmdJZj1cInlBeGlzXCJcbiAgICAgICAgICBbeVNjYWxlXT1cImdyb3VwU2NhbGVcIlxuICAgICAgICAgIFtkaW1zXT1cImRpbXNcIlxuICAgICAgICAgIFtzaG93TGFiZWxdPVwic2hvd1lBeGlzTGFiZWxcIlxuICAgICAgICAgIFtsYWJlbFRleHRdPVwieUF4aXNMYWJlbFwiXG4gICAgICAgICAgW3RyaW1UaWNrc109XCJ0cmltWUF4aXNUaWNrc1wiXG4gICAgICAgICAgW21heFRpY2tMZW5ndGhdPVwibWF4WUF4aXNUaWNrTGVuZ3RoXCJcbiAgICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwieUF4aXNUaWNrRm9ybWF0dGluZ1wiXG4gICAgICAgICAgW3RpY2tzXT1cInlBeGlzVGlja3NcIlxuICAgICAgICAgIFt5QXhpc09mZnNldF09XCJkYXRhTGFiZWxNYXhXaWR0aC5uZWdhdGl2ZVwiXG4gICAgICAgICAgKGRpbWVuc2lvbnNDaGFuZ2VkKT1cInVwZGF0ZVlBeGlzV2lkdGgoJGV2ZW50KVwiXG4gICAgICAgID48L3N2ZzpnPlxuXG4gICAgICAgIDxzdmc6ZyAqbmdJZj1cIiFpc1NTUlwiPlxuICAgICAgICAgIDxzdmc6Z1xuICAgICAgICAgICAgKm5nRm9yPVwibGV0IGdyb3VwIG9mIHJlc3VsdHM7IGxldCBpbmRleCA9IGluZGV4OyB0cmFja0J5OiB0cmFja0J5XCJcbiAgICAgICAgICAgIFtAYW5pbWF0aW9uU3RhdGVdPVwiJ2FjdGl2ZSdcIlxuICAgICAgICAgICAgW2F0dHIudHJhbnNmb3JtXT1cImdyb3VwVHJhbnNmb3JtKGdyb3VwKVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgICAgIG5neC1jaGFydHMtc2VyaWVzLWhvcml6b250YWxcbiAgICAgICAgICAgICAgW3hTY2FsZV09XCJ2YWx1ZVNjYWxlXCJcbiAgICAgICAgICAgICAgW2FjdGl2ZUVudHJpZXNdPVwiYWN0aXZlRW50cmllc1wiXG4gICAgICAgICAgICAgIFt5U2NhbGVdPVwiaW5uZXJTY2FsZVwiXG4gICAgICAgICAgICAgIFtjb2xvcnNdPVwiY29sb3JzXCJcbiAgICAgICAgICAgICAgW3Nlcmllc109XCJncm91cC5zZXJpZXNcIlxuICAgICAgICAgICAgICBbZGltc109XCJkaW1zXCJcbiAgICAgICAgICAgICAgW2dyYWRpZW50XT1cImdyYWRpZW50XCJcbiAgICAgICAgICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgICAgICAgICBbdG9vbHRpcFRlbXBsYXRlXT1cInRvb2x0aXBUZW1wbGF0ZVwiXG4gICAgICAgICAgICAgIFtzZXJpZXNOYW1lXT1cImdyb3VwLm5hbWVcIlxuICAgICAgICAgICAgICBbcm91bmRFZGdlc109XCJyb3VuZEVkZ2VzXCJcbiAgICAgICAgICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAgICAgICAgIFtzaG93RGF0YUxhYmVsXT1cInNob3dEYXRhTGFiZWxcIlxuICAgICAgICAgICAgICBbZGF0YUxhYmVsRm9ybWF0dGluZ109XCJkYXRhTGFiZWxGb3JtYXR0aW5nXCJcbiAgICAgICAgICAgICAgW25vQmFyV2hlblplcm9dPVwibm9CYXJXaGVuWmVyb1wiXG4gICAgICAgICAgICAgIChzZWxlY3QpPVwib25DbGljaygkZXZlbnQsIGdyb3VwKVwiXG4gICAgICAgICAgICAgIChhY3RpdmF0ZSk9XCJvbkFjdGl2YXRlKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgICAgKGRlYWN0aXZhdGUpPVwib25EZWFjdGl2YXRlKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgICAgKGRhdGFMYWJlbFdpZHRoQ2hhbmdlZCk9XCJvbkRhdGFMYWJlbE1heFdpZHRoQ2hhbmdlZCgkZXZlbnQsIGluZGV4KVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvc3ZnOmc+XG4gICAgICAgIDwvc3ZnOmc+XG4gICAgICAgIDxzdmc6ZyAqbmdJZj1cImlzU1NSXCI+XG4gICAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgICAqbmdGb3I9XCJsZXQgZ3JvdXAgb2YgcmVzdWx0czsgbGV0IGluZGV4ID0gaW5kZXg7IHRyYWNrQnk6IHRyYWNrQnlcIlxuICAgICAgICAgICAgW2F0dHIudHJhbnNmb3JtXT1cImdyb3VwVHJhbnNmb3JtKGdyb3VwKVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgICAgIG5neC1jaGFydHMtc2VyaWVzLWhvcml6b250YWxcbiAgICAgICAgICAgICAgW3hTY2FsZV09XCJ2YWx1ZVNjYWxlXCJcbiAgICAgICAgICAgICAgW2FjdGl2ZUVudHJpZXNdPVwiYWN0aXZlRW50cmllc1wiXG4gICAgICAgICAgICAgIFt5U2NhbGVdPVwiaW5uZXJTY2FsZVwiXG4gICAgICAgICAgICAgIFtjb2xvcnNdPVwiY29sb3JzXCJcbiAgICAgICAgICAgICAgW3Nlcmllc109XCJncm91cC5zZXJpZXNcIlxuICAgICAgICAgICAgICBbZGltc109XCJkaW1zXCJcbiAgICAgICAgICAgICAgW2dyYWRpZW50XT1cImdyYWRpZW50XCJcbiAgICAgICAgICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgICAgICAgICBbdG9vbHRpcFRlbXBsYXRlXT1cInRvb2x0aXBUZW1wbGF0ZVwiXG4gICAgICAgICAgICAgIFtzZXJpZXNOYW1lXT1cImdyb3VwLm5hbWVcIlxuICAgICAgICAgICAgICBbcm91bmRFZGdlc109XCJyb3VuZEVkZ2VzXCJcbiAgICAgICAgICAgICAgW2FuaW1hdGlvbnNdPVwiYW5pbWF0aW9uc1wiXG4gICAgICAgICAgICAgIFtzaG93RGF0YUxhYmVsXT1cInNob3dEYXRhTGFiZWxcIlxuICAgICAgICAgICAgICBbZGF0YUxhYmVsRm9ybWF0dGluZ109XCJkYXRhTGFiZWxGb3JtYXR0aW5nXCJcbiAgICAgICAgICAgICAgW25vQmFyV2hlblplcm9dPVwibm9CYXJXaGVuWmVyb1wiXG4gICAgICAgICAgICAgIChzZWxlY3QpPVwib25DbGljaygkZXZlbnQsIGdyb3VwKVwiXG4gICAgICAgICAgICAgIChhY3RpdmF0ZSk9XCJvbkFjdGl2YXRlKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgICAgKGRlYWN0aXZhdGUpPVwib25EZWFjdGl2YXRlKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgICAgKGRhdGFMYWJlbFdpZHRoQ2hhbmdlZCk9XCJvbkRhdGFMYWJlbE1heFdpZHRoQ2hhbmdlZCgkZXZlbnQsIGluZGV4KVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvc3ZnOmc+XG4gICAgICAgIDwvc3ZnOmc+XG4gICAgICA8L3N2ZzpnPlxuICAgIDwvbmd4LWNoYXJ0cy1jaGFydD5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0eWxlVXJsczogWycuLi9jb21tb24vYmFzZS1jaGFydC5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignYW5pbWF0aW9uU3RhdGUnLCBbXG4gICAgICB0cmFuc2l0aW9uKCc6bGVhdmUnLCBbXG4gICAgICAgIHN0eWxlKHtcbiAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgIHRyYW5zZm9ybTogJyonXG4gICAgICAgIH0pLFxuICAgICAgICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwKScgfSkpXG4gICAgICBdKVxuICAgIF0pXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQmFySG9yaXpvbnRhbDJEQ29tcG9uZW50IGV4dGVuZHMgQmFzZUNoYXJ0Q29tcG9uZW50IHtcbiAgQElucHV0KCkgbGVnZW5kOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGxlZ2VuZFRpdGxlOiBzdHJpbmcgPSAnTGVnZW5kJztcbiAgQElucHV0KCkgbGVnZW5kUG9zaXRpb246IExlZ2VuZFBvc2l0aW9uID0gTGVnZW5kUG9zaXRpb24uUmlnaHQ7XG4gIEBJbnB1dCgpIHhBeGlzO1xuICBASW5wdXQoKSB5QXhpcztcbiAgQElucHV0KCkgc2hvd1hBeGlzTGFiZWw6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNob3dZQXhpc0xhYmVsOiBib29sZWFuO1xuICBASW5wdXQoKSB4QXhpc0xhYmVsOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHlBeGlzTGFiZWw6IHN0cmluZztcbiAgQElucHV0KCkgdG9vbHRpcERpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGdyYWRpZW50OiBib29sZWFuO1xuICBASW5wdXQoKSBzaG93R3JpZExpbmVzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgYWN0aXZlRW50cmllczogYW55W10gPSBbXTtcbiAgQElucHV0KCkgc2NoZW1lVHlwZTogU2NhbGVUeXBlO1xuICBASW5wdXQoKSB0cmltWEF4aXNUaWNrczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHRyaW1ZQXhpc1RpY2tzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgcm90YXRlWEF4aXNUaWNrczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIG1heFhBeGlzVGlja0xlbmd0aDogbnVtYmVyID0gMTY7XG4gIEBJbnB1dCgpIG1heFlBeGlzVGlja0xlbmd0aDogbnVtYmVyID0gMTY7XG4gIEBJbnB1dCgpIHhBeGlzVGlja0Zvcm1hdHRpbmc6IGFueTtcbiAgQElucHV0KCkgeUF4aXNUaWNrRm9ybWF0dGluZzogYW55O1xuICBASW5wdXQoKSB4QXhpc1RpY2tzOiBhbnlbXTtcbiAgQElucHV0KCkgeUF4aXNUaWNrczogYW55W107XG4gIEBJbnB1dCgpIGdyb3VwUGFkZGluZzogbnVtYmVyID0gMTY7XG4gIEBJbnB1dCgpIGJhclBhZGRpbmc6IG51bWJlciA9IDg7XG4gIEBJbnB1dCgpIHJvdW5kRG9tYWluczogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSByb3VuZEVkZ2VzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgeFNjYWxlTWF4OiBudW1iZXI7XG4gIEBJbnB1dCgpIHNob3dEYXRhTGFiZWw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZGF0YUxhYmVsRm9ybWF0dGluZzogYW55O1xuICBASW5wdXQoKSBub0JhcldoZW5aZXJvOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZGVhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQENvbnRlbnRDaGlsZCgndG9vbHRpcFRlbXBsYXRlJykgdG9vbHRpcFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIGRpbXM6IFZpZXdEaW1lbnNpb25zO1xuICBncm91cERvbWFpbjogc3RyaW5nW107XG4gIGlubmVyRG9tYWluOiBzdHJpbmdbXTtcbiAgdmFsdWVEb21haW46IFtudW1iZXIsIG51bWJlcl07XG4gIGdyb3VwU2NhbGU6IGFueTtcbiAgaW5uZXJTY2FsZTogYW55O1xuICB2YWx1ZVNjYWxlOiBhbnk7XG4gIHRyYW5zZm9ybTogc3RyaW5nO1xuICBjb2xvcnM6IENvbG9ySGVscGVyO1xuICBtYXJnaW46IG51bWJlcltdID0gWzEwLCAyMCwgMTAsIDIwXTtcbiAgeEF4aXNIZWlnaHQ6IG51bWJlciA9IDA7XG4gIHlBeGlzV2lkdGg6IG51bWJlciA9IDA7XG4gIGxlZ2VuZE9wdGlvbnM6IExlZ2VuZE9wdGlvbnM7XG4gIGRhdGFMYWJlbE1heFdpZHRoOiBhbnkgPSB7IG5lZ2F0aXZlOiAwLCBwb3NpdGl2ZTogMCB9O1xuICBpc1NTUiA9IGZhbHNlO1xuXG4gIGJhck9yaWVudGF0aW9uID0gQmFyT3JpZW50YXRpb247XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgdGhpcy5pc1NTUiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHN1cGVyLnVwZGF0ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnNob3dEYXRhTGFiZWwpIHtcbiAgICAgIHRoaXMuZGF0YUxhYmVsTWF4V2lkdGggPSB7IG5lZ2F0aXZlOiAwLCBwb3NpdGl2ZTogMCB9O1xuICAgIH1cblxuICAgIHRoaXMubWFyZ2luID0gWzEwLCAyMCArIHRoaXMuZGF0YUxhYmVsTWF4V2lkdGgucG9zaXRpdmUsIDEwLCAyMCArIHRoaXMuZGF0YUxhYmVsTWF4V2lkdGgubmVnYXRpdmVdO1xuXG4gICAgdGhpcy5kaW1zID0gY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMoe1xuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgbWFyZ2luczogdGhpcy5tYXJnaW4sXG4gICAgICBzaG93WEF4aXM6IHRoaXMueEF4aXMsXG4gICAgICBzaG93WUF4aXM6IHRoaXMueUF4aXMsXG4gICAgICB4QXhpc0hlaWdodDogdGhpcy54QXhpc0hlaWdodCxcbiAgICAgIHlBeGlzV2lkdGg6IHRoaXMueUF4aXNXaWR0aCxcbiAgICAgIHNob3dYTGFiZWw6IHRoaXMuc2hvd1hBeGlzTGFiZWwsXG4gICAgICBzaG93WUxhYmVsOiB0aGlzLnNob3dZQXhpc0xhYmVsLFxuICAgICAgc2hvd0xlZ2VuZDogdGhpcy5sZWdlbmQsXG4gICAgICBsZWdlbmRUeXBlOiB0aGlzLnNjaGVtZVR5cGUsXG4gICAgICBsZWdlbmRQb3NpdGlvbjogdGhpcy5sZWdlbmRQb3NpdGlvblxuICAgIH0pO1xuXG4gICAgdGhpcy5mb3JtYXREYXRlcygpO1xuXG4gICAgdGhpcy5ncm91cERvbWFpbiA9IHRoaXMuZ2V0R3JvdXBEb21haW4oKTtcbiAgICB0aGlzLmlubmVyRG9tYWluID0gdGhpcy5nZXRJbm5lckRvbWFpbigpO1xuICAgIHRoaXMudmFsdWVEb21haW4gPSB0aGlzLmdldFZhbHVlRG9tYWluKCk7XG5cbiAgICB0aGlzLmdyb3VwU2NhbGUgPSB0aGlzLmdldEdyb3VwU2NhbGUoKTtcbiAgICB0aGlzLmlubmVyU2NhbGUgPSB0aGlzLmdldElubmVyU2NhbGUoKTtcbiAgICB0aGlzLnZhbHVlU2NhbGUgPSB0aGlzLmdldFZhbHVlU2NhbGUoKTtcblxuICAgIHRoaXMuc2V0Q29sb3JzKCk7XG4gICAgdGhpcy5sZWdlbmRPcHRpb25zID0gdGhpcy5nZXRMZWdlbmRPcHRpb25zKCk7XG5cbiAgICB0aGlzLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHt0aGlzLmRpbXMueE9mZnNldH0gLCAke3RoaXMubWFyZ2luWzBdfSlgO1xuICB9XG5cbiAgZ2V0R3JvdXBTY2FsZSgpOiBhbnkge1xuICAgIGNvbnN0IHNwYWNpbmcgPSB0aGlzLmdyb3VwRG9tYWluLmxlbmd0aCAvICh0aGlzLmRpbXMuaGVpZ2h0IC8gdGhpcy5ncm91cFBhZGRpbmcgKyAxKTtcblxuICAgIHJldHVybiBzY2FsZUJhbmQoKVxuICAgICAgLnJhbmdlUm91bmQoWzAsIHRoaXMuZGltcy5oZWlnaHRdKVxuICAgICAgLnBhZGRpbmdJbm5lcihzcGFjaW5nKVxuICAgICAgLnBhZGRpbmdPdXRlcihzcGFjaW5nIC8gMilcbiAgICAgIC5kb21haW4odGhpcy5ncm91cERvbWFpbik7XG4gIH1cblxuICBnZXRJbm5lclNjYWxlKCk6IGFueSB7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ncm91cFNjYWxlLmJhbmR3aWR0aCgpO1xuICAgIGNvbnN0IHNwYWNpbmcgPSB0aGlzLmlubmVyRG9tYWluLmxlbmd0aCAvIChoZWlnaHQgLyB0aGlzLmJhclBhZGRpbmcgKyAxKTtcblxuICAgIHJldHVybiBzY2FsZUJhbmQoKS5yYW5nZVJvdW5kKFswLCBoZWlnaHRdKS5wYWRkaW5nSW5uZXIoc3BhY2luZykuZG9tYWluKHRoaXMuaW5uZXJEb21haW4pO1xuICB9XG5cbiAgZ2V0VmFsdWVTY2FsZSgpOiBhbnkge1xuICAgIGNvbnN0IHNjYWxlID0gc2NhbGVMaW5lYXIoKS5yYW5nZShbMCwgdGhpcy5kaW1zLndpZHRoXSkuZG9tYWluKHRoaXMudmFsdWVEb21haW4pO1xuXG4gICAgcmV0dXJuIHRoaXMucm91bmREb21haW5zID8gc2NhbGUubmljZSgpIDogc2NhbGU7XG4gIH1cblxuICBnZXRHcm91cERvbWFpbigpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZG9tYWluID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIHRoaXMucmVzdWx0cykge1xuICAgICAgaWYgKCFkb21haW4uaW5jbHVkZXMoZ3JvdXAubGFiZWwpKSB7XG4gICAgICAgIGRvbWFpbi5wdXNoKGdyb3VwLmxhYmVsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG5cbiAgZ2V0SW5uZXJEb21haW4oKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGRvbWFpbiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBncm91cCBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgZCBvZiBncm91cC5zZXJpZXMpIHtcbiAgICAgICAgaWYgKCFkb21haW4uaW5jbHVkZXMoZC5sYWJlbCkpIHtcbiAgICAgICAgICBkb21haW4ucHVzaChkLmxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkb21haW47XG4gIH1cblxuICBnZXRWYWx1ZURvbWFpbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBjb25zdCBkb21haW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5yZXN1bHRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgZ3JvdXAuc2VyaWVzKSB7XG4gICAgICAgIGlmICghZG9tYWluLmluY2x1ZGVzKGQudmFsdWUpKSB7XG4gICAgICAgICAgZG9tYWluLnB1c2goZC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSBNYXRoLm1pbigwLCAuLi5kb21haW4pO1xuICAgIGNvbnN0IG1heCA9IHRoaXMueFNjYWxlTWF4ID8gTWF0aC5tYXgodGhpcy54U2NhbGVNYXgsIC4uLmRvbWFpbikgOiBNYXRoLm1heCgwLCAuLi5kb21haW4pO1xuICAgIHJldHVybiBbbWluLCBtYXhdO1xuICB9XG5cbiAgZ3JvdXBUcmFuc2Zvcm0oZ3JvdXA6IERhdGFJdGVtKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRyYW5zbGF0ZSgwLCAke3RoaXMuZ3JvdXBTY2FsZShncm91cC5sYWJlbCl9KWA7XG4gIH1cblxuICBvbkNsaWNrKGRhdGEsIGdyb3VwPzogRGF0YUl0ZW0pOiB2b2lkIHtcbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIGRhdGEuc2VyaWVzID0gZ3JvdXAubmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdC5lbWl0KGRhdGEpO1xuICB9XG5cbiAgdHJhY2tCeTogVHJhY2tCeUZ1bmN0aW9uPERhdGFJdGVtPiA9IChpbmRleDogbnVtYmVyLCBpdGVtOiBEYXRhSXRlbSkgPT4ge1xuICAgIHJldHVybiBpdGVtLm5hbWU7XG4gIH07XG5cbiAgc2V0Q29sb3JzKCk6IHZvaWQge1xuICAgIGxldCBkb21haW47XG4gICAgaWYgKHRoaXMuc2NoZW1lVHlwZSA9PT0gU2NhbGVUeXBlLk9yZGluYWwpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuaW5uZXJEb21haW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMudmFsdWVEb21haW47XG4gICAgfVxuXG4gICAgdGhpcy5jb2xvcnMgPSBuZXcgQ29sb3JIZWxwZXIodGhpcy5zY2hlbWUsIHRoaXMuc2NoZW1lVHlwZSwgZG9tYWluLCB0aGlzLmN1c3RvbUNvbG9ycyk7XG4gIH1cblxuICBnZXRMZWdlbmRPcHRpb25zKCk6IExlZ2VuZE9wdGlvbnMge1xuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICBzY2FsZVR5cGU6IHRoaXMuc2NoZW1lVHlwZSBhcyBhbnksXG4gICAgICBjb2xvcnM6IHVuZGVmaW5lZCxcbiAgICAgIGRvbWFpbjogW10sXG4gICAgICB0aXRsZTogdW5kZWZpbmVkLFxuICAgICAgcG9zaXRpb246IHRoaXMubGVnZW5kUG9zaXRpb25cbiAgICB9O1xuICAgIGlmIChvcHRzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLk9yZGluYWwpIHtcbiAgICAgIG9wdHMuZG9tYWluID0gdGhpcy5pbm5lckRvbWFpbjtcbiAgICAgIG9wdHMuY29sb3JzID0gdGhpcy5jb2xvcnM7XG4gICAgICBvcHRzLnRpdGxlID0gdGhpcy5sZWdlbmRUaXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0cy5kb21haW4gPSB0aGlzLnZhbHVlRG9tYWluO1xuICAgICAgb3B0cy5jb2xvcnMgPSB0aGlzLmNvbG9ycy5zY2FsZTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0cztcbiAgfVxuXG4gIHVwZGF0ZVlBeGlzV2lkdGgoeyB3aWR0aCB9OiB7IHdpZHRoOiBudW1iZXIgfSk6IHZvaWQge1xuICAgIHRoaXMueUF4aXNXaWR0aCA9IHdpZHRoO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1cGRhdGVYQXhpc0hlaWdodCh7IGhlaWdodCB9OiB7IGhlaWdodDogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICB0aGlzLnhBeGlzSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBvbkRhdGFMYWJlbE1heFdpZHRoQ2hhbmdlZChldmVudCwgZ3JvdXBJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKGV2ZW50LnNpemUubmVnYXRpdmUpIHtcbiAgICAgIHRoaXMuZGF0YUxhYmVsTWF4V2lkdGgubmVnYXRpdmUgPSBNYXRoLm1heCh0aGlzLmRhdGFMYWJlbE1heFdpZHRoLm5lZ2F0aXZlLCBldmVudC5zaXplLndpZHRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kYXRhTGFiZWxNYXhXaWR0aC5wb3NpdGl2ZSA9IE1hdGgubWF4KHRoaXMuZGF0YUxhYmVsTWF4V2lkdGgucG9zaXRpdmUsIGV2ZW50LnNpemUud2lkdGgpO1xuICAgIH1cbiAgICBpZiAoZ3JvdXBJbmRleCA9PT0gdGhpcy5yZXN1bHRzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSk7XG4gICAgfVxuICB9XG5cbiAgb25BY3RpdmF0ZShldmVudCwgZ3JvdXA6IERhdGFJdGVtLCBmcm9tTGVnZW5kOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtID0gT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQpO1xuICAgIGlmIChncm91cCkge1xuICAgICAgaXRlbS5zZXJpZXMgPSBncm91cC5uYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5yZXN1bHRzXG4gICAgICAubWFwKGcgPT4gZy5zZXJpZXMpXG4gICAgICAuZmxhdCgpXG4gICAgICAuZmlsdGVyKGkgPT4ge1xuICAgICAgICBpZiAoZnJvbUxlZ2VuZCkge1xuICAgICAgICAgIHJldHVybiBpLmxhYmVsID09PSBpdGVtLm5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGkubmFtZSA9PT0gaXRlbS5uYW1lICYmIGkuc2VyaWVzID09PSBpdGVtLnNlcmllcztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLmFjdGl2ZUVudHJpZXMgPSBbLi4uaXRlbXNdO1xuICAgIHRoaXMuYWN0aXZhdGUuZW1pdCh7IHZhbHVlOiBpdGVtLCBlbnRyaWVzOiB0aGlzLmFjdGl2ZUVudHJpZXMgfSk7XG4gIH1cblxuICBvbkRlYWN0aXZhdGUoZXZlbnQsIGdyb3VwOiBEYXRhSXRlbSwgZnJvbUxlZ2VuZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbSA9IE9iamVjdC5hc3NpZ24oe30sIGV2ZW50KTtcbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIGl0ZW0uc2VyaWVzID0gZ3JvdXAubmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZUVudHJpZXMgPSB0aGlzLmFjdGl2ZUVudHJpZXMuZmlsdGVyKGkgPT4ge1xuICAgICAgaWYgKGZyb21MZWdlbmQpIHtcbiAgICAgICAgcmV0dXJuIGkubGFiZWwgIT09IGl0ZW0ubmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAhKGkubmFtZSA9PT0gaXRlbS5uYW1lICYmIGkuc2VyaWVzID09PSBpdGVtLnNlcmllcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmRlYWN0aXZhdGUuZW1pdCh7IHZhbHVlOiBpdGVtLCBlbnRyaWVzOiB0aGlzLmFjdGl2ZUVudHJpZXMgfSk7XG4gIH1cbn1cbiJdfQ==