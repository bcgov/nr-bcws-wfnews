import { isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { reduceTicks } from './ticks.helper';
import { TextAnchor } from '../types/text-anchor.enum';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class XAxisTicksComponent {
    constructor(platformId) {
        this.platformId = platformId;
        this.tickArguments = [5];
        this.tickStroke = '#ccc';
        this.trimTicks = true;
        this.maxTickLength = 16;
        this.showGridLines = false;
        this.rotateTicks = true;
        this.dimensionsChanged = new EventEmitter();
        this.verticalSpacing = 20;
        this.rotateLabels = false;
        this.innerTickSize = 6;
        this.outerTickSize = 6;
        this.tickPadding = 3;
        this.textAnchor = TextAnchor.Middle;
        this.maxTicksLength = 0;
        this.maxAllowedLength = 16;
        this.height = 0;
        this.approxHeight = 10;
    }
    ngOnChanges(changes) {
        this.update();
    }
    ngAfterViewInit() {
        setTimeout(() => this.updateDims());
    }
    updateDims() {
        if (!isPlatformBrowser(this.platformId)) {
            // for SSR, use approximate value instead of measured
            this.dimensionsChanged.emit({ height: this.approxHeight });
            return;
        }
        const height = parseInt(this.ticksElement.nativeElement.getBoundingClientRect().height, 10);
        if (height !== this.height) {
            this.height = height;
            this.dimensionsChanged.emit({ height: this.height });
            setTimeout(() => this.updateDims());
        }
    }
    update() {
        const scale = this.scale;
        this.ticks = this.getTicks();
        if (this.tickFormatting) {
            this.tickFormat = this.tickFormatting;
        }
        else if (scale.tickFormat) {
            this.tickFormat = scale.tickFormat.apply(scale, this.tickArguments);
        }
        else {
            this.tickFormat = function (d) {
                if (d.constructor.name === 'Date') {
                    return d.toLocaleDateString();
                }
                return d.toLocaleString();
            };
        }
        const angle = this.rotateTicks ? this.getRotationAngle(this.ticks) : null;
        this.adjustedScale = this.scale.bandwidth
            ? function (d) {
                return this.scale(d) + this.scale.bandwidth() * 0.5;
            }
            : this.scale;
        this.textTransform = '';
        if (angle && angle !== 0) {
            this.textTransform = `rotate(${angle})`;
            this.textAnchor = TextAnchor.End;
            this.verticalSpacing = 10;
        }
        else {
            this.textAnchor = TextAnchor.Middle;
        }
        setTimeout(() => this.updateDims());
    }
    getRotationAngle(ticks) {
        let angle = 0;
        this.maxTicksLength = 0;
        for (let i = 0; i < ticks.length; i++) {
            const tick = this.tickFormat(ticks[i]).toString();
            let tickLength = tick.length;
            if (this.trimTicks) {
                tickLength = this.tickTrim(tick).length;
            }
            if (tickLength > this.maxTicksLength) {
                this.maxTicksLength = tickLength;
            }
        }
        const len = Math.min(this.maxTicksLength, this.maxAllowedLength);
        const charWidth = 7; // need to measure this
        const wordWidth = len * charWidth;
        let baseWidth = wordWidth;
        const maxBaseWidth = Math.floor(this.width / ticks.length);
        // calculate optimal angle
        while (baseWidth > maxBaseWidth && angle > -90) {
            angle -= 30;
            baseWidth = Math.cos(angle * (Math.PI / 180)) * wordWidth;
        }
        this.approxHeight = Math.max(Math.abs(Math.sin(angle * (Math.PI / 180)) * wordWidth), 10);
        return angle;
    }
    getTicks() {
        let ticks;
        const maxTicks = this.getMaxTicks(20);
        const maxScaleTicks = this.getMaxTicks(100);
        if (this.tickValues) {
            ticks = this.tickValues;
        }
        else if (this.scale.ticks) {
            ticks = this.scale.ticks.apply(this.scale, [maxScaleTicks]);
        }
        else {
            ticks = this.scale.domain();
            ticks = reduceTicks(ticks, maxTicks);
        }
        return ticks;
    }
    getMaxTicks(tickWidth) {
        return Math.floor(this.width / tickWidth);
    }
    tickTransform(tick) {
        return 'translate(' + this.adjustedScale(tick) + ',' + this.verticalSpacing + ')';
    }
    gridLineTransform() {
        return `translate(0,${-this.verticalSpacing - 5})`;
    }
    tickTrim(label) {
        return this.trimTicks ? trimLabel(label, this.maxTickLength) : label;
    }
}
XAxisTicksComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: XAxisTicksComponent, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
XAxisTicksComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: XAxisTicksComponent, selector: "g[ngx-charts-x-axis-ticks]", inputs: { scale: "scale", orient: "orient", tickArguments: "tickArguments", tickValues: "tickValues", tickStroke: "tickStroke", trimTicks: "trimTicks", maxTickLength: "maxTickLength", tickFormatting: "tickFormatting", showGridLines: "showGridLines", gridLineHeight: "gridLineHeight", width: "width", rotateTicks: "rotateTicks" }, outputs: { dimensionsChanged: "dimensionsChanged" }, viewQueries: [{ propertyName: "ticksElement", first: true, predicate: ["ticksel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <svg:g #ticksel>
      <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="tickTransform(tick)">
        <title>{{ tickFormat(tick) }}</title>
        <svg:text
          stroke-width="0.01"
          [attr.text-anchor]="textAnchor"
          [attr.transform]="textTransform"
          [style.font-size]="'12px'"
        >
          {{ tickTrim(tickFormat(tick)) }}
        </svg:text>
      </svg:g>
    </svg:g>

    <svg:g *ngFor="let tick of ticks" [attr.transform]="tickTransform(tick)">
      <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
        <svg:line class="gridline-path gridline-path-vertical" [attr.y1]="-gridLineHeight" y2="0" />
      </svg:g>
    </svg:g>
  `, isInline: true, directives: [{ type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: XAxisTicksComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'g[ngx-charts-x-axis-ticks]',
                    template: `
    <svg:g #ticksel>
      <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="tickTransform(tick)">
        <title>{{ tickFormat(tick) }}</title>
        <svg:text
          stroke-width="0.01"
          [attr.text-anchor]="textAnchor"
          [attr.transform]="textTransform"
          [style.font-size]="'12px'"
        >
          {{ tickTrim(tickFormat(tick)) }}
        </svg:text>
      </svg:g>
    </svg:g>

    <svg:g *ngFor="let tick of ticks" [attr.transform]="tickTransform(tick)">
      <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
        <svg:line class="gridline-path gridline-path-vertical" [attr.y1]="-gridLineHeight" y2="0" />
      </svg:g>
    </svg:g>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }]; }, propDecorators: { scale: [{
                type: Input
            }], orient: [{
                type: Input
            }], tickArguments: [{
                type: Input
            }], tickValues: [{
                type: Input
            }], tickStroke: [{
                type: Input
            }], trimTicks: [{
                type: Input
            }], maxTickLength: [{
                type: Input
            }], tickFormatting: [{
                type: Input
            }], showGridLines: [{
                type: Input
            }], gridLineHeight: [{
                type: Input
            }], width: [{
                type: Input
            }], rotateTicks: [{
                type: Input
            }], dimensionsChanged: [{
                type: Output
            }], ticksElement: [{
                type: ViewChild,
                args: ['ticksel']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieC1heGlzLXRpY2tzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9jb21tb24vYXhlcy94LWF4aXMtdGlja3MuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBR1osU0FBUyxFQUdULHVCQUF1QixFQUN2QixNQUFNLEVBQ04sV0FBVyxFQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDOzs7QUEyQnZELE1BQU0sT0FBTyxtQkFBbUI7SUFpQzlCLFlBQXlDLFVBQWU7UUFBZixlQUFVLEdBQVYsVUFBVSxDQUFLO1FBOUIvQyxrQkFBYSxHQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUIsZUFBVSxHQUFXLE1BQU0sQ0FBQztRQUM1QixjQUFTLEdBQVksSUFBSSxDQUFDO1FBQzFCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBRTNCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBR3RCLGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBRTNCLHNCQUFpQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFFakQsb0JBQWUsR0FBVyxFQUFFLENBQUM7UUFDN0IsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFDOUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIsZUFBVSxHQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDM0MsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFDM0IscUJBQWdCLEdBQVcsRUFBRSxDQUFDO1FBSzlCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsaUJBQVksR0FBVyxFQUFFLENBQUM7SUFJaUMsQ0FBQztJQUU1RCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxlQUFlO1FBQ2IsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2QyxxREFBcUQ7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMzRCxPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUYsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQ3ZDO2FBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNyRTthQUFNO1lBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO29CQUNqQyxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUMvQjtnQkFDRCxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUM7U0FDSDtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUxRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztZQUN2QyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUN0RCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFZixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxLQUFLLEdBQUcsQ0FBQztZQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7U0FDM0I7YUFBTTtZQUNMLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztTQUNyQztRQUVELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBWTtRQUMzQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7YUFDekM7WUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQzthQUNsQztTQUNGO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtRQUM1QyxNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBRWxDLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMxQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNELDBCQUEwQjtRQUMxQixPQUFPLFNBQVMsR0FBRyxZQUFZLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQzlDLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDWixTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO1NBQzNEO1FBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFMUYsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksS0FBSyxDQUFDO1FBQ1YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUN6QjthQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDM0IsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztTQUM3RDthQUFNO1lBQ0wsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDNUIsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDdEM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxXQUFXLENBQUMsU0FBaUI7UUFDM0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZO1FBQ3hCLE9BQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxpQkFBaUI7UUFDZixPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ3JELENBQUM7SUFFRCxRQUFRLENBQUMsS0FBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDdkUsQ0FBQzs7Z0hBL0pVLG1CQUFtQixrQkFpQ1YsV0FBVztvR0FqQ3BCLG1CQUFtQiwrakJBdkJwQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQlQ7MkZBR1UsbUJBQW1CO2tCQXpCL0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsNEJBQTRCO29CQUN0QyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JUO29CQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2lCQUNoRDs7MEJBa0NjLE1BQU07MkJBQUMsV0FBVzs0Q0FoQ3RCLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUVJLGlCQUFpQjtzQkFBMUIsTUFBTTtnQkFpQmUsWUFBWTtzQkFBakMsU0FBUzt1QkFBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uQ2hhbmdlcyxcbiAgRWxlbWVudFJlZixcbiAgVmlld0NoaWxkLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgSW5qZWN0LFxuICBQTEFURk9STV9JRFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IHRyaW1MYWJlbCB9IGZyb20gJy4uL3RyaW0tbGFiZWwuaGVscGVyJztcbmltcG9ydCB7IHJlZHVjZVRpY2tzIH0gZnJvbSAnLi90aWNrcy5oZWxwZXInO1xuaW1wb3J0IHsgT3JpZW50YXRpb24gfSBmcm9tICcuLi90eXBlcy9vcmllbnRhdGlvbi5lbnVtJztcbmltcG9ydCB7IFRleHRBbmNob3IgfSBmcm9tICcuLi90eXBlcy90ZXh0LWFuY2hvci5lbnVtJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLXgtYXhpcy10aWNrc10nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxzdmc6ZyAjdGlja3NlbD5cbiAgICAgIDxzdmc6ZyAqbmdGb3I9XCJsZXQgdGljayBvZiB0aWNrc1wiIGNsYXNzPVwidGlja1wiIFthdHRyLnRyYW5zZm9ybV09XCJ0aWNrVHJhbnNmb3JtKHRpY2spXCI+XG4gICAgICAgIDx0aXRsZT57eyB0aWNrRm9ybWF0KHRpY2spIH19PC90aXRsZT5cbiAgICAgICAgPHN2Zzp0ZXh0XG4gICAgICAgICAgc3Ryb2tlLXdpZHRoPVwiMC4wMVwiXG4gICAgICAgICAgW2F0dHIudGV4dC1hbmNob3JdPVwidGV4dEFuY2hvclwiXG4gICAgICAgICAgW2F0dHIudHJhbnNmb3JtXT1cInRleHRUcmFuc2Zvcm1cIlxuICAgICAgICAgIFtzdHlsZS5mb250LXNpemVdPVwiJzEycHgnXCJcbiAgICAgICAgPlxuICAgICAgICAgIHt7IHRpY2tUcmltKHRpY2tGb3JtYXQodGljaykpIH19XG4gICAgICAgIDwvc3ZnOnRleHQ+XG4gICAgICA8L3N2ZzpnPlxuICAgIDwvc3ZnOmc+XG5cbiAgICA8c3ZnOmcgKm5nRm9yPVwibGV0IHRpY2sgb2YgdGlja3NcIiBbYXR0ci50cmFuc2Zvcm1dPVwidGlja1RyYW5zZm9ybSh0aWNrKVwiPlxuICAgICAgPHN2ZzpnICpuZ0lmPVwic2hvd0dyaWRMaW5lc1wiIFthdHRyLnRyYW5zZm9ybV09XCJncmlkTGluZVRyYW5zZm9ybSgpXCI+XG4gICAgICAgIDxzdmc6bGluZSBjbGFzcz1cImdyaWRsaW5lLXBhdGggZ3JpZGxpbmUtcGF0aC12ZXJ0aWNhbFwiIFthdHRyLnkxXT1cIi1ncmlkTGluZUhlaWdodFwiIHkyPVwiMFwiIC8+XG4gICAgICA8L3N2ZzpnPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIFhBeGlzVGlja3NDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQge1xuICBASW5wdXQoKSBzY2FsZTtcbiAgQElucHV0KCkgb3JpZW50OiBPcmllbnRhdGlvbjtcbiAgQElucHV0KCkgdGlja0FyZ3VtZW50czogbnVtYmVyW10gPSBbNV07XG4gIEBJbnB1dCgpIHRpY2tWYWx1ZXM6IHN0cmluZ1tdIHwgbnVtYmVyW107XG4gIEBJbnB1dCgpIHRpY2tTdHJva2U6IHN0cmluZyA9ICcjY2NjJztcbiAgQElucHV0KCkgdHJpbVRpY2tzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgbWF4VGlja0xlbmd0aDogbnVtYmVyID0gMTY7XG4gIEBJbnB1dCgpIHRpY2tGb3JtYXR0aW5nO1xuICBASW5wdXQoKSBzaG93R3JpZExpbmVzID0gZmFsc2U7XG4gIEBJbnB1dCgpIGdyaWRMaW5lSGVpZ2h0OiBudW1iZXI7XG4gIEBJbnB1dCgpIHdpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIHJvdGF0ZVRpY2tzOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgZGltZW5zaW9uc0NoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgdmVydGljYWxTcGFjaW5nOiBudW1iZXIgPSAyMDtcbiAgcm90YXRlTGFiZWxzOiBib29sZWFuID0gZmFsc2U7XG4gIGlubmVyVGlja1NpemU6IG51bWJlciA9IDY7XG4gIG91dGVyVGlja1NpemU6IG51bWJlciA9IDY7XG4gIHRpY2tQYWRkaW5nOiBudW1iZXIgPSAzO1xuICB0ZXh0QW5jaG9yOiBUZXh0QW5jaG9yID0gVGV4dEFuY2hvci5NaWRkbGU7XG4gIG1heFRpY2tzTGVuZ3RoOiBudW1iZXIgPSAwO1xuICBtYXhBbGxvd2VkTGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgYWRqdXN0ZWRTY2FsZTogYW55O1xuICB0ZXh0VHJhbnNmb3JtOiBzdHJpbmc7XG4gIHRpY2tzOiBhbnlbXTtcbiAgdGlja0Zvcm1hdDogKG86IGFueSkgPT4gYW55O1xuICBoZWlnaHQ6IG51bWJlciA9IDA7XG4gIGFwcHJveEhlaWdodDogbnVtYmVyID0gMTA7XG5cbiAgQFZpZXdDaGlsZCgndGlja3NlbCcpIHRpY2tzRWxlbWVudDogRWxlbWVudFJlZjtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IGFueSkge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlRGltcygpKTtcbiAgfVxuXG4gIHVwZGF0ZURpbXMoKTogdm9pZCB7XG4gICAgaWYgKCFpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICAvLyBmb3IgU1NSLCB1c2UgYXBwcm94aW1hdGUgdmFsdWUgaW5zdGVhZCBvZiBtZWFzdXJlZFxuICAgICAgdGhpcy5kaW1lbnNpb25zQ2hhbmdlZC5lbWl0KHsgaGVpZ2h0OiB0aGlzLmFwcHJveEhlaWdodCB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWlnaHQgPSBwYXJzZUludCh0aGlzLnRpY2tzRWxlbWVudC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCwgMTApO1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgIHRoaXMuZGltZW5zaW9uc0NoYW5nZWQuZW1pdCh7IGhlaWdodDogdGhpcy5oZWlnaHQgfSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlRGltcygpKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlO1xuICAgIHRoaXMudGlja3MgPSB0aGlzLmdldFRpY2tzKCk7XG5cbiAgICBpZiAodGhpcy50aWNrRm9ybWF0dGluZykge1xuICAgICAgdGhpcy50aWNrRm9ybWF0ID0gdGhpcy50aWNrRm9ybWF0dGluZztcbiAgICB9IGVsc2UgaWYgKHNjYWxlLnRpY2tGb3JtYXQpIHtcbiAgICAgIHRoaXMudGlja0Zvcm1hdCA9IHNjYWxlLnRpY2tGb3JtYXQuYXBwbHkoc2NhbGUsIHRoaXMudGlja0FyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGlja0Zvcm1hdCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIGlmIChkLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdEYXRlJykge1xuICAgICAgICAgIHJldHVybiBkLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGFuZ2xlID0gdGhpcy5yb3RhdGVUaWNrcyA/IHRoaXMuZ2V0Um90YXRpb25BbmdsZSh0aGlzLnRpY2tzKSA6IG51bGw7XG5cbiAgICB0aGlzLmFkanVzdGVkU2NhbGUgPSB0aGlzLnNjYWxlLmJhbmR3aWR0aFxuICAgICAgPyBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNjYWxlKGQpICsgdGhpcy5zY2FsZS5iYW5kd2lkdGgoKSAqIDAuNTtcbiAgICAgICAgfVxuICAgICAgOiB0aGlzLnNjYWxlO1xuXG4gICAgdGhpcy50ZXh0VHJhbnNmb3JtID0gJyc7XG4gICAgaWYgKGFuZ2xlICYmIGFuZ2xlICE9PSAwKSB7XG4gICAgICB0aGlzLnRleHRUcmFuc2Zvcm0gPSBgcm90YXRlKCR7YW5nbGV9KWA7XG4gICAgICB0aGlzLnRleHRBbmNob3IgPSBUZXh0QW5jaG9yLkVuZDtcbiAgICAgIHRoaXMudmVydGljYWxTcGFjaW5nID0gMTA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dEFuY2hvciA9IFRleHRBbmNob3IuTWlkZGxlO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVEaW1zKCkpO1xuICB9XG5cbiAgZ2V0Um90YXRpb25BbmdsZSh0aWNrczogYW55W10pOiBudW1iZXIge1xuICAgIGxldCBhbmdsZSA9IDA7XG4gICAgdGhpcy5tYXhUaWNrc0xlbmd0aCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdGljayA9IHRoaXMudGlja0Zvcm1hdCh0aWNrc1tpXSkudG9TdHJpbmcoKTtcbiAgICAgIGxldCB0aWNrTGVuZ3RoID0gdGljay5sZW5ndGg7XG4gICAgICBpZiAodGhpcy50cmltVGlja3MpIHtcbiAgICAgICAgdGlja0xlbmd0aCA9IHRoaXMudGlja1RyaW0odGljaykubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBpZiAodGlja0xlbmd0aCA+IHRoaXMubWF4VGlja3NMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5tYXhUaWNrc0xlbmd0aCA9IHRpY2tMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVuID0gTWF0aC5taW4odGhpcy5tYXhUaWNrc0xlbmd0aCwgdGhpcy5tYXhBbGxvd2VkTGVuZ3RoKTtcbiAgICBjb25zdCBjaGFyV2lkdGggPSA3OyAvLyBuZWVkIHRvIG1lYXN1cmUgdGhpc1xuICAgIGNvbnN0IHdvcmRXaWR0aCA9IGxlbiAqIGNoYXJXaWR0aDtcblxuICAgIGxldCBiYXNlV2lkdGggPSB3b3JkV2lkdGg7XG4gICAgY29uc3QgbWF4QmFzZVdpZHRoID0gTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gdGlja3MubGVuZ3RoKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBvcHRpbWFsIGFuZ2xlXG4gICAgd2hpbGUgKGJhc2VXaWR0aCA+IG1heEJhc2VXaWR0aCAmJiBhbmdsZSA+IC05MCkge1xuICAgICAgYW5nbGUgLT0gMzA7XG4gICAgICBiYXNlV2lkdGggPSBNYXRoLmNvcyhhbmdsZSAqIChNYXRoLlBJIC8gMTgwKSkgKiB3b3JkV2lkdGg7XG4gICAgfVxuXG4gICAgdGhpcy5hcHByb3hIZWlnaHQgPSBNYXRoLm1heChNYXRoLmFicyhNYXRoLnNpbihhbmdsZSAqIChNYXRoLlBJIC8gMTgwKSkgKiB3b3JkV2lkdGgpLCAxMCk7XG5cbiAgICByZXR1cm4gYW5nbGU7XG4gIH1cblxuICBnZXRUaWNrcygpOiBhbnlbXSB7XG4gICAgbGV0IHRpY2tzO1xuICAgIGNvbnN0IG1heFRpY2tzID0gdGhpcy5nZXRNYXhUaWNrcygyMCk7XG4gICAgY29uc3QgbWF4U2NhbGVUaWNrcyA9IHRoaXMuZ2V0TWF4VGlja3MoMTAwKTtcblxuICAgIGlmICh0aGlzLnRpY2tWYWx1ZXMpIHtcbiAgICAgIHRpY2tzID0gdGhpcy50aWNrVmFsdWVzO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY2FsZS50aWNrcykge1xuICAgICAgdGlja3MgPSB0aGlzLnNjYWxlLnRpY2tzLmFwcGx5KHRoaXMuc2NhbGUsIFttYXhTY2FsZVRpY2tzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpY2tzID0gdGhpcy5zY2FsZS5kb21haW4oKTtcbiAgICAgIHRpY2tzID0gcmVkdWNlVGlja3ModGlja3MsIG1heFRpY2tzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGlja3M7XG4gIH1cblxuICBnZXRNYXhUaWNrcyh0aWNrV2lkdGg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy53aWR0aCAvIHRpY2tXaWR0aCk7XG4gIH1cblxuICB0aWNrVHJhbnNmb3JtKHRpY2s6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKSArICcsJyArIHRoaXMudmVydGljYWxTcGFjaW5nICsgJyknO1xuICB9XG5cbiAgZ3JpZExpbmVUcmFuc2Zvcm0oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRyYW5zbGF0ZSgwLCR7LXRoaXMudmVydGljYWxTcGFjaW5nIC0gNX0pYDtcbiAgfVxuXG4gIHRpY2tUcmltKGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRyaW1UaWNrcyA/IHRyaW1MYWJlbChsYWJlbCwgdGhpcy5tYXhUaWNrTGVuZ3RoKSA6IGxhYmVsO1xuICB9XG59XG4iXX0=