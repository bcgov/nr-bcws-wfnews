import { NgModule } from '@angular/core';
import { ChartCommonModule } from './common/chart-common.module';
import { AreaChartModule } from './area-chart/area-chart.module';
import { BarChartModule } from './bar-chart/bar-chart.module';
import { BoxChartModule } from './box-chart/box-chart.module';
import { BubbleChartModule } from './bubble-chart/bubble-chart.module';
import { HeatMapModule } from './heat-map/heat-map.module';
import { LineChartModule } from './line-chart/line-chart.module';
import { PolarChartModule } from './polar-chart/polar-chart.module';
import { NumberCardModule } from './number-card/number-card.module';
import { PieChartModule } from './pie-chart/pie-chart.module';
import { TreeMapModule } from './tree-map/tree-map.module';
import { GaugeModule } from './gauge/gauge.module';
import { ngxChartsPolyfills } from './polyfills';
import * as i0 from "@angular/core";
export class NgxChartsModule {
    constructor() {
        ngxChartsPolyfills();
    }
}
NgxChartsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: NgxChartsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxChartsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: NgxChartsModule, exports: [ChartCommonModule,
        AreaChartModule,
        BarChartModule,
        BoxChartModule,
        BubbleChartModule,
        HeatMapModule,
        LineChartModule,
        PolarChartModule,
        NumberCardModule,
        PieChartModule,
        TreeMapModule,
        GaugeModule] });
NgxChartsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: NgxChartsModule, imports: [ChartCommonModule,
        AreaChartModule,
        BarChartModule,
        BoxChartModule,
        BubbleChartModule,
        HeatMapModule,
        LineChartModule,
        PolarChartModule,
        NumberCardModule,
        PieChartModule,
        TreeMapModule,
        GaugeModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: NgxChartsModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [
                        ChartCommonModule,
                        AreaChartModule,
                        BarChartModule,
                        BoxChartModule,
                        BubbleChartModule,
                        HeatMapModule,
                        LineChartModule,
                        PolarChartModule,
                        NumberCardModule,
                        PieChartModule,
                        TreeMapModule,
                        GaugeModule
                    ]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNoYXJ0cy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtY2hhcnRzL3NyYy9saWIvbmd4LWNoYXJ0cy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7QUFrQmpELE1BQU0sT0FBTyxlQUFlO0lBQzFCO1FBQ0Usa0JBQWtCLEVBQUUsQ0FBQztJQUN2QixDQUFDOzs0R0FIVSxlQUFlOzZHQUFmLGVBQWUsWUFkeEIsaUJBQWlCO1FBQ2pCLGVBQWU7UUFDZixjQUFjO1FBQ2QsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixhQUFhO1FBQ2IsZUFBZTtRQUNmLGdCQUFnQjtRQUNoQixnQkFBZ0I7UUFDaEIsY0FBYztRQUNkLGFBQWE7UUFDYixXQUFXOzZHQUdGLGVBQWUsWUFkeEIsaUJBQWlCO1FBQ2pCLGVBQWU7UUFDZixjQUFjO1FBQ2QsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixhQUFhO1FBQ2IsZUFBZTtRQUNmLGdCQUFnQjtRQUNoQixnQkFBZ0I7UUFDaEIsY0FBYztRQUNkLGFBQWE7UUFDYixXQUFXOzJGQUdGLGVBQWU7a0JBaEIzQixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxpQkFBaUI7d0JBQ2pCLGVBQWU7d0JBQ2YsY0FBYzt3QkFDZCxjQUFjO3dCQUNkLGlCQUFpQjt3QkFDakIsYUFBYTt3QkFDYixlQUFlO3dCQUNmLGdCQUFnQjt3QkFDaEIsZ0JBQWdCO3dCQUNoQixjQUFjO3dCQUNkLGFBQWE7d0JBQ2IsV0FBVztxQkFDWjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDaGFydENvbW1vbk1vZHVsZSB9IGZyb20gJy4vY29tbW9uL2NoYXJ0LWNvbW1vbi5tb2R1bGUnO1xuaW1wb3J0IHsgQXJlYUNoYXJ0TW9kdWxlIH0gZnJvbSAnLi9hcmVhLWNoYXJ0L2FyZWEtY2hhcnQubW9kdWxlJztcbmltcG9ydCB7IEJhckNoYXJ0TW9kdWxlIH0gZnJvbSAnLi9iYXItY2hhcnQvYmFyLWNoYXJ0Lm1vZHVsZSc7XG5pbXBvcnQgeyBCb3hDaGFydE1vZHVsZSB9IGZyb20gJy4vYm94LWNoYXJ0L2JveC1jaGFydC5tb2R1bGUnO1xuaW1wb3J0IHsgQnViYmxlQ2hhcnRNb2R1bGUgfSBmcm9tICcuL2J1YmJsZS1jaGFydC9idWJibGUtY2hhcnQubW9kdWxlJztcbmltcG9ydCB7IEhlYXRNYXBNb2R1bGUgfSBmcm9tICcuL2hlYXQtbWFwL2hlYXQtbWFwLm1vZHVsZSc7XG5pbXBvcnQgeyBMaW5lQ2hhcnRNb2R1bGUgfSBmcm9tICcuL2xpbmUtY2hhcnQvbGluZS1jaGFydC5tb2R1bGUnO1xuaW1wb3J0IHsgUG9sYXJDaGFydE1vZHVsZSB9IGZyb20gJy4vcG9sYXItY2hhcnQvcG9sYXItY2hhcnQubW9kdWxlJztcbmltcG9ydCB7IE51bWJlckNhcmRNb2R1bGUgfSBmcm9tICcuL251bWJlci1jYXJkL251bWJlci1jYXJkLm1vZHVsZSc7XG5pbXBvcnQgeyBQaWVDaGFydE1vZHVsZSB9IGZyb20gJy4vcGllLWNoYXJ0L3BpZS1jaGFydC5tb2R1bGUnO1xuaW1wb3J0IHsgVHJlZU1hcE1vZHVsZSB9IGZyb20gJy4vdHJlZS1tYXAvdHJlZS1tYXAubW9kdWxlJztcbmltcG9ydCB7IEdhdWdlTW9kdWxlIH0gZnJvbSAnLi9nYXVnZS9nYXVnZS5tb2R1bGUnO1xuaW1wb3J0IHsgbmd4Q2hhcnRzUG9seWZpbGxzIH0gZnJvbSAnLi9wb2x5ZmlsbHMnO1xuXG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBbXG4gICAgQ2hhcnRDb21tb25Nb2R1bGUsXG4gICAgQXJlYUNoYXJ0TW9kdWxlLFxuICAgIEJhckNoYXJ0TW9kdWxlLFxuICAgIEJveENoYXJ0TW9kdWxlLFxuICAgIEJ1YmJsZUNoYXJ0TW9kdWxlLFxuICAgIEhlYXRNYXBNb2R1bGUsXG4gICAgTGluZUNoYXJ0TW9kdWxlLFxuICAgIFBvbGFyQ2hhcnRNb2R1bGUsXG4gICAgTnVtYmVyQ2FyZE1vZHVsZSxcbiAgICBQaWVDaGFydE1vZHVsZSxcbiAgICBUcmVlTWFwTW9kdWxlLFxuICAgIEdhdWdlTW9kdWxlXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTmd4Q2hhcnRzTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbmd4Q2hhcnRzUG9seWZpbGxzKCk7XG4gIH1cbn1cbiJdfQ==