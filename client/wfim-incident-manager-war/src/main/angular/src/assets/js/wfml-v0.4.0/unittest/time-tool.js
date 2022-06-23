import TimeTool from '../wfml/tool/time.js';
import {DateRange, Interval, Units} from '../wfml/date.js'

const NOW = new Date("2019-06-19T15:03:00-0700") // For test purposes, this is always the present

function setup(date) {
    var fixture=$("#qunit-fixture")[0]
    var mockLeafMap = {}
    var mockToolManager = {
        map:{
            sidebar:()=>({
                create:(id, title, x, callback)=>({content:fixture}),
                show:(sidebar, bool)=>{}
            }),
            layerMgr: {
                time:DateRange.parseWms(date),
                onTimeChange: [],
                setTime: time=>{
                    throw "Should not attempt to change time"
                }
            }
        },
        setActiveTool: tool=>{}
    }
    var tool = new TimeTool({className: 'wfml-tool-time', title:'Time'})
    tool.timezone = 'Etc/GMT+7' // Lock the tool in the UTC-7/PDT/MST  timezone so the tests don't depend on the timezone of the machine they run on
    tool._init('test-id', mockToolManager)
    tool.activate()

    tool.now=()=>new Date(NOW)
    
    return tool
}

QUnit.test("Startup", (assert)=> {
    var tool = setup("PT24H/PRESENT")
    
    assert.rangeEqual(tool.getTime(), DateRange.parseWms("PT24H/PRESENT"),1, "Setup with correct time")
})

QUnit.test("Present", (assert)=> {
    var tool = setup("PT24H/PRESENT")

    tool.render()
    
    assert.rangeEqual(tool.getTime(), DateRange.parseWms("PT24H/PRESENT"),1, "Setup with correct time")
    assert.notOk($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs visible")
    assert.ok($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs hidden")
})

QUnit.test("Historical", (assert)=> {
    var tool = setup("2019-06-06/2019-06-07")

    tool.render()
    
    assert.rangeEqual(tool.getTime(), DateRange.parseWms("2019-06-06/2019-06-07"),1, "Setup with correct time")
    assert.ok($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs hidden")
    assert.notOk($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs visible")
})

function presentAllValid(assert) {
    assert.ok($(".wfml-time-interval-value")[0].checkValidity(), "value is valid")
    assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
}

QUnit.test("Has present inputs", (assert)=> {
    var tool = setup("PT22H/PRESENT")

    tool.render()

    assert.ok($(".wfml-time-interval-value").is("input"), "interval value input present")
    assert.ok($(".wfml-time-interval-unit").is("select"), "interval unit input present")
    
    assert.ok($(".wfml-time-interval-unit").children().is("option[value='DAYS']"), "days unit")
    assert.ok($(".wfml-time-interval-unit").children().is("option[value='HOURS']"), "hours unit")
    assert.ok($(".wfml-time-interval-unit").children().is("option[value='MINUTES']"), "hours unit")
    assert.ok($(".wfml-time-interval-unit").children().is("option[value='SECONDS']"), "minutes unit")

    assert.equal($(".wfml-time-interval-value").prop('value'), '22', "interval value is correct")
    assert.equal($(".wfml-time-interval-unit").prop('value'), 'HOURS', "interval unit is correct")
    
    presentAllValid(assert)
})

function historicalAllValid(assert) {
    assert.ok($(".wfml-time-historical-start .wfml-time-historical-date")[0].checkValidity(), "start date is valid")
    assert.ok($(".wfml-time-historical-start .wfml-time-historical-time")[0].checkValidity(), "start time is valid")
    assert.ok($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is valid")
    assert.ok($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "end time is valid")
}

QUnit.test("Has historical inputs", (assert)=> {
    var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")

    tool.render()
    
    assert.ok($(".wfml-time-historical-start .wfml-time-historical-date").is("input"), "historical start date")
    assert.ok($(".wfml-time-historical-start .wfml-time-historical-time").is("input"), "historical start time")
    
    assert.ok($(".wfml-time-historical-end .wfml-time-historical-date").is("input"), "historical end date")
    assert.ok($(".wfml-time-historical-end .wfml-time-historical-time").is("input"), "historical end time")
    
    assert.equal($(".wfml-time-historical-start .wfml-time-historical-date").prop('value'), '2019-06-07', "start date is correct")
    assert.equal($(".wfml-time-historical-start .wfml-time-historical-time").prop('value'), '07:12', "start time is correct")
    assert.equal($(".wfml-time-historical-end .wfml-time-historical-date").prop('value'), '2019-06-11', "end date is correct")
    assert.equal($(".wfml-time-historical-end .wfml-time-historical-time").prop('value'), '02:42', "end time is correct")
    
    historicalAllValid(assert)

})

function expectTimeChange(assert, tool, expectedTime, epsilon=100) {
    tool.map.layerMgr.setTime= time=>{
        assert.step('update map')
        assert.rangeEqual(time, expectedTime, epsilon, "Map updated with correct time")
        tool.map.layerMgr.time=time
        tool.map.layerMgr.onTimeChange.forEach(callback=>callback())
    }
}

// Simulate user making changes via the inputs
QUnit.module("User driven changes", ()=>{
    
    QUnit.test("Change present value", (assert)=> {
        var tool = setup("PT22H/PRESENT")

        tool.render()
        
        expectTimeChange(assert, tool, DateRange.parseWms("PT14H/PRESENT"))
        
        // Simulate user input to value
        $(".wfml-time-interval-value").val("14")
        $(".wfml-time-interval-value").trigger("change")

        assert.equal($(".wfml-time-interval-value").prop('value'), '14', "interval value is correct")
        assert.equal($(".wfml-time-interval-unit").prop('value'), 'HOURS', "interval unit is correct")
        
        assert.rangeEqual(tool.getTime(), DateRange.parseWms("PT14H/PRESENT"),1, "Tool has correct time")
        assert.verifySteps(['update map'])
    })

    QUnit.test("Change present unit", (assert)=> {
        var tool = setup("PT22H/PRESENT")

        tool.render()

        expectTimeChange(assert, tool, DateRange.parseWms("PT22M/PRESENT"))
        
        // Simulate user input to value
        $(".wfml-time-interval-unit").val("MINUTES")
        $(".wfml-time-interval-unit").trigger("change")

        assert.equal($(".wfml-time-interval-value").prop('value'), '22', "interval value is correct")
        assert.equal($(".wfml-time-interval-unit").prop('value'), 'MINUTES', "interval unit is correct")
        
        assert.rangeEqual(tool.getTime(), DateRange.parseWms("PT22M/PRESENT"),1, "Tool has correct time")
        assert.verifySteps(['update map'])
    })

    QUnit.test("Change historical start time", (assert)=> {
        var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")

        tool.render()

        expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T12:14Z/2019-06-11T09:42Z"))
        
        // Simulate user input to value
        $(".wfml-time-historical-start .wfml-time-historical-time").val("05:14")
        $(".wfml-time-historical-start .wfml-time-historical-time").trigger("change")
        
        assert.rangeEqual(tool.getTime(), DateRange.parseWms("2019-06-07T12:14Z/2019-06-11T09:42Z"),1, "Tool has correct time")
        assert.verifySteps(['update map'])
    })

    QUnit.test("Switch from present to historical", (assert)=> {
        var tool = setup("PT24H/PRESENT")

        var now = new Date(NOW)
        now.setSeconds(0)
        var past = new Interval(24, Units.HOURS).before(now)
        expectTimeChange(assert, tool, new DateRange(past, now), 5000)
       
        tool.render()

        $("#wfml-time-mode-historical").trigger("click")
        
        assert.ok($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs hidden")
        assert.notOk($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs visible")
        
        assert.verifySteps(['update map'])
    })

    QUnit.test("Switch from historical to present", (assert)=> {
        var tool = setup("2019-06-06/2019-06-07")

        expectTimeChange(assert, tool, DateRange.parseWms("PT24H/PRESENT"))

        tool.render()

        $("#wfml-time-mode-present").trigger("click")
        
        assert.notOk($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs visible")
        assert.ok($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs hidden")

        assert.verifySteps(['update map'])
    })
})

// Trigger events on inputs without changing anything.  Should not trigger a map update.
QUnit.module("No unnecessary updates", ()=>{

    QUnit.test("No unnecessary updates historical", (assert)=> {
        var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")

        tool.map.layerMgr.setTime= time=>{
            assert.step('update map')
            tool.map.layerMgr.time=time
            tool.map.layerMgr.onTimeChange()
        }

        tool.render()

        $(".wfml-time-historical-start .wfml-time-historical-date").trigger("change")
        $(".wfml-time-historical-start .wfml-time-historical-time").trigger("change")
        $(".wfml-time-historical-end .wfml-time-historical-date").trigger("change")
        $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")

        assert.verifySteps([], "no map updates")
    })

    QUnit.test("No unnecessary updates present", (assert)=> {
        var tool = setup("PT24H/PRESENT")

        tool.map.layerMgr.setTime= time=>{
            assert.step('update map')
            tool.map.layerMgr.time=time
            tool.map.layerMgr.onTimeChange()
        }

        tool.render()

        $(".wfml-time-interval-unit").trigger("change")
        $(".wfml-time-interval-value").trigger("change")

        assert.verifySteps([], "no map updates")
    })

    QUnit.test("No unnecessary updates mode present", (assert)=> {
        var tool = setup("PT24H/PRESENT")

        tool.map.layerMgr.setTime= time=>{
            assert.step('update map')
            tool.map.layerMgr.time=time
            tool.map.layerMgr.onTimeChange()
        }

        tool.render()

        $("#wfml-time-mode-present").trigger("click")

        assert.verifySteps([], "no map updates")
    })

    QUnit.test("No unnecessary updates mode present", (assert)=> {
        var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")

        tool.map.layerMgr.setTime= time=>{
            assert.step('update map')
            tool.map.layerMgr.time=time
            tool.map.layerMgr.onTimeChange()
        }

        tool.render()

        $("#wfml-time-mode-historical").trigger("click")

        assert.verifySteps([], "no map updates")
    })
})

QUnit.module("Updates from map time", ()=>{
    
    QUnit.test("Historical to Historical", (assert)=> {
        var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
        
        tool.render()
        
        tool.map.layerMgr.time = DateRange.parseWms("2019-06-10T12:12Z/2019-06-12T14:42Z")
        
        tool.updateTime()
        
        assert.ok($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs hidden")
        assert.notOk($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs visible")
        assert.equal($(".wfml-time-historical-start .wfml-time-historical-date").prop('value'), '2019-06-10', "start date is correct")
        assert.equal($(".wfml-time-historical-start .wfml-time-historical-time").prop('value'), '05:12', "start time is correct")
        assert.equal($(".wfml-time-historical-end .wfml-time-historical-date").prop('value'), '2019-06-12', "end date is correct")
        assert.equal($(".wfml-time-historical-end .wfml-time-historical-time").prop('value'), '07:42', "end time is correct")
        
    })
    
    QUnit.test("Present to Present", (assert)=> {
        var tool = setup("PT24H/PRESENT")
        
        tool.render()
        
        tool.map.layerMgr.time = DateRange.parseWms("PT10M/PRESENT")
        
        tool.updateTime()
        
        assert.notOk($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs visible")
        assert.ok($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs hidden")
        assert.equal($(".wfml-time-interval-value").prop('value'), '10', "interval value is correct")
        assert.equal($(".wfml-time-interval-unit").prop('value'), 'MINUTES', "interval unit is correct")
        
    })
    
    QUnit.test("Present to Historical", (assert)=> {
        var tool = setup("PT24H/PRESENT")
        
        tool.render()
        
        tool.map.layerMgr.time = DateRange.parseWms("2019-06-10T12:12Z/2019-06-12T14:42Z")
        
        tool.updateTime()
        
        assert.ok($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs hidden")
        assert.notOk($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs visible")
        assert.equal($(".wfml-time-historical-start .wfml-time-historical-date").prop('value'), '2019-06-10', "start date is correct")
        assert.equal($(".wfml-time-historical-start .wfml-time-historical-time").prop('value'), '05:12', "start time is correct")
        assert.equal($(".wfml-time-historical-end .wfml-time-historical-date").prop('value'), '2019-06-12', "end date is correct")
        assert.equal($(".wfml-time-historical-end .wfml-time-historical-time").prop('value'), '07:42', "end time is correct")
        
    })
    
    QUnit.test("Historical to Present", (assert)=> {
        var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
        
        tool.render()
        
        tool.map.layerMgr.time = DateRange.parseWms("PT10M/PRESENT")
        
        tool.updateTime()
        
        assert.notOk($(".wfml-time-range-present").hasClass("wfml-time-mode-hidden"), "Present inputs visible")
        assert.ok($(".wfml-time-range-historical").hasClass("wfml-time-mode-hidden"), "Historical inputs hidden")
        assert.equal($(".wfml-time-interval-value").prop('value'), '10', "interval value is correct")
        assert.equal($(".wfml-time-interval-unit").prop('value'), 'MINUTES', "interval unit is correct")
        
    })
    
})

QUnit.module("Input Validity", ()=>{
    
    QUnit.module("Present", ()=>{
        
        QUnit.test("Zero value invalid", (assert)=> {
            var tool = setup("P1D/PRESENT")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(0)
            $(".wfml-time-interval-value").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("HOURS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("MINUTES")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("SECONDS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
        })
        
        QUnit.test("Negative value invalid", (assert)=> {
            var tool = setup("P1D/PRESENT")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(-1)
            $(".wfml-time-interval-value").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("HOURS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("MINUTES")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-unit").val("SECONDS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
        })
        
        QUnit.test("Over 6 months invalid", (assert)=> {
            var tool = setup("P1D/PRESENT")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(6*31)
            $(".wfml-time-interval-value").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            // Simulate user input to value
            $(".wfml-time-interval-value").val(6*31*24)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("HOURS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(6*31*24*60)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("MINUTES")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(6*31*24*60*60)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("SECONDS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
        })
        
        QUnit.test("Over 5 days invalid", (assert)=> {
            var tool = setup("P1D/PRESENT")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(5+1)
            $(".wfml-time-interval-value").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(5*24+1)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("HOURS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(5*24*60+1)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("MINUTES")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
            
            // Simulate user input to value
            $(".wfml-time-interval-value").val(5*24*60*60+1)
            $(".wfml-time-interval-value").trigger("change")
            $(".wfml-time-interval-unit").val("SECONDS")
            $(".wfml-time-interval-unit").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-interval-value")[0].checkValidity(), "value is invalid")
            assert.ok($(".wfml-time-interval-unit")[0].checkValidity(), "unit is valid")
        })
  
    })
    
    QUnit.module("Historical", ()=>{
        
        QUnit.test("Valid start time", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T10:42Z/2019-06-11T09:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-time").val("3:42")
            $(".wfml-time-historical-start .wfml-time-historical-time").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')
            
            assert.verifySteps(['update map'])
        })
        
        QUnit.test("Valid start date", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-08T14:12Z/2019-06-11T09:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-date").val("2019-06-08")
            $(".wfml-time-historical-start .wfml-time-historical-date").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')

            assert.verifySteps(['update map'])
        })
        
        QUnit.test("No more than 6 months", (assert)=> {
            var tool = setup("2018-12-07T14:12Z/2018-12-11T09:42Z")
            
            tool.render()
 
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-date")[0].checkValidity(), "start date is invalid")
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is invalid")

            var start = new Date(NOW)
            var end = new Date(NOW)
            start.setMonth(start.getMonth()-6)
            end.setMonth(end.getMonth()-6)
            
            start.setDate(start.getDate()-2)
            end.setDate(end.getDate()-1)
            
            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-date").val(start.toISOString().split("T")[0])
            $(".wfml-time-historical-start .wfml-time-historical-date").trigger("change")
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-date").val(end.toISOString().split("T")[0])
            $(".wfml-time-historical-end .wfml-time-historical-date").trigger("change")
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-date")[0].checkValidity(), "start date is invalid")
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is invalid")
        })
        
        QUnit.test("Valid end time", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T14:12Z/2019-06-11T10:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("3:42")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')

            assert.verifySteps(['update map'])
        })
        
        QUnit.test("Valid end date", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T14:12Z/2019-06-8T09:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-date").val("2019-06-08")
            $(".wfml-time-historical-end .wfml-time-historical-date").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')
            
            assert.verifySteps(['update map'])
        })

        QUnit.test("Invalid start time", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-time").val("Not a valid time")
            $(".wfml-time-historical-start .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("Invalid end time", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("Not a valid time")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("Partial time", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("0:0")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("More than 24 hours", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("25:00")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("24 hours, plus minutes", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("24:01")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("More than 59 minutes", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("10:60")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("No colon, two digits", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("60")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')

            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "input is invalid")
        })
        
        QUnit.test("No colon start", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T10:42Z/2019-06-11T09:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-time").val("342")
            $(".wfml-time-historical-start .wfml-time-historical-time").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')
            
            assert.verifySteps(['update map'])
        })
        QUnit.test("No colon end", (assert)=> {
            var tool = setup("2019-06-07T14:12Z/2019-06-11T09:42Z")
            
            tool.render()

            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T14:12Z/2019-06-11T10:42Z"))
            
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("342")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
 
            
            historicalAllValid(assert)
            
            assert.equal(tool.inputValid(), true, 'tool reports input valid')
            
            assert.verifySteps(['update map'])
        })
        
        QUnit.test("Same day", (assert)=> {
            var tool = setup("2019-06-07T04:12Z/2019-06-07T11:42Z")
            
            tool.render()
            
            expectTimeChange(assert, tool, DateRange.parseWms("2019-06-07T04:12Z/2019-06-07T20:55Z"))

            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("13:55")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
             
            assert.equal(tool.inputValid(), true, 'tool reports input valid')
            
            historicalAllValid(assert)
            
            assert.verifySteps(['update map'])
        })
        
        QUnit.test("Same day, times backwards", (assert)=> {
            var tool = setup("2019-06-07T10:12Z/2019-06-07T11:42Z")
            
            tool.render()

            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-time").val("01:55")
            $(".wfml-time-historical-end .wfml-time-historical-time").trigger("change")
             
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-time")[0].checkValidity(), "start time is invalid")
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-time")[0].checkValidity(), "end time is invalid")
        })
        
        QUnit.test("Dates backwards", (assert)=> {
            var tool = setup("2019-06-07T10:12Z/2019-07-11T11:42Z")
            
            tool.render()

            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-date").val("2019-06-02")
            $(".wfml-time-historical-end .wfml-time-historical-date").trigger("change")
             
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-date")[0].checkValidity(), "start time is invalid")
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end time is invalid")
        })
        
        QUnit.test("Future Date", (assert)=> {
            var tool = setup("2019-06-07T10:12Z/2019-06-07T11:42Z")
            
            tool.render()

            var futureDate = new Date(NOW)
            futureDate.setDate(futureDate.getDate()+2)
            futureDate = futureDate.toISOString().split('T')[0]
            // Simulate user input to value
            $(".wfml-time-historical-end .wfml-time-historical-date").val(futureDate)
            $(".wfml-time-historical-end .wfml-time-historical-date").trigger("change")
             
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is invalid")
        })
        
        QUnit.test("Date validation respects timezone", (assert)=> {
            var tool = setup("2019-06-06T10:12Z/2019-06-07T06:30Z")
            
            tool.render()

            // Simulate user input to value
            $(".wfml-time-historical-start .wfml-time-historical-date").val("2019-06-07")
            $(".wfml-time-historical-start .wfml-time-historical-date").trigger("change")
             
            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is invalid")
        })
        
        QUnit.test("Max 5 day window", (assert)=> {
            var tool = setup("2019-06-01T10:12Z/2019-06-07T11:42Z")
            
            tool.render()

            assert.equal(tool.inputValid(), false, 'tool reports input invalid')
            
            assert.notOk($(".wfml-time-historical-start .wfml-time-historical-date")[0].checkValidity(), "start date is invalid")
            assert.notOk($(".wfml-time-historical-end .wfml-time-historical-date")[0].checkValidity(), "end date is invalid")
        })

    })
})
