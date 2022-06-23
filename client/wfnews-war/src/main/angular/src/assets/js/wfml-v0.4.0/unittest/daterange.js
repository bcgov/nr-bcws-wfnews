import {DateRange, Interval, PRESENT, Units} from '../wfml/date.js';

QUnit.module( "Interval", ()=>{
    
    QUnit.test("Rejects bad values", (assert)=> {
        ["not a number", null, undefined].forEach(badValue=> {
            assert.throws(()=>{
                new Interval(badValue, Units.HOURS)
            }, `${badValue} is not a valid time value`)
        })
    })
    
    QUnit.test("Rejects bad units", (assert)=> {
        ["metres", 42, null, undefined].forEach(badUnit=> {
            assert.throws(()=>{
                new Interval(4, badUnit)
            }, `${badUnit} is not a valid time unit`)
        })
    })
    
    QUnit.test("Accepts integer values", (assert)=> {
        [0, 1, 42, -2].forEach(goodValue=> {
            var result = new Interval(goodValue, Units.HOURS)
            assert.equal(result.value, goodValue, `${goodValue} is a valid time value`)
        })
    })
    
    QUnit.test("Accepts good units", (assert)=> {
        [Units.DAYS, Units.HOURS, Units.MINUTES, Units.SECONDS].forEach(goodUnit=> {
            var result = new Interval(2, goodUnit)
            assert.equal(result.unit, goodUnit, `${goodUnit} is a valid time unit`)
        })
    })

    QUnit.test("Add seconds to date", (assert)=>{
        var date = new Date("2019-06-05 11:34:16")
        var interval = new Interval(42, Units.SECONDS)
        var result = interval.after(date)

        assert.dateEqual(result, new Date("2019-06-05 11:34:58"), 1, "Result is 42 seconds later")
        assert.dateEqual(date, new Date("2019-06-05 11:34:16"), 1, "Did not alter original date")
    })

    QUnit.test("Add minutes to date", (assert)=>{
        var date = new Date("2019-06-05 11:34:16")
        var interval = new Interval(42, Units.MINUTES)
        var result = interval.after(date)

        assert.dateEqual(result, new Date("2019-06-05 12:16:16"), 1, "Result is 42 minutes later")
        assert.dateEqual(date, new Date("2019-06-05 11:34:16"), 1, "Did not alter original date")
    })
    
    QUnit.test("Add hours to date", (assert)=>{
        var date = new Date("2019-06-05 11:34:16")
        var interval = new Interval(42, Units.HOURS)
        var result = interval.after(date)

        assert.dateEqual(result, new Date("2019-06-07 5:34:16"), 1, "Result is 42 hours later")
        assert.dateEqual(date, new Date("2019-06-05 11:34:16"), 1, "Did not alter original date")
    })
    
    QUnit.test("Add days to date", (assert)=>{
        var date = new Date("2019-06-05 11:34:16")
        var interval = new Interval(42, Units.DAYS)
        var result = interval.after(date)

        assert.dateEqual(result, new Date("2019-07-17 11:34:16"), 1, "Result is 42 days later")
        assert.dateEqual(date, new Date("2019-06-05 11:34:16"), 1, "Did not alter original date")
    })

    QUnit.test("Subtract from date", (assert)=>{
        var date = new Date("2019-06-05 11:34:16")
        var interval = new Interval(42, Units.HOURS)
        var result = interval.before(date)

        assert.dateEqual(result, new Date("2019-06-03 17:34:16"), 1, "Result is 42 hours earlier")
        assert.dateEqual(date, new Date("2019-06-05 11:34:16"), 1, "Did not alter original date")        
    })

    QUnit.test("WMS Strings", (assert)=>{
        assert.equal(new Interval(42,Units.SECONDS).getWms(), "PT42S", Units.SECONDS)
        assert.equal(new Interval(42,Units.MINUTES).getWms(), "PT42M", Units.MINUTES)
        assert.equal(new Interval(42,Units.HOURS).getWms(), "PT42H", Units.HOURS)
        assert.equal(new Interval(42,Units.DAYS).getWms(), "P42D", Units.DAYS)
    })

    QUnit.test("WMS Parse", (assert)=>{
        assert.intervalEqual(Interval.parseWms("PT2S"), new Interval(2, Units.SECONDS), 'seconds')
        assert.intervalEqual(Interval.parseWms("PT2M"), new Interval(2, Units.MINUTES), 'minutes')
        assert.intervalEqual(Interval.parseWms("PT2H"), new Interval(2, Units.HOURS), 'hours')
        assert.intervalEqual(Interval.parseWms("P2D"), new Interval(2, Units.DAYS), 'days')
    })

    QUnit.todo("Parse mixed units", (assert)=>{
        // Not sure if using the smallest unit is the best way to handle this.
        assert.intervalEqual(Interval.parseWms("PT3M2S"), new Interval(62, Units.SECONDS), 'minutes and seconds')
        assert.intervalEqual(Interval.parseWms("P1DT12H"), new Interval(36, Units.HOURS), 'days and hours')
    })

    QUnit.test("Equality", assert=>{
        var interval = new Interval(2, Units.HOURS) 
        assert.ok(interval.equals(interval), "Equals itself")
        assert.ok(interval.equals(new Interval(2, Units.HOURS)), "Equals identical interval")
        assert.notOk(interval.equals(new Interval(3, Units.HOURS)), "Not equal to interval with different value")
        assert.notOk(interval.equals(new Interval(2, Units.MINUTES)), "Not equal to interval with different unit")
        assert.notOk(interval.equals(2), "Not equal to a number")
        assert.notOk(interval.equals(null), "Not equal to null")
    })
});

QUnit.module( "DateRange", ()=>{
    QUnit.test("Accepts good start values", assert=>{
        [new Date("2019-06-03 17:34:16"), new Date("2063-04-05 11:34:16"), new Interval(2, Units.HOURS)].forEach((goodStart)=>{
            var result=new DateRange(goodStart, new Date("2161-04-05 11:34:16"))
            assert.equal(result.start, goodStart, `${goodStart} is a good start value`)
        })
    })
    
    QUnit.test("Accepts good end values", assert=>{
        [new Date("2019-06-03 17:34:16"), new Date("2063-04-05 11:34:16"), PRESENT].forEach((goodEnd)=>{
            var result=new DateRange(new Date("1987-09-28 11:34:16"), goodEnd)
            assert.equal(result.end, goodEnd, `${goodEnd} is a good end value`)
        })
    })

    QUnit.test("Rejects bad start values", assert=>{
        ["Not a date", 2, PRESENT, new Interval(-2,Units.HOURS), null, undefined].forEach((badStart)=>{
            assert.throws(()=>{new DateRange(badStart, new Date("2161-04-05 11:34:16"))}, `${badStart} is a bad start value`)
        })
    })

    QUnit.test("Rejects bad end values", assert=>{
        ["Not a date", 2, new Interval(2, Units.HOURS), new Interval(-2,Units.HOURS), null, undefined].forEach((badEnd)=>{
            assert.throws(()=>{new DateRange(new Date("2019-04-05 11:34:16"), badEnd)},`${badEnd} is a bad end value`)
        })
    })

    QUnit.test("WMS Strings", (assert)=>{
        assert.equal(
            new DateRange(new Interval(42,Units.HOURS), new Date("2019-04-05T11:34:16Z")).getWms(),
            "PT42H/2019-04-05T11:34:16.000Z", "Interval before fixed date")
        assert.equal(
            new DateRange(new Date("2019-04-03T11:34:16Z"), new Date("2019-04-05T11:34:16Z")).getWms(),
            "2019-04-03T11:34:16.000Z/2019-04-05T11:34:16.000Z", "Between fixed dates")
        assert.equal(
            new DateRange(new Date("2019-04-03T11:34:16+04:00"), new Date("2019-04-05T11:34:16-07:00")).getWms(),
            "2019-04-03T07:34:16.000Z/2019-04-05T18:34:16.000Z", "Use UTC")
        assert.equal(
            new DateRange(new Interval(42,Units.HOURS), PRESENT).getWms(),
            "PT42H/PRESENT", "Interval before present")
        assert.equal(
            new DateRange(new Date("2019-04-03T11:34:16Z"), PRESENT).getWms(),
            "2019-04-03T11:34:16.000Z/PRESENT", "Fixed date before present")
        
    })

    QUnit.test("WMS parse dates", assert=>{
        assert.equal(DateRange.parseWmsDate("PRESENT"), PRESENT)
        assert.intervalEqual(DateRange.parseWmsDate("PT42H"), new Interval(42, Units.HOURS))
        assert.dateEqual(DateRange.parseWmsDate("2019-04-05T11:34:16Z"), new Date("2019-04-05T11:34:16Z"),1)
        assert.throws(()=>DateRange.parseWmsDate("Not a date"))
        assert.throws(()=>DateRange.parseWmsDate("PT"))
        assert.throws(()=>DateRange.parseWmsDate("P"))
        assert.throws(()=>DateRange.parseWmsDate("P3H"))
    })

    QUnit.test("WMS parse range", assert=>{
        assert.rangeEqual(
            DateRange.parseWms("PT24H/PRESENT"),
            new DateRange(new Interval(24, Units.HOURS), PRESENT))
        assert.rangeEqual(
            DateRange.parseWms("PT24H/2019-04-03T11:34:16Z"),
            new DateRange(new Interval(24, Units.HOURS), new Date("2019-04-03T11:34:16Z")),1)
        assert.rangeEqual(
            DateRange.parseWms("2019-04-02T11:34:16Z/2019-04-03T11:34:16Z"),
            new DateRange(new Date("2019-04-02T11:34:16Z"), new Date("2019-04-03T11:34:16Z")),1)
        assert.rangeEqual(
            DateRange.parseWms("2019-04-02T11:34:16Z/PRESENT"),
            new DateRange(new Date("2019-04-02T11:34:16Z"), PRESENT),1)
        assert.throws(()=>DateRange.parseWms("Not a range"))
        assert.throws(()=>DateRange.parseWms("Not a date/not a date"))
        assert.throws(()=>DateRange.parseWms("PT24H/not a date"))
        assert.throws(()=>DateRange.parseWms("not a date/PRESENT"))
    })
    
    QUnit.module( "Equality", ()=>{
        
        QUnit.test("Interval/Present", assert=>{
            var range = DateRange.parseWms("PT24H/PRESENT")
            assert.ok(range.equals(range), "Equals itself")
            assert.ok(range.equals(DateRange.parseWms("PT24H/PRESENT")), "Equals identical range")
            assert.notOk(range.equals(DateRange.parseWms("PT22H/PRESENT")), "Different start iterval")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-07/PRESENT")), "Start not an interval")
            assert.notOk(range.equals(DateRange.parseWms("PT24H/2019-06-07")), "End not the present")
        })
        
        QUnit.test("Interval/Date", assert=>{
            var range = DateRange.parseWms("PT24H/2019-06-07")
            assert.ok(range.equals(range), "Equals itself")
            assert.ok(range.equals(DateRange.parseWms("PT24H/2019-06-07")), "Equals identical range")
            assert.notOk(range.equals(DateRange.parseWms("PT22H/2019-06-07")), "Different start iterval")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-07/2019-06-07")), "Start not an interval")
            assert.notOk(range.equals(DateRange.parseWms("PT24H/2019-06-06")), "Different end")
            assert.notOk(range.equals(DateRange.parseWms("PT24H/PRESENT")), "End not a date")
        })
        
        QUnit.test("Date/Present", assert=>{
            var range = DateRange.parseWms("2019-06-05/PRESENT")
            assert.ok(range.equals(range), "Equals itself")
            assert.ok(range.equals(DateRange.parseWms("2019-06-05/PRESENT")), "Equals identical range")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-06/PRESENT")), "Different start iterval")
            assert.notOk(range.equals(DateRange.parseWms("PT24H/PRESENT")), "Start not a date")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-05/2019-06-07")), "End not the present")
        })
         QUnit.test("Date/Date", assert=>{
            var range = DateRange.parseWms("2019-06-05/2019-06-07")
            assert.ok(range.equals(range), "Equals itself")
            assert.ok(range.equals(DateRange.parseWms("2019-06-05/2019-06-07")), "Equals identical range")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-06/2019-06-07")), "Different start iterval")
            assert.notOk(range.equals(DateRange.parseWms("PT24H/2019-06-07")), "Start not an interval")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-05/2019-06-06")), "Different end")
            assert.notOk(range.equals(DateRange.parseWms("2019-06-05/PRESENT")), "End not a date")
        })
        
    })
    
    QUnit.test("Fix", assert=>{
        assert.rangeEqual(DateRange.parseWms("P4D/2019-06-05").fix(),DateRange.parseWms("2019-06-01/2019-06-05"),1, "Interval before date")
        assert.rangeEqual(DateRange.parseWms("P4D/PRESENT").fix(new Date("2019-06-05")),DateRange.parseWms("2019-06-01/2019-06-05"), 1, "Interval before present, given a present")
        var now = new Date()
        var before = new Date()
        before.setDate(before.getDate()-4)
        var expected = new DateRange(before, now)
        assert.rangeEqual(DateRange.parseWms("P4D/PRESENT").fix(),expected, 1000, "Interval beore present, using live present (May fail if using breakpoints or otherwise slowing things down)")
    })
})
