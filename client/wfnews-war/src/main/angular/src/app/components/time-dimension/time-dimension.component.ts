import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, } from "@angular/core";
import { WfimMapService } from "../../services/wfim-map.service";
import { DateRange, Interval, Present, PRESENT, Units, INTERVAL_UNITS } from "../../models/date";
import { MatRadioChange } from '@angular/material/radio'
import { MatFormField } from "@angular/material/form-field";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Subscription } from "rxjs";

enum RangeType {
    HISTORICAL="historical",
    PRESENT="present",
    OTHER="other"
}
export type State = RangeType.HISTORICAL|RangeType.PRESENT

@Component({
    selector: 'wfim-time-dimension',
    templateUrl: './time-dimension.component.html',
    styleUrls: [ './time-dimension.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeDimensionComponent implements AfterViewInit {
    loading = true;

    constructor(
        protected mapService: WfimMapService,
        protected changeDetector: ChangeDetectorRef,
        protected fb: FormBuilder
    ) {
        this.setTimeQuietly(this.mapService.getTime())
    }
    
    historical: DateRange<Date, Date> = undefined;
    historicalAsArray: any[] = undefined;
    present: DateRange<Interval, Present> = DateRange.parseWms("PT24H/PRESENT") as DateRange<Interval, Present>;
    errors: string[]
    @ViewChild("timeToolRangeStartDT") startPicker;
    @ViewChild("timeToolRangeEndDT") endPicker;
    
    historicalFormGroup: FormGroup
    presentFormGroup = this.fb.group({value: this.present.start.value, unit: this.present.start.unit})
    historicalChangeSubscription: Subscription;
        
    getTimeUnits() {
        return [Units.SECONDS, Units.MINUTES, Units.HOURS, Units.DAYS];
    }
    
    getHistoricalRangeString():string {
        return this.historical.getOwlString()
    }
    
    ngAfterViewInit(): void {
        this.mapService.timeChange.subscribe(range=>{
            this.setTime(range)
        })
    }

    static getRangeType(range: DateRange<any,any>): RangeType {
        if(range.start instanceof Interval && range.end===PRESENT) {
            return RangeType.PRESENT
        } else if (range.start instanceof Date && range.end instanceof Date) {
            return RangeType.HISTORICAL
        } else {
            return RangeType.OTHER
        }
    }
    
    private doSetHistorical(range: DateRange<Date, Date>): void {
        this.rangeChangeBlocked++
        try {
            this.historical = range;
            this.initHistoricalForm()
            this.historicalFormGroup.get("range").setValue([range.start, range.end]);
        } finally {
            this.rangeChangeBlocked--
        }
    }
    private doSetPresent(range: DateRange<Interval, Present>): void {
        this.present = range;
    }
    
    private setTimeQuietly(range: DateRange<any,any>):void {
        switch(TimeDimensionComponent.getRangeType(range)){
        case RangeType.HISTORICAL:
            this.doSetHistorical(range)
            break;
        case RangeType.PRESENT:
            this.doSetPresent(range)
            break
        default:
            console.warn(`Unexpected time range ${range}`)
        }
    }
    setTime(range: DateRange<any, any>):void {
        switch(TimeDimensionComponent.getRangeType(range)){
        case RangeType.HISTORICAL:
            this.doSetHistorical(range)
            break;
        case RangeType.PRESENT:
            this.doSetPresent(range)
            break
        default:
            throw `Unexpected time range ${range}`
        }
        this.changeDetector.detectChanges()
    }
    
    updatePresent(range: DateRange<Interval, Present>):void {
        var intervalSec = range.seconds()
        if(intervalSec > this.maxInterval().seconds()) {
            console.warn(`Duration must be no more than ${this.maxInterval().value} ${this.maxInterval().unit.name}`)
            range.start = this.maxInterval().inUnit(range.start.unit)
        }
        if(intervalSec <= 0) {
            console.warn("Duration must be greater than 0")
            range.start = new Interval(1, range.start.unit)
        }

        this.doSetPresent(range)
        this.mapService.setTime(this.present)
    }
    
    updateHistorical(range: DateRange<Date, Date>):void {
        var intervalSec = range.seconds();
        var control = this.historicalFormGroup.get("range")
        this.rangeChangeBlocked++
        try{
            if(control.valid) {
                this.doSetHistorical(range)
                this.mapService.setTime(this.historical)
            } else {
                // Force both pickers to update
                this.historicalFormGroup.get("range").setValue([range.start, range.end]);
            }
        } finally {
            this.rangeChangeBlocked--
        }
    }
    
    getHistoricalStartErrors(): string[] {
        var errors = this.historicalFormGroup.get("range").errors
        if(errors) {
            return Object.keys(errors).filter((key)=>!key.startsWith('end')).map((key)=>errors[key])
        } else {
            return null;
        }
    }
    getHistoricalEndErrors(): string[] {
        var errors = this.historicalFormGroup.get("range").errors
        if(errors) {
            return Object.keys(errors).filter((key)=>!key.startsWith('start')).map((key)=>errors[key])
        } else {
            return null;
        }
    }
    
    private static arrayToRange(array: any[]): DateRange<any, any> {
        if(array[0] instanceof Date) {
            return new DateRange<Date,Date>(array[0], array[1])
        } else {
            return new DateRange<Date,Date>(array[0]?.toDate(), array[1]?.toDate())
        }
    }
    private inBounds(name:"start"|"end") : ValidatorFn {
        var self = this
        return (control: AbstractControl):ValidationErrors|null => {
            var value = control.value
            if(!value) {
                return null
            }
            var range = TimeDimensionComponent.arrayToRange(value)
            var window = self.windowRange().fix()
            var result = {}
            if(range[name].getTime() > window.end.getTime()) {
               result[`${name}InFuture`]="Can not be in the future"
               return result
            } else if(range[name].getTime() < window.start.getTime()) {
               result[`${name}TooEarly`]=`Must be within the last ${this.windowRange().start.value} ${this.windowRange().start.unit.name}`
               return result
            } else {
                return null
            }
        }
    }
    
    private TOO_LONG: ValidatorFn = (control: AbstractControl): ValidationErrors|null =>{
        var value = control.value
        if(!value) {
            return null
        }
        var range = TimeDimensionComponent.arrayToRange(value)
        var intervalSec = range.seconds();
        if(intervalSec > this.maxInterval().seconds()) {
            return {tooLong: `Duration must be no more than ${this.maxInterval().value} ${this.maxInterval().unit.name}`}
        } else {
            return null
        }
    }
    private TOO_SHORT: ValidatorFn = (control: AbstractControl): ValidationErrors|null =>{
        var value = control.value
        if(!value) {
            return null
        }
        var range = TimeDimensionComponent.arrayToRange(value)
        var intervalSec = range.seconds();
        if(intervalSec <= 0) {
            return {tooLong: `Duration can not be 0`}
        } else {
            return null
        }
    }
    
    private initHistoricalForm():void {
        if (this.historical && !this.historicalFormGroup) {
            this.historicalFormGroup = this.fb.group({range: [this.historicalAsArray,[this.inBounds("start"), this.inBounds("end"), this.TOO_SHORT, this.TOO_LONG]]})
            var self = this
            this.historicalChangeSubscription = this.historicalFormGroup.get("range").valueChanges.subscribe((event)=>self.rangeChange(event));
        }
    }
    
    toHistorical(): void {
        if(! this.historical) {
            this.historical = this.present.fix()
            this.initHistoricalForm()
        }
        this.mapService.setTime(this.historical)
    }
    
    toPresent(): void {
        this.mapService.setTime(this.present)
    }
    
    getCurrentRangeType(): RangeType {
        return TimeDimensionComponent.getRangeType(this.mapService.getTime())
    }
    
    modeRadioChange(event: MatRadioChange): void {
        var str = event.value
        switch(str) {
        case RangeType.PRESENT:
            this.toPresent();
            break;
        case RangeType.HISTORICAL:
            this.toHistorical();
            break;
        default:
            throw `Unexpected time tool mode ${event.value}`
        }
    }
    
    isHistorical(): boolean {
        return this.getCurrentRangeType() === RangeType.HISTORICAL
    }
    
    isPresent(): boolean {
        return this.getCurrentRangeType() === RangeType.PRESENT
    }
    
    intervalValueChange(event): void{
        var newRange = new DateRange(new Interval(event.target.value as number, this.present.start.unit), PRESENT)
        this.updatePresent(newRange);
    }
    
    maxInterval():Interval {
        return new Interval(7, Units.DAYS);
    }
    windowRange():DateRange<Interval, Present> {
        return new DateRange(new Interval(6*31, Units.DAYS), PRESENT);
    }
    
    intervalUnitChange(event): void{
        var unit = INTERVAL_UNITS.find(u=>u.name===event.value)
        if(unit) {
            var newRange = new DateRange(new Interval(this.present.start.value,unit), PRESENT)
            this.updatePresent(newRange);
        } else {
            throw `Unexpected unit ${event.value}`
        }
    }
    
    rangeChangeBlocked = 0;
    rangeChange(event): void {
        if(this.rangeChangeBlocked>0) {
            return
        }
        if(typeof event[0] === "string" || event[0] instanceof Date) {
            // Ignore the event
        } else {
            // Might be worth standardizing on Moment throughout instead of converting between Date and Moment
            var newRange = new DateRange<Date,Date>(event[0].toDate(), event[1].toDate())
            this.updateHistorical(newRange)
        }
    }
}
