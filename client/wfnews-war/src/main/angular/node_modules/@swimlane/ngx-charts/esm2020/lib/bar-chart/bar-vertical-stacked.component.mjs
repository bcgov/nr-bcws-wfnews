import { Component, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleBand, scaleLinear } from 'd3-scale';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { BarChartType } from './types/bar-chart-type.enum';
import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import * as i0 from "@angular/core";
import * as i1 from "../common/charts/chart.component";
import * as i2 from "../common/axes/x-axis.component";
import * as i3 from "../common/axes/y-axis.component";
import * as i4 from "./series-vertical.component";
import * as i5 from "@angular/common";
export class BarVerticalStackedComponent extends BaseChartComponent {
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
        this.barPadding = 8;
        this.roundDomains = false;
        this.showDataLabel = false;
        this.noBarWhenZero = true;
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.margin = [10, 20, 10, 20];
        this.xAxisHeight = 0;
        this.yAxisWidth = 0;
        this.dataLabelMaxHeight = { negative: 0, positive: 0 };
        this.isSSR = false;
        this.barChartType = BarChartType;
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
            this.dataLabelMaxHeight = { negative: 0, positive: 0 };
        }
        this.margin = [10 + this.dataLabelMaxHeight.positive, 20, 10 + this.dataLabelMaxHeight.negative, 20];
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
        if (this.showDataLabel) {
            this.dims.height -= this.dataLabelMaxHeight.negative;
        }
        this.formatDates();
        this.groupDomain = this.getGroupDomain();
        this.innerDomain = this.getInnerDomain();
        this.valueDomain = this.getValueDomain();
        this.xScale = this.getXScale();
        this.yScale = this.getYScale();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0] + this.dataLabelMaxHeight.negative})`;
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
        let smallest = 0;
        let biggest = 0;
        for (const group of this.results) {
            let smallestSum = 0;
            let biggestSum = 0;
            for (const d of group.series) {
                if (d.value < 0) {
                    smallestSum += d.value;
                }
                else {
                    biggestSum += d.value;
                }
                smallest = d.value < smallest ? d.value : smallest;
                biggest = d.value > biggest ? d.value : biggest;
            }
            domain.push(smallestSum);
            domain.push(biggestSum);
        }
        domain.push(smallest);
        domain.push(biggest);
        const min = Math.min(0, ...domain);
        const max = this.yScaleMax ? Math.max(this.yScaleMax, ...domain) : Math.max(...domain);
        return [min, max];
    }
    getXScale() {
        const spacing = this.groupDomain.length / (this.dims.width / this.barPadding + 1);
        return scaleBand().rangeRound([0, this.dims.width]).paddingInner(spacing).domain(this.groupDomain);
    }
    getYScale() {
        const scale = scaleLinear().range([this.dims.height, 0]).domain(this.valueDomain);
        return this.roundDomains ? scale.nice() : scale;
    }
    onDataLabelMaxHeightChanged(event, groupIndex) {
        if (event.size.negative) {
            this.dataLabelMaxHeight.negative = Math.max(this.dataLabelMaxHeight.negative, event.size.height);
        }
        else {
            this.dataLabelMaxHeight.positive = Math.max(this.dataLabelMaxHeight.positive, event.size.height);
        }
        if (groupIndex === this.results.length - 1) {
            setTimeout(() => this.update());
        }
    }
    groupTransform(group) {
        return `translate(${this.xScale(group.name) || 0}, 0)`;
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
BarVerticalStackedComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BarVerticalStackedComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
BarVerticalStackedComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: BarVerticalStackedComponent, selector: "ngx-charts-bar-vertical-stacked", inputs: { legend: "legend", legendTitle: "legendTitle", legendPosition: "legendPosition", xAxis: "xAxis", yAxis: "yAxis", showXAxisLabel: "showXAxisLabel", showYAxisLabel: "showYAxisLabel", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel", tooltipDisabled: "tooltipDisabled", gradient: "gradient", showGridLines: "showGridLines", activeEntries: "activeEntries", schemeType: "schemeType", trimXAxisTicks: "trimXAxisTicks", trimYAxisTicks: "trimYAxisTicks", rotateXAxisTicks: "rotateXAxisTicks", maxXAxisTickLength: "maxXAxisTickLength", maxYAxisTickLength: "maxYAxisTickLength", xAxisTickFormatting: "xAxisTickFormatting", yAxisTickFormatting: "yAxisTickFormatting", xAxisTicks: "xAxisTicks", yAxisTicks: "yAxisTicks", barPadding: "barPadding", roundDomains: "roundDomains", yScaleMax: "yScaleMax", showDataLabel: "showDataLabel", dataLabelFormatting: "dataLabelFormatting", noBarWhenZero: "noBarWhenZero" }, outputs: { activate: "activate", deactivate: "deactivate" }, queries: [{ propertyName: "tooltipTemplate", first: true, predicate: ["tooltipTemplate"], descendants: true }], usesInheritance: true, ngImport: i0, template: `
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
          [xAxisOffset]="dataLabelMaxHeight.negative"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g *ngIf="!isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-vertical
              [type]="barChartType.Stacked"
              [xScale]="xScale"
              [yScale]="yScale"
              [activeEntries]="activeEntries"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [seriesName]="group.name"
              [animations]="animations"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
      <svg:g *ngIf="isSSR">
        <svg:g
          *ngFor="let group of results; let index = index; trackBy: trackBy"
          [attr.transform]="groupTransform(group)"
        >
          <svg:g
            ngx-charts-series-vertical
            [type]="barChartType.Stacked"
            [xScale]="xScale"
            [yScale]="yScale"
            [activeEntries]="activeEntries"
            [colors]="colors"
            [series]="group.series"
            [dims]="dims"
            [gradient]="gradient"
            [tooltipDisabled]="tooltipDisabled"
            [tooltipTemplate]="tooltipTemplate"
            [showDataLabel]="showDataLabel"
            [dataLabelFormatting]="dataLabelFormatting"
            [seriesName]="group.name"
            [animations]="animations"
            [noBarWhenZero]="noBarWhenZero"
            (select)="onClick($event, group)"
            (activate)="onActivate($event, group)"
            (deactivate)="onDeactivate($event, group)"
            (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, isInline: true, styles: [".ngx-charts-outer{-webkit-animation:chartFadeIn linear .6s;animation:chartFadeIn linear .6s}@-webkit-keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}@keyframes chartFadeIn{0%{opacity:0}20%{opacity:0}to{opacity:1}}.ngx-charts{float:left;overflow:visible}.ngx-charts .circle,.ngx-charts .cell,.ngx-charts .bar,.ngx-charts .arc{cursor:pointer}.ngx-charts .bar.active,.ngx-charts .bar:hover,.ngx-charts .cell.active,.ngx-charts .cell:hover,.ngx-charts .arc.active,.ngx-charts .arc:hover,.ngx-charts .card.active,.ngx-charts .card:hover{opacity:.8;transition:opacity .1s ease-in-out}.ngx-charts .bar:focus,.ngx-charts .cell:focus,.ngx-charts .arc:focus,.ngx-charts .card:focus{outline:none}.ngx-charts .bar.hidden,.ngx-charts .cell.hidden,.ngx-charts .arc.hidden,.ngx-charts .card.hidden{display:none}.ngx-charts g:focus{outline:none}.ngx-charts .line-series.inactive,.ngx-charts .line-series-range.inactive,.ngx-charts .polar-series-path.inactive,.ngx-charts .polar-series-area.inactive,.ngx-charts .area-series.inactive{transition:opacity .1s ease-in-out;opacity:.2}.ngx-charts .line-highlight{display:none}.ngx-charts .line-highlight.active{display:block}.ngx-charts .area{opacity:.6}.ngx-charts .circle:hover{cursor:pointer}.ngx-charts .label{font-size:12px;font-weight:400}.ngx-charts .tooltip-anchor{fill:#000}.ngx-charts .gridline-path{stroke:#ddd;stroke-width:1;fill:none}.ngx-charts .refline-path{stroke:#a8b2c7;stroke-width:1;stroke-dasharray:5;stroke-dashoffset:5}.ngx-charts .refline-label{font-size:9px}.ngx-charts .reference-area{fill-opacity:.05;fill:#000}.ngx-charts .gridline-path-dotted{stroke:#ddd;stroke-width:1;fill:none;stroke-dasharray:1,20;stroke-dashoffset:3}.ngx-charts .grid-panel rect{fill:none}.ngx-charts .grid-panel.odd rect{fill:#0000000d}\n"], components: [{ type: i1.ChartComponent, selector: "ngx-charts-chart", inputs: ["view", "showLegend", "legendOptions", "legendType", "activeEntries", "animations"], outputs: ["legendLabelClick", "legendLabelActivate", "legendLabelDeactivate"] }, { type: i2.XAxisComponent, selector: "g[ngx-charts-x-axis]", inputs: ["xScale", "dims", "trimTicks", "rotateTicks", "maxTickLength", "tickFormatting", "showGridLines", "showLabel", "labelText", "ticks", "xAxisTickCount", "xOrient", "xAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i3.YAxisComponent, selector: "g[ngx-charts-y-axis]", inputs: ["yScale", "dims", "trimTicks", "maxTickLength", "tickFormatting", "ticks", "showGridLines", "showLabel", "labelText", "yAxisTickCount", "yOrient", "referenceLines", "showRefLines", "showRefLabels", "yAxisOffset"], outputs: ["dimensionsChanged"] }, { type: i4.SeriesVerticalComponent, selector: "g[ngx-charts-series-vertical]", inputs: ["dims", "type", "series", "xScale", "yScale", "colors", "gradient", "activeEntries", "seriesName", "tooltipDisabled", "tooltipTemplate", "roundEdges", "animations", "showDataLabel", "dataLabelFormatting", "noBarWhenZero"], outputs: ["select", "activate", "deactivate", "dataLabelHeightChanged"] }], directives: [{ type: i5.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i5.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], animations: [
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BarVerticalStackedComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-charts-bar-vertical-stacked', template: `
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
          [xAxisOffset]="dataLabelMaxHeight.negative"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g *ngIf="!isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-vertical
              [type]="barChartType.Stacked"
              [xScale]="xScale"
              [yScale]="yScale"
              [activeEntries]="activeEntries"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="gradient"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="tooltipTemplate"
              [showDataLabel]="showDataLabel"
              [dataLabelFormatting]="dataLabelFormatting"
              [seriesName]="group.name"
              [animations]="animations"
              [noBarWhenZero]="noBarWhenZero"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
      <svg:g *ngIf="isSSR">
        <svg:g
          *ngFor="let group of results; let index = index; trackBy: trackBy"
          [attr.transform]="groupTransform(group)"
        >
          <svg:g
            ngx-charts-series-vertical
            [type]="barChartType.Stacked"
            [xScale]="xScale"
            [yScale]="yScale"
            [activeEntries]="activeEntries"
            [colors]="colors"
            [series]="group.series"
            [dims]="dims"
            [gradient]="gradient"
            [tooltipDisabled]="tooltipDisabled"
            [tooltipTemplate]="tooltipTemplate"
            [showDataLabel]="showDataLabel"
            [dataLabelFormatting]="dataLabelFormatting"
            [seriesName]="group.name"
            [animations]="animations"
            [noBarWhenZero]="noBarWhenZero"
            (select)="onClick($event, group)"
            (activate)="onActivate($event, group)"
            (deactivate)="onDeactivate($event, group)"
            (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, animations: [
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
            }], barPadding: [{
                type: Input
            }], roundDomains: [{
                type: Input
            }], yScaleMax: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLXZlcnRpY2FsLXN0YWNrZWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2Jhci1jaGFydC9iYXItdmVydGljYWwtc3RhY2tlZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLFlBQVksRUFHYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDMUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXJELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLEVBQWlCLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7OztBQTJINUQsTUFBTSxPQUFPLDJCQUE0QixTQUFRLGtCQUFrQjtJQXhIbkU7O1FBeUhXLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZ0JBQVcsR0FBVyxRQUFRLENBQUM7UUFDL0IsbUJBQWMsR0FBbUIsY0FBYyxDQUFDLEtBQUssQ0FBQztRQU90RCxvQkFBZSxH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LFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDOzZCQUMzRCxDQUFDO3lCQUNILENBQUM7cUJBQ0g7OEJBR1EsTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxnQkFBZ0I7c0JBQXhCLEtBQUs7Z0JBQ0csa0JBQWtCO3NCQUExQixLQUFLO2dCQUNHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFDRyxtQkFBbUI7c0JBQTNCLEtBQUs7Z0JBQ0csbUJBQW1CO3NCQUEzQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUVJLFFBQVE7c0JBQWpCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFFMEIsZUFBZTtzQkFBL0MsWUFBWTt1QkFBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb250ZW50Q2hpbGQsXG4gIFRlbXBsYXRlUmVmLFxuICBUcmFja0J5RnVuY3Rpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IHRyaWdnZXIsIHN0eWxlLCBhbmltYXRlLCB0cmFuc2l0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQgeyBzY2FsZUJhbmQsIHNjYWxlTGluZWFyIH0gZnJvbSAnZDMtc2NhbGUnO1xuXG5pbXBvcnQgeyBjYWxjdWxhdGVWaWV3RGltZW5zaW9ucyB9IGZyb20gJy4uL2NvbW1vbi92aWV3LWRpbWVuc2lvbnMuaGVscGVyJztcbmltcG9ydCB7IENvbG9ySGVscGVyIH0gZnJvbSAnLi4vY29tbW9uL2NvbG9yLmhlbHBlcic7XG5pbXBvcnQgeyBTZXJpZXMgfSBmcm9tICcuLi9tb2RlbHMvY2hhcnQtZGF0YS5tb2RlbCc7XG5pbXBvcnQgeyBCYXNlQ2hhcnRDb21wb25lbnQgfSBmcm9tICcuLi9jb21tb24vYmFzZS1jaGFydC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQmFyQ2hhcnRUeXBlIH0gZnJvbSAnLi90eXBlcy9iYXItY2hhcnQtdHlwZS5lbnVtJztcbmltcG9ydCB7IExlZ2VuZE9wdGlvbnMsIExlZ2VuZFBvc2l0aW9uIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2xlZ2VuZC5tb2RlbCc7XG5pbXBvcnQgeyBTY2FsZVR5cGUgfSBmcm9tICcuLi9jb21tb24vdHlwZXMvc2NhbGUtdHlwZS5lbnVtJztcbmltcG9ydCB7IFZpZXdEaW1lbnNpb25zIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL3ZpZXctZGltZW5zaW9uLmludGVyZmFjZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1jaGFydHMtYmFyLXZlcnRpY2FsLXN0YWNrZWQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZ3gtY2hhcnRzLWNoYXJ0XG4gICAgICBbdmlld109XCJbd2lkdGgsIGhlaWdodF1cIlxuICAgICAgW3Nob3dMZWdlbmRdPVwibGVnZW5kXCJcbiAgICAgIFtsZWdlbmRPcHRpb25zXT1cImxlZ2VuZE9wdGlvbnNcIlxuICAgICAgW2FjdGl2ZUVudHJpZXNdPVwiYWN0aXZlRW50cmllc1wiXG4gICAgICBbYW5pbWF0aW9uc109XCJhbmltYXRpb25zXCJcbiAgICAgIChsZWdlbmRMYWJlbEFjdGl2YXRlKT1cIm9uQWN0aXZhdGUoJGV2ZW50LCB1bmRlZmluZWQsIHRydWUpXCJcbiAgICAgIChsZWdlbmRMYWJlbERlYWN0aXZhdGUpPVwib25EZWFjdGl2YXRlKCRldmVudCwgdW5kZWZpbmVkLCB0cnVlKVwiXG4gICAgICAobGVnZW5kTGFiZWxDbGljayk9XCJvbkNsaWNrKCRldmVudClcIlxuICAgID5cbiAgICAgIDxzdmc6ZyBbYXR0ci50cmFuc2Zvcm1dPVwidHJhbnNmb3JtXCIgY2xhc3M9XCJiYXItY2hhcnQgY2hhcnRcIj5cbiAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgbmd4LWNoYXJ0cy14LWF4aXNcbiAgICAgICAgICAqbmdJZj1cInhBeGlzXCJcbiAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgW2RpbXNdPVwiZGltc1wiXG4gICAgICAgICAgW3Nob3dMYWJlbF09XCJzaG93WEF4aXNMYWJlbFwiXG4gICAgICAgICAgW2xhYmVsVGV4dF09XCJ4QXhpc0xhYmVsXCJcbiAgICAgICAgICBbdHJpbVRpY2tzXT1cInRyaW1YQXhpc1RpY2tzXCJcbiAgICAgICAgICBbcm90YXRlVGlja3NdPVwicm90YXRlWEF4aXNUaWNrc1wiXG4gICAgICAgICAgW21heFRpY2tMZW5ndGhdPVwibWF4WEF4aXNUaWNrTGVuZ3RoXCJcbiAgICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwieEF4aXNUaWNrRm9ybWF0dGluZ1wiXG4gICAgICAgICAgW3RpY2tzXT1cInhBeGlzVGlja3NcIlxuICAgICAgICAgIFt4QXhpc09mZnNldF09XCJkYXRhTGFiZWxNYXhIZWlnaHQubmVnYXRpdmVcIlxuICAgICAgICAgIChkaW1lbnNpb25zQ2hhbmdlZCk9XCJ1cGRhdGVYQXhpc0hlaWdodCgkZXZlbnQpXCJcbiAgICAgICAgPjwvc3ZnOmc+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgIG5neC1jaGFydHMteS1heGlzXG4gICAgICAgICAgKm5nSWY9XCJ5QXhpc1wiXG4gICAgICAgICAgW3lTY2FsZV09XCJ5U2NhbGVcIlxuICAgICAgICAgIFtkaW1zXT1cImRpbXNcIlxuICAgICAgICAgIFtzaG93R3JpZExpbmVzXT1cInNob3dHcmlkTGluZXNcIlxuICAgICAgICAgIFtzaG93TGFiZWxdPVwic2hvd1lBeGlzTGFiZWxcIlxuICAgICAgICAgIFtsYWJlbFRleHRdPVwieUF4aXNMYWJlbFwiXG4gICAgICAgICAgW3RyaW1UaWNrc109XCJ0cmltWUF4aXNUaWNrc1wiXG4gICAgICAgICAgW21heFRpY2tMZW5ndGhdPVwibWF4WUF4aXNUaWNrTGVuZ3RoXCJcbiAgICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwieUF4aXNUaWNrRm9ybWF0dGluZ1wiXG4gICAgICAgICAgW3RpY2tzXT1cInlBeGlzVGlja3NcIlxuICAgICAgICAgIChkaW1lbnNpb25zQ2hhbmdlZCk9XCJ1cGRhdGVZQXhpc1dpZHRoKCRldmVudClcIlxuICAgICAgICA+PC9zdmc6Zz5cbiAgICAgICAgPHN2ZzpnICpuZ0lmPVwiIWlzU1NSXCI+XG4gICAgICAgICAgPHN2ZzpnXG4gICAgICAgICAgICAqbmdGb3I9XCJsZXQgZ3JvdXAgb2YgcmVzdWx0czsgbGV0IGluZGV4ID0gaW5kZXg7IHRyYWNrQnk6IHRyYWNrQnlcIlxuICAgICAgICAgICAgW0BhbmltYXRpb25TdGF0ZV09XCInYWN0aXZlJ1wiXG4gICAgICAgICAgICBbYXR0ci50cmFuc2Zvcm1dPVwiZ3JvdXBUcmFuc2Zvcm0oZ3JvdXApXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnOmdcbiAgICAgICAgICAgICAgbmd4LWNoYXJ0cy1zZXJpZXMtdmVydGljYWxcbiAgICAgICAgICAgICAgW3R5cGVdPVwiYmFyQ2hhcnRUeXBlLlN0YWNrZWRcIlxuICAgICAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgICAgIFt5U2NhbGVdPVwieVNjYWxlXCJcbiAgICAgICAgICAgICAgW2FjdGl2ZUVudHJpZXNdPVwiYWN0aXZlRW50cmllc1wiXG4gICAgICAgICAgICAgIFtjb2xvcnNdPVwiY29sb3JzXCJcbiAgICAgICAgICAgICAgW3Nlcmllc109XCJncm91cC5zZXJpZXNcIlxuICAgICAgICAgICAgICBbZGltc109XCJkaW1zXCJcbiAgICAgICAgICAgICAgW2dyYWRpZW50XT1cImdyYWRpZW50XCJcbiAgICAgICAgICAgICAgW3Rvb2x0aXBEaXNhYmxlZF09XCJ0b29sdGlwRGlzYWJsZWRcIlxuICAgICAgICAgICAgICBbdG9vbHRpcFRlbXBsYXRlXT1cInRvb2x0aXBUZW1wbGF0ZVwiXG4gICAgICAgICAgICAgIFtzaG93RGF0YUxhYmVsXT1cInNob3dEYXRhTGFiZWxcIlxuICAgICAgICAgICAgICBbZGF0YUxhYmVsRm9ybWF0dGluZ109XCJkYXRhTGFiZWxGb3JtYXR0aW5nXCJcbiAgICAgICAgICAgICAgW3Nlcmllc05hbWVdPVwiZ3JvdXAubmFtZVwiXG4gICAgICAgICAgICAgIFthbmltYXRpb25zXT1cImFuaW1hdGlvbnNcIlxuICAgICAgICAgICAgICBbbm9CYXJXaGVuWmVyb109XCJub0JhcldoZW5aZXJvXCJcbiAgICAgICAgICAgICAgKHNlbGVjdCk9XCJvbkNsaWNrKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgICAgKGFjdGl2YXRlKT1cIm9uQWN0aXZhdGUoJGV2ZW50LCBncm91cClcIlxuICAgICAgICAgICAgICAoZGVhY3RpdmF0ZSk9XCJvbkRlYWN0aXZhdGUoJGV2ZW50LCBncm91cClcIlxuICAgICAgICAgICAgICAoZGF0YUxhYmVsSGVpZ2h0Q2hhbmdlZCk9XCJvbkRhdGFMYWJlbE1heEhlaWdodENoYW5nZWQoJGV2ZW50LCBpbmRleClcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2ZzpnPlxuICAgICAgICA8L3N2ZzpnPlxuICAgICAgPC9zdmc6Zz5cbiAgICAgIDxzdmc6ZyAqbmdJZj1cImlzU1NSXCI+XG4gICAgICAgIDxzdmc6Z1xuICAgICAgICAgICpuZ0Zvcj1cImxldCBncm91cCBvZiByZXN1bHRzOyBsZXQgaW5kZXggPSBpbmRleDsgdHJhY2tCeTogdHJhY2tCeVwiXG4gICAgICAgICAgW2F0dHIudHJhbnNmb3JtXT1cImdyb3VwVHJhbnNmb3JtKGdyb3VwKVwiXG4gICAgICAgID5cbiAgICAgICAgICA8c3ZnOmdcbiAgICAgICAgICAgIG5neC1jaGFydHMtc2VyaWVzLXZlcnRpY2FsXG4gICAgICAgICAgICBbdHlwZV09XCJiYXJDaGFydFR5cGUuU3RhY2tlZFwiXG4gICAgICAgICAgICBbeFNjYWxlXT1cInhTY2FsZVwiXG4gICAgICAgICAgICBbeVNjYWxlXT1cInlTY2FsZVwiXG4gICAgICAgICAgICBbYWN0aXZlRW50cmllc109XCJhY3RpdmVFbnRyaWVzXCJcbiAgICAgICAgICAgIFtjb2xvcnNdPVwiY29sb3JzXCJcbiAgICAgICAgICAgIFtzZXJpZXNdPVwiZ3JvdXAuc2VyaWVzXCJcbiAgICAgICAgICAgIFtkaW1zXT1cImRpbXNcIlxuICAgICAgICAgICAgW2dyYWRpZW50XT1cImdyYWRpZW50XCJcbiAgICAgICAgICAgIFt0b29sdGlwRGlzYWJsZWRdPVwidG9vbHRpcERpc2FibGVkXCJcbiAgICAgICAgICAgIFt0b29sdGlwVGVtcGxhdGVdPVwidG9vbHRpcFRlbXBsYXRlXCJcbiAgICAgICAgICAgIFtzaG93RGF0YUxhYmVsXT1cInNob3dEYXRhTGFiZWxcIlxuICAgICAgICAgICAgW2RhdGFMYWJlbEZvcm1hdHRpbmddPVwiZGF0YUxhYmVsRm9ybWF0dGluZ1wiXG4gICAgICAgICAgICBbc2VyaWVzTmFtZV09XCJncm91cC5uYW1lXCJcbiAgICAgICAgICAgIFthbmltYXRpb25zXT1cImFuaW1hdGlvbnNcIlxuICAgICAgICAgICAgW25vQmFyV2hlblplcm9dPVwibm9CYXJXaGVuWmVyb1wiXG4gICAgICAgICAgICAoc2VsZWN0KT1cIm9uQ2xpY2soJGV2ZW50LCBncm91cClcIlxuICAgICAgICAgICAgKGFjdGl2YXRlKT1cIm9uQWN0aXZhdGUoJGV2ZW50LCBncm91cClcIlxuICAgICAgICAgICAgKGRlYWN0aXZhdGUpPVwib25EZWFjdGl2YXRlKCRldmVudCwgZ3JvdXApXCJcbiAgICAgICAgICAgIChkYXRhTGFiZWxIZWlnaHRDaGFuZ2VkKT1cIm9uRGF0YUxhYmVsTWF4SGVpZ2h0Q2hhbmdlZCgkZXZlbnQsIGluZGV4KVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zdmc6Zz5cbiAgICAgIDwvc3ZnOmc+XG4gICAgPC9uZ3gtY2hhcnRzLWNoYXJ0PlxuICBgLFxuICBzdHlsZVVybHM6IFsnLi4vY29tbW9uL2Jhc2UtY2hhcnQuY29tcG9uZW50LnNjc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdhbmltYXRpb25TdGF0ZScsIFtcbiAgICAgIHRyYW5zaXRpb24oJzpsZWF2ZScsIFtcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgdHJhbnNmb3JtOiAnKidcbiAgICAgICAgfSksXG4gICAgICAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3NjYWxlKDApJyB9KSlcbiAgICAgIF0pXG4gICAgXSlcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBCYXJWZXJ0aWNhbFN0YWNrZWRDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ2hhcnRDb21wb25lbnQge1xuICBASW5wdXQoKSBsZWdlbmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgbGVnZW5kVGl0bGU6IHN0cmluZyA9ICdMZWdlbmQnO1xuICBASW5wdXQoKSBsZWdlbmRQb3NpdGlvbjogTGVnZW5kUG9zaXRpb24gPSBMZWdlbmRQb3NpdGlvbi5SaWdodDtcbiAgQElucHV0KCkgeEF4aXM7XG4gIEBJbnB1dCgpIHlBeGlzO1xuICBASW5wdXQoKSBzaG93WEF4aXNMYWJlbDogYm9vbGVhbjtcbiAgQElucHV0KCkgc2hvd1lBeGlzTGFiZWw6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHhBeGlzTGFiZWw6IHN0cmluZztcbiAgQElucHV0KCkgeUF4aXNMYWJlbDogc3RyaW5nO1xuICBASW5wdXQoKSB0b29sdGlwRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZ3JhZGllbnQ6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNob3dHcmlkTGluZXM6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBzY2hlbWVUeXBlOiBTY2FsZVR5cGU7XG4gIEBJbnB1dCgpIHRyaW1YQXhpc1RpY2tzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgdHJpbVlBeGlzVGlja3M6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSByb3RhdGVYQXhpc1RpY2tzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgbWF4WEF4aXNUaWNrTGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgQElucHV0KCkgbWF4WUF4aXNUaWNrTGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgQElucHV0KCkgeEF4aXNUaWNrRm9ybWF0dGluZzogYW55O1xuICBASW5wdXQoKSB5QXhpc1RpY2tGb3JtYXR0aW5nOiBhbnk7XG4gIEBJbnB1dCgpIHhBeGlzVGlja3M6IGFueVtdO1xuICBASW5wdXQoKSB5QXhpc1RpY2tzOiBhbnlbXTtcbiAgQElucHV0KCkgYmFyUGFkZGluZzogbnVtYmVyID0gODtcbiAgQElucHV0KCkgcm91bmREb21haW5zOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHlTY2FsZU1heDogbnVtYmVyO1xuICBASW5wdXQoKSBzaG93RGF0YUxhYmVsOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGRhdGFMYWJlbEZvcm1hdHRpbmc6IGFueTtcbiAgQElucHV0KCkgbm9CYXJXaGVuWmVybzogYm9vbGVhbiA9IHRydWU7XG5cbiAgQE91dHB1dCgpIGFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGRlYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIEBDb250ZW50Q2hpbGQoJ3Rvb2x0aXBUZW1wbGF0ZScpIHRvb2x0aXBUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBkaW1zOiBWaWV3RGltZW5zaW9ucztcbiAgZ3JvdXBEb21haW46IHN0cmluZ1tdO1xuICBpbm5lckRvbWFpbjogc3RyaW5nW107XG4gIHZhbHVlRG9tYWluOiBbbnVtYmVyLCBudW1iZXJdO1xuICB4U2NhbGU6IGFueTtcbiAgeVNjYWxlOiBhbnk7XG4gIHRyYW5zZm9ybTogc3RyaW5nO1xuICB0aWNrRm9ybWF0dGluZzogKGxhYmVsOiBzdHJpbmcpID0+IHN0cmluZztcbiAgY29sb3JzOiBDb2xvckhlbHBlcjtcbiAgbWFyZ2luOiBudW1iZXJbXSA9IFsxMCwgMjAsIDEwLCAyMF07XG4gIHhBeGlzSGVpZ2h0OiBudW1iZXIgPSAwO1xuICB5QXhpc1dpZHRoOiBudW1iZXIgPSAwO1xuICBsZWdlbmRPcHRpb25zOiBMZWdlbmRPcHRpb25zO1xuICBkYXRhTGFiZWxNYXhIZWlnaHQ6IGFueSA9IHsgbmVnYXRpdmU6IDAsIHBvc2l0aXZlOiAwIH07XG4gIGlzU1NSID0gZmFsc2U7XG5cbiAgYmFyQ2hhcnRUeXBlID0gQmFyQ2hhcnRUeXBlO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChpc1BsYXRmb3JtU2VydmVyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgIHRoaXMuaXNTU1IgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBzdXBlci51cGRhdGUoKTtcblxuICAgIGlmICghdGhpcy5zaG93RGF0YUxhYmVsKSB7XG4gICAgICB0aGlzLmRhdGFMYWJlbE1heEhlaWdodCA9IHsgbmVnYXRpdmU6IDAsIHBvc2l0aXZlOiAwIH07XG4gICAgfVxuICAgIHRoaXMubWFyZ2luID0gWzEwICsgdGhpcy5kYXRhTGFiZWxNYXhIZWlnaHQucG9zaXRpdmUsIDIwLCAxMCArIHRoaXMuZGF0YUxhYmVsTWF4SGVpZ2h0Lm5lZ2F0aXZlLCAyMF07XG5cbiAgICB0aGlzLmRpbXMgPSBjYWxjdWxhdGVWaWV3RGltZW5zaW9ucyh7XG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBtYXJnaW5zOiB0aGlzLm1hcmdpbixcbiAgICAgIHNob3dYQXhpczogdGhpcy54QXhpcyxcbiAgICAgIHNob3dZQXhpczogdGhpcy55QXhpcyxcbiAgICAgIHhBeGlzSGVpZ2h0OiB0aGlzLnhBeGlzSGVpZ2h0LFxuICAgICAgeUF4aXNXaWR0aDogdGhpcy55QXhpc1dpZHRoLFxuICAgICAgc2hvd1hMYWJlbDogdGhpcy5zaG93WEF4aXNMYWJlbCxcbiAgICAgIHNob3dZTGFiZWw6IHRoaXMuc2hvd1lBeGlzTGFiZWwsXG4gICAgICBzaG93TGVnZW5kOiB0aGlzLmxlZ2VuZCxcbiAgICAgIGxlZ2VuZFR5cGU6IHRoaXMuc2NoZW1lVHlwZSxcbiAgICAgIGxlZ2VuZFBvc2l0aW9uOiB0aGlzLmxlZ2VuZFBvc2l0aW9uXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5zaG93RGF0YUxhYmVsKSB7XG4gICAgICB0aGlzLmRpbXMuaGVpZ2h0IC09IHRoaXMuZGF0YUxhYmVsTWF4SGVpZ2h0Lm5lZ2F0aXZlO1xuICAgIH1cblxuICAgIHRoaXMuZm9ybWF0RGF0ZXMoKTtcblxuICAgIHRoaXMuZ3JvdXBEb21haW4gPSB0aGlzLmdldEdyb3VwRG9tYWluKCk7XG4gICAgdGhpcy5pbm5lckRvbWFpbiA9IHRoaXMuZ2V0SW5uZXJEb21haW4oKTtcbiAgICB0aGlzLnZhbHVlRG9tYWluID0gdGhpcy5nZXRWYWx1ZURvbWFpbigpO1xuXG4gICAgdGhpcy54U2NhbGUgPSB0aGlzLmdldFhTY2FsZSgpO1xuICAgIHRoaXMueVNjYWxlID0gdGhpcy5nZXRZU2NhbGUoKTtcblxuICAgIHRoaXMuc2V0Q29sb3JzKCk7XG4gICAgdGhpcy5sZWdlbmRPcHRpb25zID0gdGhpcy5nZXRMZWdlbmRPcHRpb25zKCk7XG5cbiAgICB0aGlzLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHt0aGlzLmRpbXMueE9mZnNldH0gLCAke3RoaXMubWFyZ2luWzBdICsgdGhpcy5kYXRhTGFiZWxNYXhIZWlnaHQubmVnYXRpdmV9KWA7XG4gIH1cblxuICBnZXRHcm91cERvbWFpbigpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZG9tYWluID0gW107XG4gICAgZm9yIChjb25zdCBncm91cCBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGlmICghZG9tYWluLmluY2x1ZGVzKGdyb3VwLmxhYmVsKSkge1xuICAgICAgICBkb21haW4ucHVzaChncm91cC5sYWJlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkb21haW47XG4gIH1cblxuICBnZXRJbm5lckRvbWFpbigpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZG9tYWluID0gW107XG4gICAgZm9yIChjb25zdCBncm91cCBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgZCBvZiBncm91cC5zZXJpZXMpIHtcbiAgICAgICAgaWYgKCFkb21haW4uaW5jbHVkZXMoZC5sYWJlbCkpIHtcbiAgICAgICAgICBkb21haW4ucHVzaChkLmxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZG9tYWluO1xuICB9XG5cbiAgZ2V0VmFsdWVEb21haW4oKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgY29uc3QgZG9tYWluID0gW107XG4gICAgbGV0IHNtYWxsZXN0ID0gMDtcbiAgICBsZXQgYmlnZ2VzdCA9IDA7XG4gICAgZm9yIChjb25zdCBncm91cCBvZiB0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGxldCBzbWFsbGVzdFN1bSA9IDA7XG4gICAgICBsZXQgYmlnZ2VzdFN1bSA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgZ3JvdXAuc2VyaWVzKSB7XG4gICAgICAgIGlmIChkLnZhbHVlIDwgMCkge1xuICAgICAgICAgIHNtYWxsZXN0U3VtICs9IGQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmlnZ2VzdFN1bSArPSBkLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNtYWxsZXN0ID0gZC52YWx1ZSA8IHNtYWxsZXN0ID8gZC52YWx1ZSA6IHNtYWxsZXN0O1xuICAgICAgICBiaWdnZXN0ID0gZC52YWx1ZSA+IGJpZ2dlc3QgPyBkLnZhbHVlIDogYmlnZ2VzdDtcbiAgICAgIH1cbiAgICAgIGRvbWFpbi5wdXNoKHNtYWxsZXN0U3VtKTtcbiAgICAgIGRvbWFpbi5wdXNoKGJpZ2dlc3RTdW0pO1xuICAgIH1cbiAgICBkb21haW4ucHVzaChzbWFsbGVzdCk7XG4gICAgZG9tYWluLnB1c2goYmlnZ2VzdCk7XG5cbiAgICBjb25zdCBtaW4gPSBNYXRoLm1pbigwLCAuLi5kb21haW4pO1xuICAgIGNvbnN0IG1heCA9IHRoaXMueVNjYWxlTWF4ID8gTWF0aC5tYXgodGhpcy55U2NhbGVNYXgsIC4uLmRvbWFpbikgOiBNYXRoLm1heCguLi5kb21haW4pO1xuICAgIHJldHVybiBbbWluLCBtYXhdO1xuICB9XG5cbiAgZ2V0WFNjYWxlKCk6IGFueSB7XG4gICAgY29uc3Qgc3BhY2luZyA9IHRoaXMuZ3JvdXBEb21haW4ubGVuZ3RoIC8gKHRoaXMuZGltcy53aWR0aCAvIHRoaXMuYmFyUGFkZGluZyArIDEpO1xuICAgIHJldHVybiBzY2FsZUJhbmQoKS5yYW5nZVJvdW5kKFswLCB0aGlzLmRpbXMud2lkdGhdKS5wYWRkaW5nSW5uZXIoc3BhY2luZykuZG9tYWluKHRoaXMuZ3JvdXBEb21haW4pO1xuICB9XG5cbiAgZ2V0WVNjYWxlKCk6IGFueSB7XG4gICAgY29uc3Qgc2NhbGUgPSBzY2FsZUxpbmVhcigpLnJhbmdlKFt0aGlzLmRpbXMuaGVpZ2h0LCAwXSkuZG9tYWluKHRoaXMudmFsdWVEb21haW4pO1xuICAgIHJldHVybiB0aGlzLnJvdW5kRG9tYWlucyA/IHNjYWxlLm5pY2UoKSA6IHNjYWxlO1xuICB9XG5cbiAgb25EYXRhTGFiZWxNYXhIZWlnaHRDaGFuZ2VkKGV2ZW50LCBncm91cEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAoZXZlbnQuc2l6ZS5uZWdhdGl2ZSkge1xuICAgICAgdGhpcy5kYXRhTGFiZWxNYXhIZWlnaHQubmVnYXRpdmUgPSBNYXRoLm1heCh0aGlzLmRhdGFMYWJlbE1heEhlaWdodC5uZWdhdGl2ZSwgZXZlbnQuc2l6ZS5oZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGFMYWJlbE1heEhlaWdodC5wb3NpdGl2ZSA9IE1hdGgubWF4KHRoaXMuZGF0YUxhYmVsTWF4SGVpZ2h0LnBvc2l0aXZlLCBldmVudC5zaXplLmhlaWdodCk7XG4gICAgfVxuICAgIGlmIChncm91cEluZGV4ID09PSB0aGlzLnJlc3VsdHMubGVuZ3RoIC0gMSkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgICB9XG4gIH1cblxuICBncm91cFRyYW5zZm9ybShncm91cDogU2VyaWVzKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3RoaXMueFNjYWxlKGdyb3VwLm5hbWUpIHx8IDB9LCAwKWA7XG4gIH1cblxuICBvbkNsaWNrKGRhdGEsIGdyb3VwPzogU2VyaWVzKSB7XG4gICAgaWYgKGdyb3VwKSB7XG4gICAgICBkYXRhLnNlcmllcyA9IGdyb3VwLm5hbWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3QuZW1pdChkYXRhKTtcbiAgfVxuXG4gIHRyYWNrQnk6IFRyYWNrQnlGdW5jdGlvbjxTZXJpZXM+ID0gKGluZGV4OiBudW1iZXIsIGl0ZW06IFNlcmllcykgPT4ge1xuICAgIHJldHVybiBpdGVtLm5hbWU7XG4gIH07XG5cbiAgc2V0Q29sb3JzKCk6IHZvaWQge1xuICAgIGxldCBkb21haW47XG4gICAgaWYgKHRoaXMuc2NoZW1lVHlwZSA9PT0gU2NhbGVUeXBlLk9yZGluYWwpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuaW5uZXJEb21haW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMudmFsdWVEb21haW47XG4gICAgfVxuXG4gICAgdGhpcy5jb2xvcnMgPSBuZXcgQ29sb3JIZWxwZXIodGhpcy5zY2hlbWUsIHRoaXMuc2NoZW1lVHlwZSwgZG9tYWluLCB0aGlzLmN1c3RvbUNvbG9ycyk7XG4gIH1cblxuICBnZXRMZWdlbmRPcHRpb25zKCk6IExlZ2VuZE9wdGlvbnMge1xuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICBzY2FsZVR5cGU6IHRoaXMuc2NoZW1lVHlwZSBhcyBhbnksXG4gICAgICBjb2xvcnM6IHVuZGVmaW5lZCxcbiAgICAgIGRvbWFpbjogW10sXG4gICAgICB0aXRsZTogdW5kZWZpbmVkLFxuICAgICAgcG9zaXRpb246IHRoaXMubGVnZW5kUG9zaXRpb25cbiAgICB9O1xuICAgIGlmIChvcHRzLnNjYWxlVHlwZSA9PT0gU2NhbGVUeXBlLk9yZGluYWwpIHtcbiAgICAgIG9wdHMuZG9tYWluID0gdGhpcy5pbm5lckRvbWFpbjtcbiAgICAgIG9wdHMuY29sb3JzID0gdGhpcy5jb2xvcnM7XG4gICAgICBvcHRzLnRpdGxlID0gdGhpcy5sZWdlbmRUaXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0cy5kb21haW4gPSB0aGlzLnZhbHVlRG9tYWluO1xuICAgICAgb3B0cy5jb2xvcnMgPSB0aGlzLmNvbG9ycy5zY2FsZTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0cztcbiAgfVxuXG4gIHVwZGF0ZVlBeGlzV2lkdGgoeyB3aWR0aCB9OiB7IHdpZHRoOiBudW1iZXIgfSk6IHZvaWQge1xuICAgIHRoaXMueUF4aXNXaWR0aCA9IHdpZHRoO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1cGRhdGVYQXhpc0hlaWdodCh7IGhlaWdodCB9OiB7IGhlaWdodDogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICB0aGlzLnhBeGlzSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBvbkFjdGl2YXRlKGV2ZW50LCBncm91cCwgZnJvbUxlZ2VuZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbSA9IE9iamVjdC5hc3NpZ24oe30sIGV2ZW50KTtcbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIGl0ZW0uc2VyaWVzID0gZ3JvdXAubmFtZTtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtcyA9IHRoaXMucmVzdWx0c1xuICAgICAgLm1hcChnID0+IGcuc2VyaWVzKVxuICAgICAgLmZsYXQoKVxuICAgICAgLmZpbHRlcihpID0+IHtcbiAgICAgICAgaWYgKGZyb21MZWdlbmQpIHtcbiAgICAgICAgICByZXR1cm4gaS5sYWJlbCA9PT0gaXRlbS5uYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpLm5hbWUgPT09IGl0ZW0ubmFtZSAmJiBpLnNlcmllcyA9PT0gaXRlbS5zZXJpZXM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdGhpcy5hY3RpdmVFbnRyaWVzID0gWy4uLml0ZW1zXTtcbiAgICB0aGlzLmFjdGl2YXRlLmVtaXQoeyB2YWx1ZTogaXRlbSwgZW50cmllczogdGhpcy5hY3RpdmVFbnRyaWVzIH0pO1xuICB9XG5cbiAgb25EZWFjdGl2YXRlKGV2ZW50LCBncm91cDogU2VyaWVzLCBmcm9tTGVnZW5kOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBpdGVtID0gT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQpO1xuICAgIGlmIChncm91cCkge1xuICAgICAgaXRlbS5zZXJpZXMgPSBncm91cC5uYW1lO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlRW50cmllcyA9IHRoaXMuYWN0aXZlRW50cmllcy5maWx0ZXIoaSA9PiB7XG4gICAgICBpZiAoZnJvbUxlZ2VuZCkge1xuICAgICAgICByZXR1cm4gaS5sYWJlbCAhPT0gaXRlbS5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICEoaS5uYW1lID09PSBpdGVtLm5hbWUgJiYgaS5zZXJpZXMgPT09IGl0ZW0uc2VyaWVzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZGVhY3RpdmF0ZS5lbWl0KHsgdmFsdWU6IGl0ZW0sIGVudHJpZXM6IHRoaXMuYWN0aXZlRW50cmllcyB9KTtcbiAgfVxufVxuIl19