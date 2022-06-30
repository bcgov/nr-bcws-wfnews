
    function cqlAttribute (name) {
        // Rather than detecting CQL reserved words to determine if we need delimiters, always use delimiters
        // (double quotes) and escape them if they occur in the attribute name
        return `"${name.replace(/"/g,'""')}"`
    }
    
    function cqlString (string) {
        return `'${string.replace(/'/g,"''")}'`
    }

export type EpochRange = any

class DateRange<StartDate extends Date|Interval, EndDate extends Date|Present> {
    public start : StartDate;
    public end: EndDate;
    
    public constructor(start: StartDate, end: EndDate) {
        if(start instanceof Date || start instanceof Interval) {
            if(start instanceof Interval && start.value<=0) {
                throw "start must be positive"
            }
            this.start = start
        } else {
            throw `start must be a Date or an Interval but was ${start}`
        }
        if(end instanceof Date || end == PRESENT) {
            this.end = end
        } else {
            throw `end must be a Date or PRESENT but was ${end}`
        }
    }
    
    public getWms() {
        var startString
        var endString
        if(this.start instanceof Interval) {
            startString = this.start.getWms()
        } else {
            startString = this.start.toISOString()
        }
        
        endString = this.end.toISOString()
        
        return `${startString}/${endString}`
    }
    
    public static getOwlDate(date: Date):string {
         var formatter = Intl.DateTimeFormat('en-CA',{timeZone: "America/Vancouver", hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: undefined})
         return formatter.format(date).replace(',', '')
    }
    
    public getOwlString(): string {
        var startString
        var endString
        if(this.start instanceof Interval) {
            throw "Owl string not supported for Interval";
        } else {
            startString = DateRange.getOwlDate(this.start as Date)
        }
        if(this.end instanceof Present) {
            throw "Owl string not supported for Present";
        } else {
            endString = DateRange.getOwlDate(this.end as Date)
        }
                
        return `${startString} ~ ${endString}`
    }

    public getCqlEpochSeconds(attributeName, present?:Date) {
        var epochSeconds = this.epochSeconds(present)
        return `${cqlAttribute(attributeName)} BETWEEN ${epochSeconds.start} AND ${epochSeconds.end}`
    }
    
    
    public getCqlIsoDate(attributeName, present?:Date) {
        var absolute = this.fix(present)
        return `${cqlAttribute(attributeName)} DURING ${absolute.getWms()}`
    }
    
    public getCql (layer) {
        if(layer.config.temporalAttribute) {
            switch(layer.config.temporalAttribute.unit) {
            case 'iso-8601':
                return this.getCqlIsoDate(layer.config.temporalAttribute.name);
            case 'seconds':
                return this.getCqlEpochSeconds(layer.config.temporalAttribute.name);
            default:
                throw `Unknown temporal attribute unit ${layer.config.temporalAttribute.unit}`
            }
        } else {
            throw `Attempted to generate CQL for layer ${layer.config.id} but it has no temporalAttribute`
        }
    }
    
    private static partsEqual(x, y): boolean {
        if(x==PRESENT && y==PRESENT) return true
        if(x instanceof Interval && x.equals(y)) return true
        if(x instanceof Date && y instanceof Date && x.valueOf()==y.valueOf()) return true
        return false
    }
    
    public equals (obj:any): boolean {
        if(!(obj instanceof DateRange)) return false
        if(!obj) return false
        return DateRange.partsEqual(this.start,obj.start) && DateRange.partsEqual(this.end,obj.end)
    }
    
    public fix(present?: Date): DateRange<Date, Date> {
    
        // Resolve PRESENT as actual present unless an alternate present was provided
        present = present || new Date()
        var end: Date = this.end instanceof Date ? this.end : present
    
        // Resolve an interval to a date that fare bebore the end
        var start = this.start instanceof Interval ? this.start.before(end) : this.start as Date
    
        return new DateRange<Date, Date>(start, end)
    }
    
    public epochSeconds = function(present?: Date): any {
        var fixed = this.fix(present)
    
        return {start: Math.floor(fixed.start.getTime()/1000), end: Math.ceil(fixed.end.getTime()/1000)}
    }
    
    /**
     * Duration of the range in seconds
     */
    public seconds = function(present?: Date): any {
        var epoch = this.epochSeconds();
        return epoch.end-epoch.start;
    }
    
    public static parseWmsDate(value: string): Date|Interval|Present {
        if(value=="PRESENT") {
            return PRESENT
        } else if (value[0]=="P") {
            return Interval.parseWms(value)
        } else {
             // TODO might want to be more careful about timezone here
            var date = new Date(value)
            if(isNaN(date.valueOf())) {
                throw `Invalid date ${value}`
            }
            return date
        }
    
    }
    
    public static parseWms(value: string|null|undefined): DateRange<any, any>|null|undefined {
        if (value === undefined ) {
            return undefined
        } else if(value === null) {
            return null        
        } else {
            var [start, end] = value.split('/').map(part=>DateRange.parseWmsDate(part))
            return new DateRange(start as Date|Interval, end as Date|Present)
        }
    }
}
    const Units = Object.freeze({
        DAYS: Object.freeze({name:'days', seconds:60*60*24, field: 'Date', title: 'Days', suffix:"D", subDay:false}),
        HOURS: Object.freeze({name:'hours', seconds:60*60, field: 'Hours', title: 'Hours', suffix:"H", subDay:true}),
        MINUTES: Object.freeze({name:'minutes', seconds:60, field: 'Minutes', title: 'Minutes', suffix:"M", subDay:true}),
        SECONDS: Object.freeze({name:'seconds', seconds:1, field: 'Seconds', title: 'Seconds', suffix:"S", subDay:true})
    })
    const INTERVAL_UNITS = Object.freeze(Object.entries(Units).map(e=>e[1]))
    
    const INTERVAL_WMS_REGEX = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.\d+)?S)?)?$/

export type Unit = any

class Interval {
    value: number
    unit: Unit
    
    public constructor(value: number, unit: Unit) {
        if(value==undefined || isNaN(value)) {
            throw `Time value for interval must be a number but was ${value}`
        }
        this.value = value
        if(!INTERVAL_UNITS.includes(unit)) {
            throw `${unit} is not a valid time unit ${Object.keys(Units).join(', ')}`
        }
        this.unit = unit
    }
    
    public add(date: Date, multiplier: number = 1): Date {
        var newDate = new Date(date)
        var oldValue = date['get'+this.unit.field]()
        newDate['set'+this.unit.field](oldValue+this.value*multiplier)
        return newDate
    }
    
    public before(date: Date): Date {
        return this.add(date, -1)
    }

    public after(date: Date): Date {
        return this.add(date, 1)
    }
    
    public getWms(): string {
        if(this.unit.subDay){
            return `PT${this.value}${this.unit.suffix}`
        } else {
            return `P${this.value}${this.unit.suffix}`
        }
    }
    
    public toISOString(): string {
        return this.getWms()
    }
    
    public toString(): string {
        return `Interval[${this.value} ${this.unit.name}]`
    }
    
    public static parseWms(string: string) {
        var result = INTERVAL_WMS_REGEX.exec(string)
        var partials = INTERVAL_UNITS
            .map((unit, i)=>({"unit":unit, "value":result[i+1] as any}))
            .filter(partial=>partial.value)
            .map(partial=>{partial.value=parseInt(partial.value);return partial})
        if(partials.length==1){
            return new Interval(partials[0].value,partials[0].unit)
        } else {
             // Should do something with mixed units but for now only one is supported
            throw `Not a valid Interval ${string}`
        }
    }
    
    public equals(obj: any): boolean {
        if(! (obj instanceof Interval)) return false
        if(!obj) return false
        return this.value==obj.value && this.unit==obj.unit
    }
    
    public seconds(): number {
        return this.unit.seconds * this.value
    }
    
    /**
     * This interval measured in another unit, rounding down to a whole number of units.
     */
    public inUnit(unit: Unit): Interval {
        return new Interval(Math.floor(this.seconds()/unit.seconds), unit)
    }
}

class Present{
    protected constructor(){}
    
    static instance: Present
    
    public toString () {
        return `Present[${new Date().toISOString()}]`
    }
    public toISOString() {return "PRESENT"}
    
    public static getInstance(): Present {
        if(!Present.instance) {
            Present.instance = new Present()
        }
        return Present.instance;
    }
}

const PRESENT = Present.getInstance();
    
export {DateRange, Interval, Units, Present, PRESENT, INTERVAL_UNITS}

