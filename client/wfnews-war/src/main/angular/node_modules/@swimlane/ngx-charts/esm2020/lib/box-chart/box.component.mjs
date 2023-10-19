import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { easeSinInOut } from 'd3-ease';
import cloneDeep from 'clone-deep';
import { roundedRect } from '../common/shape.helper';
import { id } from '../utils/id';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import * as i0 from "@angular/core";
import * as i1 from "../common/svg-linear-gradient.component";
import * as i2 from "@angular/common";
export class BoxComponent {
    constructor(element, cd) {
        this.cd = cd;
        this.roundEdges = true;
        this.gradient = false;
        this.offset = 0;
        this.isActive = false;
        this.animations = true;
        this.noBarWhenZero = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.BarOrientation = BarOrientation;
        this.initialized = false;
        this.hasGradient = false;
        this.hideBar = false;
        this.nativeElm = element.nativeElement;
    }
    ngOnChanges(changes) {
        if (!this.initialized) {
            this.loadAnimation();
            this.initialized = true;
        }
        else {
            this.update();
        }
    }
    update() {
        this.boxStrokeWidth = Math.max(this.strokeWidth, 1);
        this.whiskerStrokeWidth = Math.max(this.strokeWidth / 2, 1);
        this.medianLineWidth = 1.5 * this.strokeWidth;
        this.gradientId = 'grad' + id().toString();
        this.gradientFill = `url(#${this.gradientId})`;
        if (this.gradient) {
            this.gradientStops = this.getGradient();
            this.hasGradient = true;
        }
        else {
            this.hasGradient = false;
        }
        this.updateLineEl();
        this.updatePathEl();
        this.checkToHideBar();
        this.maskLineId = 'mask' + id().toString();
        this.maskLine = `url(#${this.maskLineId})`;
        if (this.cd) {
            this.cd.markForCheck();
        }
    }
    loadAnimation() {
        this.boxPath = this.oldPath = this.getStartingPath();
        this.oldLineCoordinates = this.getStartingLineCoordinates();
        setTimeout(this.update.bind(this), 100);
    }
    updatePathEl() {
        const nodeBar = select(this.nativeElm).selectAll('.bar');
        const path = this.getPath();
        if (this.animations) {
            nodeBar
                .attr('d', this.oldPath)
                .transition()
                .ease(easeSinInOut)
                .duration(500)
                .attrTween('d', this.pathTween(path, 4));
        }
        else {
            nodeBar.attr('d', path);
        }
        this.oldPath = path;
    }
    updateLineEl() {
        const lineEl = select(this.nativeElm).selectAll('.bar-line');
        const lineCoordinates = this.lineCoordinates;
        const oldLineCoordinates = this.oldLineCoordinates;
        if (this.animations) {
            lineEl
                .attr('x1', (_, index) => oldLineCoordinates[index].v1.x)
                .attr('y1', (_, index) => oldLineCoordinates[index].v1.y)
                .attr('x2', (_, index) => oldLineCoordinates[index].v2.x)
                .attr('y2', (_, index) => oldLineCoordinates[index].v2.y)
                .transition()
                .ease(easeSinInOut)
                .duration(500)
                .attr('x1', (_, index) => lineCoordinates[index].v1.x)
                .attr('y1', (_, index) => lineCoordinates[index].v1.y)
                .attr('x2', (_, index) => lineCoordinates[index].v2.x)
                .attr('y2', (_, index) => lineCoordinates[index].v2.y);
        }
        else {
            lineEl
                .attr('x1', (_, index) => lineCoordinates[index].v1.x)
                .attr('y1', (_, index) => lineCoordinates[index].v1.y)
                .attr('x2', (_, index) => lineCoordinates[index].v2.x)
                .attr('y2', (_, index) => lineCoordinates[index].v2.y);
        }
        this.oldLineCoordinates = [...lineCoordinates];
    }
    /**
     * See [D3 Selections](https://www.d3indepth.com/selections/)
     * @param d The joined data.
     * @param index The index of the element within the selection
     * @param node The node element (Line).
     */
    lineTween(attr, d, index, node) {
        const nodeLineEl = node[index];
        return nodeLineEl[attr].baseVal.value;
    }
    // TODO: Refactor into another .ts file if https://github.com/swimlane/ngx-charts/pull/1179 gets merged.
    pathTween(d1, precision) {
        return function () {
            // tslint:disable-next-line: no-this-assignment
            const path0 = this;
            const path1 = this.cloneNode();
            path1.setAttribute('d', d1);
            const n0 = path0?.getTotalLength();
            const n1 = path1?.getTotalLength();
            // Uniform sampling of distance based on specified precision.
            const distances = [0];
            let i = 0;
            const dt = precision / Math.max(n0, n1);
            while (i < 1) {
                distances.push(i);
                i += dt;
            }
            distances.push(1);
            // Compute point-interpolators at each distance.
            const points = distances.map((t) => {
                const p0 = path0.getPointAtLength(t * n0);
                const p1 = path1.getPointAtLength(t * n1);
                return interpolate([p0.x, p0.y], [p1.x, p1.y]);
            });
            // 't': T is the fraction of time (between 0 and 1) since the transition began.
            return (t) => {
                return t < 1 ? 'M' + points.map((p) => p(t)).join('L') : d1;
            };
        };
    }
    getStartingPath() {
        if (!this.animations) {
            return this.getPath();
        }
        const radius = this.roundEdges ? 1 : 0;
        const { x, y } = this.lineCoordinates[2].v1;
        return roundedRect(x - this.width, y - 1, this.width, 2, radius, this.edges);
    }
    getPath() {
        const radius = this.getRadius();
        let path = '';
        path = roundedRect(this.x, this.y, this.width, this.height, Math.min(this.height, radius), this.edges);
        return path;
    }
    getStartingLineCoordinates() {
        if (!this.animations) {
            return [...this.lineCoordinates];
        }
        const lineCoordinates = cloneDeep(this.lineCoordinates);
        lineCoordinates[1].v1.y = lineCoordinates[1].v2.y = lineCoordinates[3].v1.y = lineCoordinates[3].v2.y = lineCoordinates[0].v1.y = lineCoordinates[0].v2.y =
            lineCoordinates[2].v1.y;
        return lineCoordinates;
    }
    getRadius() {
        let radius = 0;
        if (this.roundEdges && this.height > 5 && this.width > 5) {
            radius = Math.floor(Math.min(5, this.height / 2, this.width / 2));
        }
        return radius;
    }
    getGradient() {
        return [
            {
                offset: 0,
                color: this.fill,
                opacity: this.getStartOpacity()
            },
            {
                offset: 100,
                color: this.fill,
                opacity: 1
            }
        ];
    }
    getStartOpacity() {
        if (this.roundEdges) {
            return 0.2;
        }
        else {
            return 0.5;
        }
    }
    get edges() {
        let edges = [false, false, false, false];
        if (this.roundEdges) {
            edges = [true, true, true, true];
        }
        return edges;
    }
    onMouseEnter() {
        this.activate.emit(this.data);
    }
    onMouseLeave() {
        this.deactivate.emit(this.data);
    }
    checkToHideBar() {
        this.hideBar = this.noBarWhenZero && this.height === 0;
    }
}
BoxComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BoxComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
BoxComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: BoxComponent, selector: "g[ngx-charts-box]", inputs: { strokeColor: "strokeColor", strokeWidth: "strokeWidth", fill: "fill", data: "data", width: "width", height: "height", x: "x", y: "y", lineCoordinates: "lineCoordinates", roundEdges: "roundEdges", gradient: "gradient", gradientStops: "gradientStops", offset: "offset", isActive: "isActive", animations: "animations", ariaLabel: "ariaLabel", noBarWhenZero: "noBarWhenZero" }, outputs: { select: "select", activate: "activate", deactivate: "deactivate" }, host: { listeners: { "mouseenter": "onMouseEnter()", "mouseleave": "onMouseLeave()" } }, usesOnChanges: true, ngImport: i0, template: `
    <svg:defs>
      <svg:g
        *ngIf="hasGradient"
        ngx-charts-svg-linear-gradient
        [orientation]="BarOrientation.Vertical"
        [name]="gradientId"
        [stops]="gradientStops"
      />
      <svg:mask [attr.id]="maskLineId">
        <svg:g>
          <rect height="100%" width="100%" fill="white" fill-opacity="1" />
          <path class="bar" [attr.d]="boxPath" fill="black" fill-opacity="1" />
        </svg:g>
      </svg:mask>
    </svg:defs>
    <svg:g>
      <svg:path
        class="bar"
        role="img"
        tabIndex="-1"
        [class.active]="isActive"
        [class.hidden]="hideBar"
        [attr.d]="boxPath"
        [attr.stroke]="strokeColor"
        [attr.stroke-width]="boxStrokeWidth"
        [attr.aria-label]="ariaLabel"
        [attr.fill]="hasGradient ? gradientFill : fill"
        (click)="select.emit(data)"
      />
      <svg:line
        *ngFor="let line of lineCoordinates; let i = index"
        class="bar-line"
        [class.hidden]="hideBar"
        [attr.x1]="line.v1.x"
        [attr.y1]="line.v1.y"
        [attr.x2]="line.v2.x"
        [attr.y2]="line.v2.y"
        [attr.stroke]="strokeColor"
        [attr.stroke-width]="i === 2 ? medianLineWidth : whiskerStrokeWidth"
        [attr.mask]="i ? undefined : maskLine"
        fill="none"
      />
    </svg:g>
  `, isInline: true, components: [{ type: i1.SvgLinearGradientComponent, selector: "g[ngx-charts-svg-linear-gradient]", inputs: ["orientation", "name", "stops"] }], directives: [{ type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: BoxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'g[ngx-charts-box]',
                    template: `
    <svg:defs>
      <svg:g
        *ngIf="hasGradient"
        ngx-charts-svg-linear-gradient
        [orientation]="BarOrientation.Vertical"
        [name]="gradientId"
        [stops]="gradientStops"
      />
      <svg:mask [attr.id]="maskLineId">
        <svg:g>
          <rect height="100%" width="100%" fill="white" fill-opacity="1" />
          <path class="bar" [attr.d]="boxPath" fill="black" fill-opacity="1" />
        </svg:g>
      </svg:mask>
    </svg:defs>
    <svg:g>
      <svg:path
        class="bar"
        role="img"
        tabIndex="-1"
        [class.active]="isActive"
        [class.hidden]="hideBar"
        [attr.d]="boxPath"
        [attr.stroke]="strokeColor"
        [attr.stroke-width]="boxStrokeWidth"
        [attr.aria-label]="ariaLabel"
        [attr.fill]="hasGradient ? gradientFill : fill"
        (click)="select.emit(data)"
      />
      <svg:line
        *ngFor="let line of lineCoordinates; let i = index"
        class="bar-line"
        [class.hidden]="hideBar"
        [attr.x1]="line.v1.x"
        [attr.y1]="line.v1.y"
        [attr.x2]="line.v2.x"
        [attr.y2]="line.v2.y"
        [attr.stroke]="strokeColor"
        [attr.stroke-width]="i === 2 ? medianLineWidth : whiskerStrokeWidth"
        [attr.mask]="i ? undefined : maskLine"
        fill="none"
      />
    </svg:g>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { strokeColor: [{
                type: Input
            }], strokeWidth: [{
                type: Input
            }], fill: [{
                type: Input
            }], data: [{
                type: Input
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], x: [{
                type: Input
            }], y: [{
                type: Input
            }], lineCoordinates: [{
                type: Input
            }], roundEdges: [{
                type: Input
            }], gradient: [{
                type: Input
            }], gradientStops: [{
                type: Input
            }], offset: [{
                type: Input
            }], isActive: [{
                type: Input
            }], animations: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], noBarWhenZero: [{
                type: Input
            }], select: [{
                type: Output
            }], activate: [{
                type: Output
            }], deactivate: [{
                type: Output
            }], onMouseEnter: [{
                type: HostListener,
                args: ['mouseenter']
            }], onMouseLeave: [{
                type: HostListener,
                args: ['mouseleave']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm94LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9ib3gtY2hhcnQvYm94LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFlBQVksRUFJWix1QkFBdUIsRUFFeEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBWSxNQUFNLGNBQWMsQ0FBQztBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUV2QyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFFbkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHakMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHNDQUFzQyxDQUFDOzs7O0FBc0R0RSxNQUFNLE9BQU8sWUFBWTtJQWdEdkIsWUFBWSxPQUFtQixFQUFZLEVBQXFCO1FBQXJCLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBdEN2RCxlQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFFM0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFFN0IsV0FBTSxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3JELGFBQVEsR0FBNEIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxlQUFVLEdBQTRCLElBQUksWUFBWSxFQUFFLENBQUM7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Q0FBQyxDQUFDO2lCQUNyRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3JELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDckQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7YUFBTTtZQUNMLE1BQU07aUJBQ0gsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNyRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3JELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDckQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQVMsQ0FBQyxJQUFZLEVBQUUsQ0FB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TyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDekQsQ0FBQzs7eUdBMVFVLFlBQVk7NkZBQVosWUFBWSxzbkJBL0NiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRDVDsyRkFHVSxZQUFZO2tCQWpEeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENUO29CQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2lCQUNoRDtpSUFFVSxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLENBQUM7c0JBQVQsS0FBSztnQkFDRyxDQUFDO3NCQUFULEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFFSSxNQUFNO3NCQUFmLE1BQU07Z0JBQ0csUUFBUTtzQkFBakIsTUFBTTtnQkFDRyxVQUFVO3NCQUFuQixNQUFNO2dCQTBPUCxZQUFZO3NCQURYLFlBQVk7dUJBQUMsWUFBWTtnQkFNMUIsWUFBWTtzQkFEWCxZQUFZO3VCQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdExpc3RlbmVyLFxuICBFbGVtZW50UmVmLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBPbkNoYW5nZXMsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IHNlbGVjdCwgQmFzZVR5cGUgfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IHsgaW50ZXJwb2xhdGUgfSBmcm9tICdkMy1pbnRlcnBvbGF0ZSc7XG5pbXBvcnQgeyBlYXNlU2luSW5PdXQgfSBmcm9tICdkMy1lYXNlJztcblxuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdjbG9uZS1kZWVwJztcblxuaW1wb3J0IHsgcm91bmRlZFJlY3QgfSBmcm9tICcuLi9jb21tb24vc2hhcGUuaGVscGVyJztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMvaWQnO1xuaW1wb3J0IHsgSUJveE1vZGVsIH0gZnJvbSAnLi4vbW9kZWxzL2NoYXJ0LWRhdGEubW9kZWwnO1xuaW1wb3J0IHsgSVZlY3RvcjJEIH0gZnJvbSAnLi4vbW9kZWxzL2Nvb3JkaW5hdGVzLm1vZGVsJztcbmltcG9ydCB7IEJhck9yaWVudGF0aW9uIH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2Jhci1vcmllbnRhdGlvbi5lbnVtJztcbmltcG9ydCB7IEdyYWRpZW50IH0gZnJvbSAnLi4vY29tbW9uL3R5cGVzL2dyYWRpZW50LmludGVyZmFjZSc7XG5cbnR5cGUgTGluZUNvb3JkaW5hdGVzID0gW0lWZWN0b3IyRCwgSVZlY3RvcjJELCBJVmVjdG9yMkQsIElWZWN0b3IyRF07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dbbmd4LWNoYXJ0cy1ib3hdJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c3ZnOmRlZnM+XG4gICAgICA8c3ZnOmdcbiAgICAgICAgKm5nSWY9XCJoYXNHcmFkaWVudFwiXG4gICAgICAgIG5neC1jaGFydHMtc3ZnLWxpbmVhci1ncmFkaWVudFxuICAgICAgICBbb3JpZW50YXRpb25dPVwiQmFyT3JpZW50YXRpb24uVmVydGljYWxcIlxuICAgICAgICBbbmFtZV09XCJncmFkaWVudElkXCJcbiAgICAgICAgW3N0b3BzXT1cImdyYWRpZW50U3RvcHNcIlxuICAgICAgLz5cbiAgICAgIDxzdmc6bWFzayBbYXR0ci5pZF09XCJtYXNrTGluZUlkXCI+XG4gICAgICAgIDxzdmc6Zz5cbiAgICAgICAgICA8cmVjdCBoZWlnaHQ9XCIxMDAlXCIgd2lkdGg9XCIxMDAlXCIgZmlsbD1cIndoaXRlXCIgZmlsbC1vcGFjaXR5PVwiMVwiIC8+XG4gICAgICAgICAgPHBhdGggY2xhc3M9XCJiYXJcIiBbYXR0ci5kXT1cImJveFBhdGhcIiBmaWxsPVwiYmxhY2tcIiBmaWxsLW9wYWNpdHk9XCIxXCIgLz5cbiAgICAgICAgPC9zdmc6Zz5cbiAgICAgIDwvc3ZnOm1hc2s+XG4gICAgPC9zdmc6ZGVmcz5cbiAgICA8c3ZnOmc+XG4gICAgICA8c3ZnOnBhdGhcbiAgICAgICAgY2xhc3M9XCJiYXJcIlxuICAgICAgICByb2xlPVwiaW1nXCJcbiAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgIFtjbGFzcy5hY3RpdmVdPVwiaXNBY3RpdmVcIlxuICAgICAgICBbY2xhc3MuaGlkZGVuXT1cImhpZGVCYXJcIlxuICAgICAgICBbYXR0ci5kXT1cImJveFBhdGhcIlxuICAgICAgICBbYXR0ci5zdHJva2VdPVwic3Ryb2tlQ29sb3JcIlxuICAgICAgICBbYXR0ci5zdHJva2Utd2lkdGhdPVwiYm94U3Ryb2tlV2lkdGhcIlxuICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbFwiXG4gICAgICAgIFthdHRyLmZpbGxdPVwiaGFzR3JhZGllbnQgPyBncmFkaWVudEZpbGwgOiBmaWxsXCJcbiAgICAgICAgKGNsaWNrKT1cInNlbGVjdC5lbWl0KGRhdGEpXCJcbiAgICAgIC8+XG4gICAgICA8c3ZnOmxpbmVcbiAgICAgICAgKm5nRm9yPVwibGV0IGxpbmUgb2YgbGluZUNvb3JkaW5hdGVzOyBsZXQgaSA9IGluZGV4XCJcbiAgICAgICAgY2xhc3M9XCJiYXItbGluZVwiXG4gICAgICAgIFtjbGFzcy5oaWRkZW5dPVwiaGlkZUJhclwiXG4gICAgICAgIFthdHRyLngxXT1cImxpbmUudjEueFwiXG4gICAgICAgIFthdHRyLnkxXT1cImxpbmUudjEueVwiXG4gICAgICAgIFthdHRyLngyXT1cImxpbmUudjIueFwiXG4gICAgICAgIFthdHRyLnkyXT1cImxpbmUudjIueVwiXG4gICAgICAgIFthdHRyLnN0cm9rZV09XCJzdHJva2VDb2xvclwiXG4gICAgICAgIFthdHRyLnN0cm9rZS13aWR0aF09XCJpID09PSAyID8gbWVkaWFuTGluZVdpZHRoIDogd2hpc2tlclN0cm9rZVdpZHRoXCJcbiAgICAgICAgW2F0dHIubWFza109XCJpID8gdW5kZWZpbmVkIDogbWFza0xpbmVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAvPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIEJveENvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIHN0cm9rZUNvbG9yOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHN0cm9rZVdpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIGZpbGw6IHN0cmluZztcbiAgQElucHV0KCkgZGF0YTogSUJveE1vZGVsO1xuICBASW5wdXQoKSB3aWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBoZWlnaHQ6IG51bWJlcjtcbiAgQElucHV0KCkgeDogbnVtYmVyO1xuICBASW5wdXQoKSB5OiBudW1iZXI7XG4gIEBJbnB1dCgpIGxpbmVDb29yZGluYXRlczogTGluZUNvb3JkaW5hdGVzO1xuICBASW5wdXQoKSByb3VuZEVkZ2VzOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgZ3JhZGllbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZ3JhZGllbnRTdG9wczogR3JhZGllbnRbXTtcbiAgQElucHV0KCkgb2Zmc2V0OiBudW1iZXIgPSAwO1xuICBASW5wdXQoKSBpc0FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBhbmltYXRpb25zOiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgYXJpYUxhYmVsOiBzdHJpbmc7XG4gIEBJbnB1dCgpIG5vQmFyV2hlblplcm86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBPdXRwdXQoKSBzZWxlY3Q6IEV2ZW50RW1pdHRlcjxJQm94TW9kZWw+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxJQm94TW9kZWw+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZGVhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPElCb3hNb2RlbD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQmFyT3JpZW50YXRpb24gPSBCYXJPcmllbnRhdGlvbjtcblxuICBuYXRpdmVFbG06IGFueTtcblxuICAvLyBQYXRoIHJlbGF0ZWQgcHJvcGVydGllcy5cbiAgb2xkUGF0aDogc3RyaW5nO1xuICBib3hQYXRoOiBzdHJpbmc7XG4gIG9sZExpbmVDb29yZGluYXRlczogTGluZUNvb3JkaW5hdGVzO1xuXG4gIC8vIENvbG9yIHJlbGF0ZWQgcHJvcGVydGllcy5cbiAgZ3JhZGllbnRJZDogc3RyaW5nO1xuICBncmFkaWVudEZpbGw6IHN0cmluZztcbiAgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaGFzR3JhZGllbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaGlkZUJhcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBNYXNrIFBhdGggdG8gY3V0IHRoZSBsaW5lIG9uIHRoZSBib3ggcGFydC4gKi9cbiAgbWFza0xpbmU6IHN0cmluZztcbiAgLyoqIE1hc2sgUGF0aCBJZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBtYXNrIGVsZW1lbnQgKi9cbiAgbWFza0xpbmVJZDogc3RyaW5nO1xuXG4gIGJveFN0cm9rZVdpZHRoOiBudW1iZXI7XG4gIHdoaXNrZXJTdHJva2VXaWR0aDogbnVtYmVyO1xuICBtZWRpYW5MaW5lV2lkdGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBFbGVtZW50UmVmLCBwcm90ZWN0ZWQgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgdGhpcy5uYXRpdmVFbG0gPSBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLmxvYWRBbmltYXRpb24oKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmJveFN0cm9rZVdpZHRoID0gTWF0aC5tYXgodGhpcy5zdHJva2VXaWR0aCwgMSk7XG4gICAgdGhpcy53aGlza2VyU3Ryb2tlV2lkdGggPSBNYXRoLm1heCh0aGlzLnN0cm9rZVdpZHRoIC8gMiwgMSk7XG4gICAgdGhpcy5tZWRpYW5MaW5lV2lkdGggPSAxLjUgKiB0aGlzLnN0cm9rZVdpZHRoO1xuXG4gICAgdGhpcy5ncmFkaWVudElkID0gJ2dyYWQnICsgaWQoKS50b1N0cmluZygpO1xuICAgIHRoaXMuZ3JhZGllbnRGaWxsID0gYHVybCgjJHt0aGlzLmdyYWRpZW50SWR9KWA7XG5cbiAgICBpZiAodGhpcy5ncmFkaWVudCkge1xuICAgICAgdGhpcy5ncmFkaWVudFN0b3BzID0gdGhpcy5nZXRHcmFkaWVudCgpO1xuICAgICAgdGhpcy5oYXNHcmFkaWVudCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFzR3JhZGllbnQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUxpbmVFbCgpO1xuICAgIHRoaXMudXBkYXRlUGF0aEVsKCk7XG4gICAgdGhpcy5jaGVja1RvSGlkZUJhcigpO1xuICAgIHRoaXMubWFza0xpbmVJZCA9ICdtYXNrJyArIGlkKCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLm1hc2tMaW5lID0gYHVybCgjJHt0aGlzLm1hc2tMaW5lSWR9KWA7XG5cbiAgICBpZiAodGhpcy5jZCkge1xuICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBsb2FkQW5pbWF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuYm94UGF0aCA9IHRoaXMub2xkUGF0aCA9IHRoaXMuZ2V0U3RhcnRpbmdQYXRoKCk7XG4gICAgdGhpcy5vbGRMaW5lQ29vcmRpbmF0ZXMgPSB0aGlzLmdldFN0YXJ0aW5nTGluZUNvb3JkaW5hdGVzKCk7XG4gICAgc2V0VGltZW91dCh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCAxMDApO1xuICB9XG5cbiAgdXBkYXRlUGF0aEVsKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVCYXIgPSBzZWxlY3QodGhpcy5uYXRpdmVFbG0pLnNlbGVjdEFsbCgnLmJhcicpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKTtcbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICBub2RlQmFyXG4gICAgICAgIC5hdHRyKCdkJywgdGhpcy5vbGRQYXRoKVxuICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5lYXNlKGVhc2VTaW5Jbk91dClcbiAgICAgICAgLmR1cmF0aW9uKDUwMClcbiAgICAgICAgLmF0dHJUd2VlbignZCcsIHRoaXMucGF0aFR3ZWVuKHBhdGgsIDQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZUJhci5hdHRyKCdkJywgcGF0aCk7XG4gICAgfVxuICAgIHRoaXMub2xkUGF0aCA9IHBhdGg7XG4gIH1cblxuICB1cGRhdGVMaW5lRWwoKTogdm9pZCB7XG4gICAgY29uc3QgbGluZUVsID0gc2VsZWN0KHRoaXMubmF0aXZlRWxtKS5zZWxlY3RBbGwoJy5iYXItbGluZScpO1xuICAgIGNvbnN0IGxpbmVDb29yZGluYXRlcyA9IHRoaXMubGluZUNvb3JkaW5hdGVzO1xuICAgIGNvbnN0IG9sZExpbmVDb29yZGluYXRlcyA9IHRoaXMub2xkTGluZUNvb3JkaW5hdGVzO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIGxpbmVFbFxuICAgICAgICAuYXR0cigneDEnLCAoXywgaW5kZXgpID0+IG9sZExpbmVDb29yZGluYXRlc1tpbmRleF0udjEueClcbiAgICAgICAgLmF0dHIoJ3kxJywgKF8sIGluZGV4KSA9PiBvbGRMaW5lQ29vcmRpbmF0ZXNbaW5kZXhdLnYxLnkpXG4gICAgICAgIC5hdHRyKCd4MicsIChfLCBpbmRleCkgPT4gb2xkTGluZUNvb3JkaW5hdGVzW2luZGV4XS52Mi54KVxuICAgICAgICAuYXR0cigneTInLCAoXywgaW5kZXgpID0+IG9sZExpbmVDb29yZGluYXRlc1tpbmRleF0udjIueSlcbiAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAuZWFzZShlYXNlU2luSW5PdXQpXG4gICAgICAgIC5kdXJhdGlvbig1MDApXG4gICAgICAgIC5hdHRyKCd4MScsIChfLCBpbmRleCkgPT4gbGluZUNvb3JkaW5hdGVzW2luZGV4XS52MS54KVxuICAgICAgICAuYXR0cigneTEnLCAoXywgaW5kZXgpID0+IGxpbmVDb29yZGluYXRlc1tpbmRleF0udjEueSlcbiAgICAgICAgLmF0dHIoJ3gyJywgKF8sIGluZGV4KSA9PiBsaW5lQ29vcmRpbmF0ZXNbaW5kZXhdLnYyLngpXG4gICAgICAgIC5hdHRyKCd5MicsIChfLCBpbmRleCkgPT4gbGluZUNvb3JkaW5hdGVzW2luZGV4XS52Mi55KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGluZUVsXG4gICAgICAgIC5hdHRyKCd4MScsIChfLCBpbmRleCkgPT4gbGluZUNvb3JkaW5hdGVzW2luZGV4XS52MS54KVxuICAgICAgICAuYXR0cigneTEnLCAoXywgaW5kZXgpID0+IGxpbmVDb29yZGluYXRlc1tpbmRleF0udjEueSlcbiAgICAgICAgLmF0dHIoJ3gyJywgKF8sIGluZGV4KSA9PiBsaW5lQ29vcmRpbmF0ZXNbaW5kZXhdLnYyLngpXG4gICAgICAgIC5hdHRyKCd5MicsIChfLCBpbmRleCkgPT4gbGluZUNvb3JkaW5hdGVzW2luZGV4XS52Mi55KTtcbiAgICB9XG4gICAgdGhpcy5vbGRMaW5lQ29vcmRpbmF0ZXMgPSBbLi4ubGluZUNvb3JkaW5hdGVzXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgW0QzIFNlbGVjdGlvbnNdKGh0dHBzOi8vd3d3LmQzaW5kZXB0aC5jb20vc2VsZWN0aW9ucy8pXG4gICAqIEBwYXJhbSBkIFRoZSBqb2luZWQgZGF0YS5cbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCB3aXRoaW4gdGhlIHNlbGVjdGlvblxuICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSBlbGVtZW50IChMaW5lKS5cbiAgICovXG4gIGxpbmVUd2VlbihhdHRyOiBzdHJpbmcsIGQ6IGFueSwgaW5kZXg6IG51bWJlciwgbm9kZTogQmFzZVR5cGVbXSB8IEFycmF5TGlrZTxCYXNlVHlwZT4pIHtcbiAgICBjb25zdCBub2RlTGluZUVsID0gbm9kZVtpbmRleF0gYXMgU1ZHTGluZUVsZW1lbnQ7XG4gICAgcmV0dXJuIG5vZGVMaW5lRWxbYXR0cl0uYmFzZVZhbC52YWx1ZTtcbiAgfVxuXG4gIC8vIFRPRE86IFJlZmFjdG9yIGludG8gYW5vdGhlciAudHMgZmlsZSBpZiBodHRwczovL2dpdGh1Yi5jb20vc3dpbWxhbmUvbmd4LWNoYXJ0cy9wdWxsLzExNzkgZ2V0cyBtZXJnZWQuXG4gIHBhdGhUd2VlbihkMTogc3RyaW5nLCBwcmVjaXNpb246IG51bWJlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXRoaXMtYXNzaWdubWVudFxuICAgICAgY29uc3QgcGF0aDAgPSB0aGlzO1xuICAgICAgY29uc3QgcGF0aDEgPSB0aGlzLmNsb25lTm9kZSgpO1xuICAgICAgcGF0aDEuc2V0QXR0cmlidXRlKCdkJywgZDEpO1xuICAgICAgY29uc3QgbjAgPSBwYXRoMD8uZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgIGNvbnN0IG4xID0gcGF0aDE/LmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICAvLyBVbmlmb3JtIHNhbXBsaW5nIG9mIGRpc3RhbmNlIGJhc2VkIG9uIHNwZWNpZmllZCBwcmVjaXNpb24uXG4gICAgICBjb25zdCBkaXN0YW5jZXMgPSBbMF07XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBjb25zdCBkdCA9IHByZWNpc2lvbiAvIE1hdGgubWF4KG4wLCBuMSk7XG4gICAgICB3aGlsZSAoaSA8IDEpIHtcbiAgICAgICAgZGlzdGFuY2VzLnB1c2goaSk7XG4gICAgICAgIGkgKz0gZHQ7XG4gICAgICB9XG4gICAgICBkaXN0YW5jZXMucHVzaCgxKTtcblxuICAgICAgLy8gQ29tcHV0ZSBwb2ludC1pbnRlcnBvbGF0b3JzIGF0IGVhY2ggZGlzdGFuY2UuXG4gICAgICBjb25zdCBwb2ludHMgPSBkaXN0YW5jZXMubWFwKCh0OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgcDAgPSBwYXRoMC5nZXRQb2ludEF0TGVuZ3RoKHQgKiBuMCk7XG4gICAgICAgIGNvbnN0IHAxID0gcGF0aDEuZ2V0UG9pbnRBdExlbmd0aCh0ICogbjEpO1xuICAgICAgICByZXR1cm4gaW50ZXJwb2xhdGUoW3AwLngsIHAwLnldLCBbcDEueCwgcDEueV0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vICd0JzogVCBpcyB0aGUgZnJhY3Rpb24gb2YgdGltZSAoYmV0d2VlbiAwIGFuZCAxKSBzaW5jZSB0aGUgdHJhbnNpdGlvbiBiZWdhbi5cbiAgICAgIHJldHVybiAodDogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiB0IDwgMSA/ICdNJyArIHBvaW50cy5tYXAoKHA6ICh0OiBudW1iZXIpID0+IGFueVtdKSA9PiBwKHQpKS5qb2luKCdMJykgOiBkMTtcbiAgICAgIH07XG4gICAgfTtcbiAgfVxuXG4gIGdldFN0YXJ0aW5nUGF0aCgpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5yb3VuZEVkZ2VzID8gMSA6IDA7XG4gICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzLmxpbmVDb29yZGluYXRlc1syXS52MTtcblxuICAgIHJldHVybiByb3VuZGVkUmVjdCh4IC0gdGhpcy53aWR0aCwgeSAtIDEsIHRoaXMud2lkdGgsIDIsIHJhZGl1cywgdGhpcy5lZGdlcyk7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5nZXRSYWRpdXMoKTtcbiAgICBsZXQgcGF0aCA9ICcnO1xuXG4gICAgcGF0aCA9IHJvdW5kZWRSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgTWF0aC5taW4odGhpcy5oZWlnaHQsIHJhZGl1cyksIHRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBnZXRTdGFydGluZ0xpbmVDb29yZGluYXRlcygpOiBMaW5lQ29vcmRpbmF0ZXMge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25zKSB7XG4gICAgICByZXR1cm4gWy4uLnRoaXMubGluZUNvb3JkaW5hdGVzXTtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lQ29vcmRpbmF0ZXM6IExpbmVDb29yZGluYXRlcyA9IGNsb25lRGVlcCh0aGlzLmxpbmVDb29yZGluYXRlcyk7XG5cbiAgICBsaW5lQ29vcmRpbmF0ZXNbMV0udjEueSA9IGxpbmVDb29yZGluYXRlc1sxXS52Mi55ID0gbGluZUNvb3JkaW5hdGVzWzNdLnYxLnkgPSBsaW5lQ29vcmRpbmF0ZXNbM10udjIueSA9IGxpbmVDb29yZGluYXRlc1swXS52MS55ID0gbGluZUNvb3JkaW5hdGVzWzBdLnYyLnkgPVxuICAgICAgbGluZUNvb3JkaW5hdGVzWzJdLnYxLnk7XG5cbiAgICByZXR1cm4gbGluZUNvb3JkaW5hdGVzO1xuICB9XG5cbiAgZ2V0UmFkaXVzKCk6IG51bWJlciB7XG4gICAgbGV0IHJhZGl1cyA9IDA7XG5cbiAgICBpZiAodGhpcy5yb3VuZEVkZ2VzICYmIHRoaXMuaGVpZ2h0ID4gNSAmJiB0aGlzLndpZHRoID4gNSkge1xuICAgICAgcmFkaXVzID0gTWF0aC5mbG9vcihNYXRoLm1pbig1LCB0aGlzLmhlaWdodCAvIDIsIHRoaXMud2lkdGggLyAyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhZGl1cztcbiAgfVxuXG4gIGdldEdyYWRpZW50KCk6IEdyYWRpZW50W10ge1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgY29sb3I6IHRoaXMuZmlsbCxcbiAgICAgICAgb3BhY2l0eTogdGhpcy5nZXRTdGFydE9wYWNpdHkoKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgb2Zmc2V0OiAxMDAsXG4gICAgICAgIGNvbG9yOiB0aGlzLmZpbGwsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICB9XG5cbiAgZ2V0U3RhcnRPcGFjaXR5KCk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMucm91bmRFZGdlcykge1xuICAgICAgcmV0dXJuIDAuMjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDAuNTtcbiAgICB9XG4gIH1cblxuICBnZXQgZWRnZXMoKTogYm9vbGVhbltdIHtcbiAgICBsZXQgZWRnZXM6IFtib29sZWFuLCBib29sZWFuLCBib29sZWFuLCBib29sZWFuXSA9IFtmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZV07XG4gICAgaWYgKHRoaXMucm91bmRFZGdlcykge1xuICAgICAgZWRnZXMgPSBbdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZV07XG4gICAgfVxuICAgIHJldHVybiBlZGdlcztcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ21vdXNlZW50ZXInKVxuICBvbk1vdXNlRW50ZXIoKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmF0ZS5lbWl0KHRoaXMuZGF0YSk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdtb3VzZWxlYXZlJylcbiAgb25Nb3VzZUxlYXZlKCk6IHZvaWQge1xuICAgIHRoaXMuZGVhY3RpdmF0ZS5lbWl0KHRoaXMuZGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGNoZWNrVG9IaWRlQmFyKCk6IHZvaWQge1xuICAgIHRoaXMuaGlkZUJhciA9IHRoaXMubm9CYXJXaGVuWmVybyAmJiB0aGlzLmhlaWdodCA9PT0gMDtcbiAgfVxufVxuIl19