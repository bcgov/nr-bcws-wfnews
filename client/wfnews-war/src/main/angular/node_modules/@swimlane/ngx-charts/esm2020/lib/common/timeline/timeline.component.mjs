import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { brushX } from 'd3-brush';
import { scaleLinear, scaleTime, scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { id } from '../../utils/id';
import { ScaleType } from '../types/scale-type.enum';
import * as i0 from "@angular/core";
export class Timeline {
    constructor(element, cd) {
        this.cd = cd;
        this.height = 50;
        this.select = new EventEmitter();
        this.onDomainChange = new EventEmitter();
        this.initialized = false;
        this.element = element.nativeElement;
    }
    ngOnChanges(changes) {
        this.update();
        if (!this.initialized) {
            this.addBrush();
            this.initialized = true;
        }
    }
    update() {
        this.dims = this.getDims();
        this.height = this.dims.height;
        const offsetY = this.view[1] - this.height;
        this.xDomain = this.getXDomain();
        this.xScale = this.getXScale();
        if (this.brush) {
            this.updateBrush();
        }
        this.transform = `translate(0 , ${offsetY})`;
        this.filterId = 'filter' + id().toString();
        this.filter = `url(#${this.filterId})`;
        this.cd.markForCheck();
    }
    getXDomain() {
        let values = [];
        for (const results of this.results) {
            for (const d of results.series) {
                if (!values.includes(d.name)) {
                    values.push(d.name);
                }
            }
        }
        let domain = [];
        if (this.scaleType === ScaleType.Time) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            domain = [min, max];
        }
        else if (this.scaleType === ScaleType.Linear) {
            values = values.map(v => Number(v));
            const min = Math.min(...values);
            const max = Math.max(...values);
            domain = [min, max];
        }
        else {
            domain = values;
        }
        return domain;
    }
    getXScale() {
        let scale;
        if (this.scaleType === ScaleType.Time) {
            scale = scaleTime().range([0, this.dims.width]).domain(this.xDomain);
        }
        else if (this.scaleType === ScaleType.Linear) {
            scale = scaleLinear().range([0, this.dims.width]).domain(this.xDomain);
        }
        else if (this.scaleType === ScaleType.Ordinal) {
            scale = scalePoint().range([0, this.dims.width]).padding(0.1).domain(this.xDomain);
        }
        return scale;
    }
    addBrush() {
        if (this.brush)
            return;
        const height = this.height;
        const width = this.view[0];
        this.brush = brushX()
            .extent([
            [0, 0],
            [width, height]
        ])
            .on('brush end', ({ selection }) => {
            const newSelection = selection || this.xScale.range();
            const newDomain = newSelection.map(this.xScale.invert);
            this.onDomainChange.emit(newDomain);
            this.cd.markForCheck();
        });
        select(this.element).select('.brush').call(this.brush);
    }
    updateBrush() {
        if (!this.brush)
            return;
        const height = this.height;
        const width = this.view[0];
        this.brush.extent([
            [0, 0],
            [width, height]
        ]);
        select(this.element).select('.brush').call(this.brush);
        // clear hardcoded properties so they can be defined by CSS
        select(this.element)
            .select('.selection')
            .attr('fill', undefined)
            .attr('stroke', undefined)
            .attr('fill-opacity', undefined);
        this.cd.markForCheck();
    }
    getDims() {
        const width = this.view[0];
        const dims = {
            width,
            height: this.height
        };
        return dims;
    }
}
Timeline.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: Timeline, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
Timeline.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: Timeline, selector: "g[ngx-charts-timeline]", inputs: { view: "view", results: "results", scheme: "scheme", customColors: "customColors", legend: "legend", autoScale: "autoScale", scaleType: "scaleType", height: "height" }, outputs: { select: "select", onDomainChange: "onDomainChange" }, usesOnChanges: true, ngImport: i0, template: `
    <svg:g class="timeline" [attr.transform]="transform">
      <svg:filter [attr.id]="filterId">
        <svg:feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
        />
      </svg:filter>
      <svg:g class="embedded-chart">
        <ng-content></ng-content>
      </svg:g>
      <svg:rect x="0" [attr.width]="view[0]" y="0" [attr.height]="height" class="brush-background" />
      <svg:g class="brush"></svg:g>
    </svg:g>
  `, isInline: true, styles: [".timeline .brush-background{fill:#0000000d}.timeline .brush .selection{fill:#0000001a;stroke-width:1px;stroke:#888}.timeline .brush .handle{fill-opacity:0}.timeline .embedded-chart{opacity:.6}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: Timeline, decorators: [{
            type: Component,
            args: [{ selector: 'g[ngx-charts-timeline]', template: `
    <svg:g class="timeline" [attr.transform]="transform">
      <svg:filter [attr.id]="filterId">
        <svg:feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
        />
      </svg:filter>
      <svg:g class="embedded-chart">
        <ng-content></ng-content>
      </svg:g>
      <svg:rect x="0" [attr.width]="view[0]" y="0" [attr.height]="height" class="brush-background" />
      <svg:g class="brush"></svg:g>
    </svg:g>
  `, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, styles: [".timeline .brush-background{fill:#0000000d}.timeline .brush .selection{fill:#0000001a;stroke-width:1px;stroke:#888}.timeline .brush .handle{fill-opacity:0}.timeline .embedded-chart{opacity:.6}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { view: [{
                type: Input
            }], results: [{
                type: Input
            }], scheme: [{
                type: Input
            }], customColors: [{
                type: Input
            }], legend: [{
                type: Input
            }], autoScale: [{
                type: Input
            }], scaleType: [{
                type: Input
            }], height: [{
                type: Input
            }], select: [{
                type: Output
            }], onDomainChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvc3dpbWxhbmUvbmd4LWNoYXJ0cy9zcmMvbGliL2NvbW1vbi90aW1lbGluZS90aW1lbGluZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWix1QkFBdUIsRUFHdkIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzlELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7QUF5QnJELE1BQU0sT0FBTyxRQUFRO0lBdUJuQixZQUFZLE9BQW1CLEVBQVUsRUFBcUI7UUFBckIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFmckQsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUVuQixXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM1QixtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFROUMsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFLM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUzQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUUvQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDcEI7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFpQixPQUFPLEdBQUcsQ0FBQztRQUU3QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsR0FBRyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO1FBRXZDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFaEIsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2xDLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDckI7YUFDRjtTQUNGO1FBRUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDaEMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO2FBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDOUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNyQjthQUFNO1lBQ0wsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUNqQjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTO1FBQ1AsSUFBSSxLQUFLLENBQUM7UUFFVixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRTtZQUNyQyxLQUFLLEdBQUcsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3RFO2FBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDOUMsS0FBSyxHQUFHLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN4RTthQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQy9DLEtBQUssR0FBRyxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRTthQUNsQixNQUFNLENBQUM7WUFDTixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDTixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7U0FDaEIsQ0FBQzthQUNELEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7WUFDakMsTUFBTSxZQUFZLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdEQsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFTCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUV4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDaEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ04sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO1NBQ2hCLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdkQsMkRBQTJEO1FBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ2pCLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDcEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7YUFDdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7YUFDekIsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxPQUFPO1FBQ0wsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQixNQUFNLElBQUksR0FBRztZQUNYLEtBQUs7WUFDTCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07U0FDcEIsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7cUdBdkpVLFFBQVE7eUZBQVIsUUFBUSxzVUFwQlQ7Ozs7Ozs7Ozs7Ozs7OztHQWVUOzJGQUtVLFFBQVE7a0JBdEJwQixTQUFTOytCQUNFLHdCQUF3QixZQUN4Qjs7Ozs7Ozs7Ozs7Ozs7O0dBZVQsaUJBRWMsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTTtpSUFHdEMsSUFBSTtzQkFBWixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFFSSxNQUFNO3NCQUFmLE1BQU07Z0JBQ0csY0FBYztzQkFBdkIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBFbGVtZW50UmVmLFxuICBPbkNoYW5nZXMsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBicnVzaFggfSBmcm9tICdkMy1icnVzaCc7XG5pbXBvcnQgeyBzY2FsZUxpbmVhciwgc2NhbGVUaW1lLCBzY2FsZVBvaW50IH0gZnJvbSAnZDMtc2NhbGUnO1xuaW1wb3J0IHsgc2VsZWN0IH0gZnJvbSAnZDMtc2VsZWN0aW9uJztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vLi4vdXRpbHMvaWQnO1xuaW1wb3J0IHsgU2NhbGVUeXBlIH0gZnJvbSAnLi4vdHlwZXMvc2NhbGUtdHlwZS5lbnVtJztcbmltcG9ydCB7IFZpZXdEaW1lbnNpb25zIH0gZnJvbSAnLi4vdHlwZXMvdmlldy1kaW1lbnNpb24uaW50ZXJmYWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLXRpbWVsaW5lXScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHN2ZzpnIGNsYXNzPVwidGltZWxpbmVcIiBbYXR0ci50cmFuc2Zvcm1dPVwidHJhbnNmb3JtXCI+XG4gICAgICA8c3ZnOmZpbHRlciBbYXR0ci5pZF09XCJmaWx0ZXJJZFwiPlxuICAgICAgICA8c3ZnOmZlQ29sb3JNYXRyaXhcbiAgICAgICAgICBpbj1cIlNvdXJjZUdyYXBoaWNcIlxuICAgICAgICAgIHR5cGU9XCJtYXRyaXhcIlxuICAgICAgICAgIHZhbHVlcz1cIjAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAgMCAwIDEgMFwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2ZzpmaWx0ZXI+XG4gICAgICA8c3ZnOmcgY2xhc3M9XCJlbWJlZGRlZC1jaGFydFwiPlxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICA8L3N2ZzpnPlxuICAgICAgPHN2ZzpyZWN0IHg9XCIwXCIgW2F0dHIud2lkdGhdPVwidmlld1swXVwiIHk9XCIwXCIgW2F0dHIuaGVpZ2h0XT1cImhlaWdodFwiIGNsYXNzPVwiYnJ1c2gtYmFja2dyb3VuZFwiIC8+XG4gICAgICA8c3ZnOmcgY2xhc3M9XCJicnVzaFwiPjwvc3ZnOmc+XG4gICAgPC9zdmc6Zz5cbiAgYCxcbiAgc3R5bGVVcmxzOiBbJy4vdGltZWxpbmUuY29tcG9uZW50LnNjc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgVGltZWxpbmUgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSB2aWV3OiBbbnVtYmVyLCBudW1iZXJdO1xuICBASW5wdXQoKSByZXN1bHRzOyAvLyB0eXBlIHRoaXNcbiAgQElucHV0KCkgc2NoZW1lOyAvLyB0eXBlIHRoaXNcbiAgQElucHV0KCkgY3VzdG9tQ29sb3JzOyAvLyB0eXBlIHRoaXNcbiAgQElucHV0KCkgbGVnZW5kOiBib29sZWFuO1xuICBASW5wdXQoKSBhdXRvU2NhbGU6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNjYWxlVHlwZTogU2NhbGVUeXBlO1xuICBASW5wdXQoKSBoZWlnaHQ6IG51bWJlciA9IDUwO1xuXG4gIEBPdXRwdXQoKSBzZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkRvbWFpbkNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgZGltczogVmlld0RpbWVuc2lvbnM7XG4gIHhEb21haW46IGFueVtdO1xuICB4U2NhbGU6IGFueTtcbiAgYnJ1c2g6IGFueTtcbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gIGluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG4gIGZpbHRlcklkOiBzdHJpbmc7XG4gIGZpbHRlcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEVsZW1lbnRSZWYsIHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuYWRkQnJ1c2goKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpbXMgPSB0aGlzLmdldERpbXMoKTtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuZGltcy5oZWlnaHQ7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IHRoaXMudmlld1sxXSAtIHRoaXMuaGVpZ2h0O1xuXG4gICAgdGhpcy54RG9tYWluID0gdGhpcy5nZXRYRG9tYWluKCk7XG4gICAgdGhpcy54U2NhbGUgPSB0aGlzLmdldFhTY2FsZSgpO1xuXG4gICAgaWYgKHRoaXMuYnJ1c2gpIHtcbiAgICAgIHRoaXMudXBkYXRlQnJ1c2goKTtcbiAgICB9XG5cbiAgICB0aGlzLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoMCAsICR7b2Zmc2V0WX0pYDtcblxuICAgIHRoaXMuZmlsdGVySWQgPSAnZmlsdGVyJyArIGlkKCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLmZpbHRlciA9IGB1cmwoIyR7dGhpcy5maWx0ZXJJZH0pYDtcblxuICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICBnZXRYRG9tYWluKCk6IGFueVtdIHtcbiAgICBsZXQgdmFsdWVzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHJlc3VsdHMgb2YgdGhpcy5yZXN1bHRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgcmVzdWx0cy5zZXJpZXMpIHtcbiAgICAgICAgaWYgKCF2YWx1ZXMuaW5jbHVkZXMoZC5uYW1lKSkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKGQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZG9tYWluID0gW107XG4gICAgaWYgKHRoaXMuc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuVGltZSkge1xuICAgICAgY29uc3QgbWluID0gTWF0aC5taW4oLi4udmFsdWVzKTtcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcyk7XG4gICAgICBkb21haW4gPSBbbWluLCBtYXhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5MaW5lYXIpIHtcbiAgICAgIHZhbHVlcyA9IHZhbHVlcy5tYXAodiA9PiBOdW1iZXIodikpO1xuICAgICAgY29uc3QgbWluID0gTWF0aC5taW4oLi4udmFsdWVzKTtcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcyk7XG4gICAgICBkb21haW4gPSBbbWluLCBtYXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb21haW4gPSB2YWx1ZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbWFpbjtcbiAgfVxuXG4gIGdldFhTY2FsZSgpIHtcbiAgICBsZXQgc2NhbGU7XG5cbiAgICBpZiAodGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5UaW1lKSB7XG4gICAgICBzY2FsZSA9IHNjYWxlVGltZSgpLnJhbmdlKFswLCB0aGlzLmRpbXMud2lkdGhdKS5kb21haW4odGhpcy54RG9tYWluKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2NhbGVUeXBlID09PSBTY2FsZVR5cGUuTGluZWFyKSB7XG4gICAgICBzY2FsZSA9IHNjYWxlTGluZWFyKCkucmFuZ2UoWzAsIHRoaXMuZGltcy53aWR0aF0pLmRvbWFpbih0aGlzLnhEb21haW4pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY2FsZVR5cGUgPT09IFNjYWxlVHlwZS5PcmRpbmFsKSB7XG4gICAgICBzY2FsZSA9IHNjYWxlUG9pbnQoKS5yYW5nZShbMCwgdGhpcy5kaW1zLndpZHRoXSkucGFkZGluZygwLjEpLmRvbWFpbih0aGlzLnhEb21haW4pO1xuICAgIH1cblxuICAgIHJldHVybiBzY2FsZTtcbiAgfVxuXG4gIGFkZEJydXNoKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmJydXNoKSByZXR1cm47XG5cbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMudmlld1swXTtcblxuICAgIHRoaXMuYnJ1c2ggPSBicnVzaFgoKVxuICAgICAgLmV4dGVudChbXG4gICAgICAgIFswLCAwXSxcbiAgICAgICAgW3dpZHRoLCBoZWlnaHRdXG4gICAgICBdKVxuICAgICAgLm9uKCdicnVzaCBlbmQnLCAoeyBzZWxlY3Rpb24gfSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTZWxlY3Rpb24gPSBzZWxlY3Rpb24gfHwgdGhpcy54U2NhbGUucmFuZ2UoKTtcbiAgICAgICAgY29uc3QgbmV3RG9tYWluID0gbmV3U2VsZWN0aW9uLm1hcCh0aGlzLnhTY2FsZS5pbnZlcnQpO1xuXG4gICAgICAgIHRoaXMub25Eb21haW5DaGFuZ2UuZW1pdChuZXdEb21haW4pO1xuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG5cbiAgICBzZWxlY3QodGhpcy5lbGVtZW50KS5zZWxlY3QoJy5icnVzaCcpLmNhbGwodGhpcy5icnVzaCk7XG4gIH1cblxuICB1cGRhdGVCcnVzaCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYnJ1c2gpIHJldHVybjtcblxuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy52aWV3WzBdO1xuXG4gICAgdGhpcy5icnVzaC5leHRlbnQoW1xuICAgICAgWzAsIDBdLFxuICAgICAgW3dpZHRoLCBoZWlnaHRdXG4gICAgXSk7XG4gICAgc2VsZWN0KHRoaXMuZWxlbWVudCkuc2VsZWN0KCcuYnJ1c2gnKS5jYWxsKHRoaXMuYnJ1c2gpO1xuXG4gICAgLy8gY2xlYXIgaGFyZGNvZGVkIHByb3BlcnRpZXMgc28gdGhleSBjYW4gYmUgZGVmaW5lZCBieSBDU1NcbiAgICBzZWxlY3QodGhpcy5lbGVtZW50KVxuICAgICAgLnNlbGVjdCgnLnNlbGVjdGlvbicpXG4gICAgICAuYXR0cignZmlsbCcsIHVuZGVmaW5lZClcbiAgICAgIC5hdHRyKCdzdHJva2UnLCB1bmRlZmluZWQpXG4gICAgICAuYXR0cignZmlsbC1vcGFjaXR5JywgdW5kZWZpbmVkKTtcblxuICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICBnZXREaW1zKCk6IFZpZXdEaW1lbnNpb25zIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMudmlld1swXTtcblxuICAgIGNvbnN0IGRpbXMgPSB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHRcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRpbXM7XG4gIH1cbn1cbiJdfQ==