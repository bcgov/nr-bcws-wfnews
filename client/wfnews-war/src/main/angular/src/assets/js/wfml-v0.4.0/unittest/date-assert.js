import {PRESENT, Interval} from '../wfml/date.js'

function rangePartEqual(a, b, epsilon){
    if(a==PRESENT && b==PRESENT) return true
    if(a instanceof Interval && b instanceof Interval && a.value==b.value && a.unit==b.unit) return true
    if(a instanceof Date && b instanceof Date && Math.abs(a.valueOf()-b.valueOf())<=epsilon) return true
    return false
}

QUnit.extend(QUnit.assert, {
    /**
     * Assert that two dates are within an epsillon (in milliseconds) of one another
     */
    dateEqual: function(actual, expected, epsilon, message){
        this.pushResult({
            result: rangePartEqual(actual, expected, epsilon),
            actual: actual,
            expected: expected,
            message: message
        })
    },
    /**
     * Assert that two intervals are equal to one another
     */
    intervalEqual: function(actual, expected, message){
        this.pushResult({
            result: rangePartEqual(actual, expected, 0),
            actual: actual,
            expected: expected,
            message: message
        })
    },
    /**
     * Assert to ranges are equal, with date components within epsilon
     */
    rangeEqual:  function(actual, expected, epsilon, message){
        this.pushResult({
            result: rangePartEqual(actual.start, expected.start, epsilon)&&rangePartEqual(actual.end, expected.end, epsilon),
            actual: actual,
            expected: expected,
            message: message
        })
    }
})  
