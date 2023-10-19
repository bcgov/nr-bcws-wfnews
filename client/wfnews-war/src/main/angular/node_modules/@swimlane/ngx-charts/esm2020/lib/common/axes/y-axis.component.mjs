import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { YAxisTicksComponent } from './y-axis-ticks.component';
import { Orientation } from '../types/orientation.enum';
import * as i0 from "@angular/core";
import * as i1 from "./y-axis-ticks.component";
import * as i2 from "./axis-label.component";
import * as i3 from "@angular/common";
export class YAxisComponent {
    constructor() {
        this.showGridLines = false;
        this.yOrient = Orientation.Left;
        this.yAxisOffset = 0;
        this.dimensionsChanged = new EventEmitter();
        this.yAxisClassName = 'y axis';
        this.labelOffset = 15;
        this.fill = 'none';
        this.stroke = '#CCC';
        this.tickStroke = '#CCC';
        this.strokeWidth = 1;
        this.padding = 5;
    }
    ngOnChanges(changes) {
        this.update();
    }
    update() {
        this.offset = -(this.yAxisOffset + this.padding);
        if (this.yOrient === Orientation.Right) {
            this.labelOffset = 65;
            this.transform = `translate(${this.offset + this.dims.width} , 0)`;
        }
        else {
            this.offset = this.offset;
            this.transform = `translate(${this.offset} , 0)`;
        }
        if (this.yAxisTickCount !== undefined) {
            this.tickArguments = [this.yAxisTickCount];
        }
    }
    emitTicksWidth({ width }) {
        if (width !== this.labelOffset && this.yOrient === Orientation.Right) {
            this.labelOffset = width + this.labelOffset;
            setTimeout(() => {
                this.dimensionsChanged.emit({ width });
            }, 0);
        }
        else if (width !== this.labelOffset) {
            this.labelOffset = width;
            setTimeout(() => {
                this.dimensionsChanged.emit({ width });
            }, 0);
        }
    }
}
YAxisComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: YAxisComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
YAxisComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: YAxisComponent, selector: "g[ngx-charts-y-axis]", inputs: { yScale: "yScale", dims: "dims", trimTicks: "trimTicks", maxTickLength: "maxTickLength", tickFormatting: "tickFormatting", ticks: "ticks", showGridLines: "showGridLines", showLabel: "showLabel", labelText: "labelText", yAxisTickCount: "yAxisTickCount", yOrient: "yOrient", referenceLines: "referenceLines", showRefLines: "showRefLines", showRefLabels: "showRefLabels", yAxisOffset: "yAxisOffset" }, outputs: { dimensionsChanged: "dimensionsChanged" }, viewQueries: [{ propertyName: "ticksComponent", first: true, predicate: YAxisTicksComponent, descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <svg:g [attr.class]="yAxisClassName" [attr.transform]="transform">
      <svg:g
        ngx-charts-y-axis-ticks
        *ngIf="yScale"
        [trimTicks]="trimTicks"
        [maxTickLength]="maxTickLength"
        [tickFormatting]="tickFormatting"
        [tickArguments]="tickArguments"
        [tickValues]="ticks"
        [tickStroke]="tickStroke"
        [scale]="yScale"
        [orient]="yOrient"
        [showGridLines]="showGridLines"
        [gridLineWidth]="dims.width"
        [referenceLines]="referenceLines"
        [showRefLines]="showRefLines"
        [showRefLabels]="showRefLabels"
        [height]="dims.height"
        (dimensionsChanged)="emitTicksWidth($event)"
      />

      <svg:g
        ngx-charts-axis-label
        *ngIf="showLabel"
        [label]="labelText"
        [offset]="labelOffset"
        [orient]="yOrient"
        [height]="dims.height"
        [width]="dims.width"
      ></svg:g>
    </svg:g>
  `, isInline: true, components: [{ type: i1.YAxisTicksComponent, selector: "g[ngx-charts-y-axis-ticks]", inputs: ["scale", "orient", "tickArguments", "tickValues", "tickStroke", "trimTicks", "maxTickLength", "tickFormatting", "showGridLines", "gridLineWidth", "height", "referenceLines", "showRefLabels", "showRefLines"], outputs: ["dimensionsChanged"] }, { type: i2.AxisLabelComponent, selector: "g[ngx-charts-axis-label]", inputs: ["orient", "label", "offset", "width", "height"] }], directives: [{ type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: YAxisComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'g[ngx-charts-y-axis]',
                    template: `
    <svg:g [attr.class]="yAxisClassName" [attr.transform]="transform">
      <svg:g
        ngx-charts-y-axis-ticks
        *ngIf="yScale"
        [trimTicks]="trimTicks"
        [maxTickLength]="maxTickLength"
        [tickFormatting]="tickFormatting"
        [tickArguments]="tickArguments"
        [tickValues]="ticks"
        [tickStroke]="tickStroke"
        [scale]="yScale"
        [orient]="yOrient"
        [showGridLines]="showGridLines"
        [gridLineWidth]="dims.width"
        [referenceLines]="referenceLines"
        [showRefLines]="showRefLines"
        [showRefLabels]="showRefLabels"
        [height]="dims.height"
        (dimensionsChanged)="emitTicksWidth($event)"
      />

      <svg:g
        ngx-charts-axis-label
        *ngIf="showLabel"
        [label]="labelText"
        [offset]="labelOffset"
        [orient]="yOrient"
        [height]="dims.height"
        [width]="dims.width"
      ></svg:g>
    </svg:g>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], propDecorators: { yScale: [{
                type: Input
            }], dims: [{
                type: Input
            }], trimTicks: [{
                type: Input
            }], maxTickLength: [{
                type: Input
            }], tickFormatting: [{
                type: Input
            }], ticks: [{
                type: Input
            }], showGridLines: [{
                type: Input
            }], showLabel: [{
                type: Input
            }], labelText: [{
                type: Input
            }], yAxisTickCount: [{
                type: Input
            }], yOrient: [{
                type: Input
            }], referenceLines: [{
                type: Input
            }], showRefLines: [{
                type: Input
            }], showRefLabels: [{
                type: Input
            }], yAxisOffset: [{
                type: Input
            }], dimensionsChanged: [{
                type: Output
            }], ticksComponent: [{
                type: ViewChild,
                args: [YAxisTicksComponent]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieS1heGlzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9jb21tb24vYXhlcy95LWF4aXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBRVosU0FBUyxFQUVULHVCQUF1QixFQUN4QixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7Ozs7O0FBd0N4RCxNQUFNLE9BQU8sY0FBYztJQXJDM0I7UUE0Q1csa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFJL0IsWUFBTyxHQUFnQixXQUFXLENBQUMsSUFBSSxDQUFDO1FBSXhDLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLHNCQUFpQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFFakQsbUJBQWMsR0FBVyxRQUFRLENBQUM7UUFJbEMsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFDekIsU0FBSSxHQUFXLE1BQU0sQ0FBQztRQUN0QixXQUFNLEdBQVcsTUFBTSxDQUFDO1FBQ3hCLGVBQVUsR0FBVyxNQUFNLENBQUM7UUFDNUIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIsWUFBTyxHQUFXLENBQUMsQ0FBQztLQW9DckI7SUFoQ0MsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUM7U0FDcEU7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLGFBQWEsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDO1NBQ2xEO1FBRUQsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVELGNBQWMsQ0FBQyxFQUFFLEtBQUssRUFBRTtRQUN0QixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLEtBQUssRUFBRTtZQUNwRSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzVDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1A7YUFBTSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1A7SUFDSCxDQUFDOzsyR0E5RFUsY0FBYzsrRkFBZCxjQUFjLHlqQkE2QmQsbUJBQW1CLHFFQWhFcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NUOzJGQUdVLGNBQWM7a0JBckMxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxzQkFBc0I7b0JBQ2hDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ1Q7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2hEOzhCQUVVLE1BQU07c0JBQWQsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0ksaUJBQWlCO3NCQUExQixNQUFNO2dCQWF5QixjQUFjO3NCQUE3QyxTQUFTO3VCQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBPbkNoYW5nZXMsXG4gIFZpZXdDaGlsZCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBZQXhpc1RpY2tzQ29tcG9uZW50IH0gZnJvbSAnLi95LWF4aXMtdGlja3MuY29tcG9uZW50JztcbmltcG9ydCB7IE9yaWVudGF0aW9uIH0gZnJvbSAnLi4vdHlwZXMvb3JpZW50YXRpb24uZW51bSc7XG5pbXBvcnQgeyBWaWV3RGltZW5zaW9ucyB9IGZyb20gJy4uL3R5cGVzL3ZpZXctZGltZW5zaW9uLmludGVyZmFjZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy15LWF4aXNdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmcgW2F0dHIuY2xhc3NdPVwieUF4aXNDbGFzc05hbWVcIiBbYXR0ci50cmFuc2Zvcm1dPVwidHJhbnNmb3JtXCI+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgbmd4LWNoYXJ0cy15LWF4aXMtdGlja3NcbiAgICAgICAgKm5nSWY9XCJ5U2NhbGVcIlxuICAgICAgICBbdHJpbVRpY2tzXT1cInRyaW1UaWNrc1wiXG4gICAgICAgIFttYXhUaWNrTGVuZ3RoXT1cIm1heFRpY2tMZW5ndGhcIlxuICAgICAgICBbdGlja0Zvcm1hdHRpbmddPVwidGlja0Zvcm1hdHRpbmdcIlxuICAgICAgICBbdGlja0FyZ3VtZW50c109XCJ0aWNrQXJndW1lbnRzXCJcbiAgICAgICAgW3RpY2tWYWx1ZXNdPVwidGlja3NcIlxuICAgICAgICBbdGlja1N0cm9rZV09XCJ0aWNrU3Ryb2tlXCJcbiAgICAgICAgW3NjYWxlXT1cInlTY2FsZVwiXG4gICAgICAgIFtvcmllbnRdPVwieU9yaWVudFwiXG4gICAgICAgIFtzaG93R3JpZExpbmVzXT1cInNob3dHcmlkTGluZXNcIlxuICAgICAgICBbZ3JpZExpbmVXaWR0aF09XCJkaW1zLndpZHRoXCJcbiAgICAgICAgW3JlZmVyZW5jZUxpbmVzXT1cInJlZmVyZW5jZUxpbmVzXCJcbiAgICAgICAgW3Nob3dSZWZMaW5lc109XCJzaG93UmVmTGluZXNcIlxuICAgICAgICBbc2hvd1JlZkxhYmVsc109XCJzaG93UmVmTGFiZWxzXCJcbiAgICAgICAgW2hlaWdodF09XCJkaW1zLmhlaWdodFwiXG4gICAgICAgIChkaW1lbnNpb25zQ2hhbmdlZCk9XCJlbWl0VGlja3NXaWR0aCgkZXZlbnQpXCJcbiAgICAgIC8+XG5cbiAgICAgIDxzdmc6Z1xuICAgICAgICBuZ3gtY2hhcnRzLWF4aXMtbGFiZWxcbiAgICAgICAgKm5nSWY9XCJzaG93TGFiZWxcIlxuICAgICAgICBbbGFiZWxdPVwibGFiZWxUZXh0XCJcbiAgICAgICAgW29mZnNldF09XCJsYWJlbE9mZnNldFwiXG4gICAgICAgIFtvcmllbnRdPVwieU9yaWVudFwiXG4gICAgICAgIFtoZWlnaHRdPVwiZGltcy5oZWlnaHRcIlxuICAgICAgICBbd2lkdGhdPVwiZGltcy53aWR0aFwiXG4gICAgICA+PC9zdmc6Zz5cbiAgICA8L3N2ZzpnPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBZQXhpc0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIHlTY2FsZTtcbiAgQElucHV0KCkgZGltczogVmlld0RpbWVuc2lvbnM7XG4gIEBJbnB1dCgpIHRyaW1UaWNrczogYm9vbGVhbjtcbiAgQElucHV0KCkgbWF4VGlja0xlbmd0aDogbnVtYmVyO1xuICBASW5wdXQoKSB0aWNrRm9ybWF0dGluZztcbiAgQElucHV0KCkgdGlja3M6IGFueVtdO1xuICBASW5wdXQoKSBzaG93R3JpZExpbmVzOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHNob3dMYWJlbDogYm9vbGVhbjtcbiAgQElucHV0KCkgbGFiZWxUZXh0OiBzdHJpbmc7XG4gIEBJbnB1dCgpIHlBeGlzVGlja0NvdW50OiBhbnk7XG4gIEBJbnB1dCgpIHlPcmllbnQ6IE9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uTGVmdDtcbiAgQElucHV0KCkgcmVmZXJlbmNlTGluZXM7XG4gIEBJbnB1dCgpIHNob3dSZWZMaW5lczogYm9vbGVhbjtcbiAgQElucHV0KCkgc2hvd1JlZkxhYmVsczogYm9vbGVhbjtcbiAgQElucHV0KCkgeUF4aXNPZmZzZXQ6IG51bWJlciA9IDA7XG4gIEBPdXRwdXQoKSBkaW1lbnNpb25zQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICB5QXhpc0NsYXNzTmFtZTogc3RyaW5nID0gJ3kgYXhpcyc7XG4gIHRpY2tBcmd1bWVudHM6IG51bWJlcltdO1xuICBvZmZzZXQ6IG51bWJlcjtcbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gIGxhYmVsT2Zmc2V0OiBudW1iZXIgPSAxNTtcbiAgZmlsbDogc3RyaW5nID0gJ25vbmUnO1xuICBzdHJva2U6IHN0cmluZyA9ICcjQ0NDJztcbiAgdGlja1N0cm9rZTogc3RyaW5nID0gJyNDQ0MnO1xuICBzdHJva2VXaWR0aDogbnVtYmVyID0gMTtcbiAgcGFkZGluZzogbnVtYmVyID0gNTtcblxuICBAVmlld0NoaWxkKFlBeGlzVGlja3NDb21wb25lbnQpIHRpY2tzQ29tcG9uZW50OiBZQXhpc1RpY2tzQ29tcG9uZW50O1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMub2Zmc2V0ID0gLSh0aGlzLnlBeGlzT2Zmc2V0ICsgdGhpcy5wYWRkaW5nKTtcbiAgICBpZiAodGhpcy55T3JpZW50ID09PSBPcmllbnRhdGlvbi5SaWdodCkge1xuICAgICAgdGhpcy5sYWJlbE9mZnNldCA9IDY1O1xuICAgICAgdGhpcy50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGhpcy5vZmZzZXQgKyB0aGlzLmRpbXMud2lkdGh9ICwgMClgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICAgICAgdGhpcy50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGhpcy5vZmZzZXR9ICwgMClgO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnlBeGlzVGlja0NvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudGlja0FyZ3VtZW50cyA9IFt0aGlzLnlBeGlzVGlja0NvdW50XTtcbiAgICB9XG4gIH1cblxuICBlbWl0VGlja3NXaWR0aCh7IHdpZHRoIH0pOiB2b2lkIHtcbiAgICBpZiAod2lkdGggIT09IHRoaXMubGFiZWxPZmZzZXQgJiYgdGhpcy55T3JpZW50ID09PSBPcmllbnRhdGlvbi5SaWdodCkge1xuICAgICAgdGhpcy5sYWJlbE9mZnNldCA9IHdpZHRoICsgdGhpcy5sYWJlbE9mZnNldDtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnNDaGFuZ2VkLmVtaXQoeyB3aWR0aCB9KTtcbiAgICAgIH0sIDApO1xuICAgIH0gZWxzZSBpZiAod2lkdGggIT09IHRoaXMubGFiZWxPZmZzZXQpIHtcbiAgICAgIHRoaXMubGFiZWxPZmZzZXQgPSB3aWR0aDtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnNDaGFuZ2VkLmVtaXQoeyB3aWR0aCB9KTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxufVxuIl19