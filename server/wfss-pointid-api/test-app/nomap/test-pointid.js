var OPS = {
    geo: {
        requestOp: "geography"
    },
    own: {
        requestOp: "ownership"
    },
    wea: {
        requestOp: "weather"
    }
}


$(document).ready(function() {
    $('#btn-run').click( run );

    updateRequest();

    $('#sel-host').change( updateRequest );
    $('#sel-op').change( updateRequest );
    $('#txt-lat').change( updateRequest );
    $('#txt-lat').keyup( updateRequest );
    $('#txt-lon').change( updateRequest );
    $('#txt-lon').keyup( updateRequest );
});

function run() {
    //var endp = "https://dlvrapps.nrs.gov.bc.ca/pub/wfss";
    //var op = "geography";

    updateRequest();
    for (var opId in OPS) {
        var reqId = '#request-' + opId;
        var respId = '#response-' + opId;
        var req = $(reqId).text();
        showResponse(opId, "Querying..." );
        execQuery(req, opId);
    }

}


function updateRequest() {
    var req = {
        host: $('#sel-host').val(),
        lat: $('#txt-lat').val(),
        lon: $('#txt-lon').val()
    }
    var opId = $('#sel-op').val();

    for (var opId in OPS) {
        req.op = OPS[opId].requestOp;
        showRequest(opId, req);
    }
}
function showRequest(opId, req) {
    var url = queryUrl(req);
    $('#request-'+opId).text(url);
    return url;
}
function queryUrl(req) {
    var url = req.host + '/v1/' + req.op + '?lat=' + req.lat + '&lon=' + req.lon;
    return url;
}

function execQuery(url, opId) {
    var timeStart = (new Date()).getTime();
    $.ajax({
        url: url
    }).then(
        function(data, status, jqxhr) {
            showTime( opId, elapsedTime() );
            showResponse( opId, JSON.stringify(data, null, 2) );
        },
        function(jqXHR, textStatus, errorThrown) {
            showError(opId, 'Status: ' + textStatus 
                + '\nHTTPS code: ' + jqXHR.status
                + '\n' + jqXHR.responseText);
        }

    );

    function elapsedTime() {
        var timeEnd = (new Date()).getTime();
        var ms = timeEnd - timeStart;
        return ms;
    }
}

function showResponse(opId, txt) {
    var responseId = '#response-' + opId;
    $(responseId).removeClass('response-error');
    $(responseId).text(txt);
}

function showError(opId, txt) {
    var responseId = '#response-' + opId;
    $(responseId).text( txt );
    $(responseId).addClass('response-error');
}

function showTime(opId, txt) {
    var id = '#response-time-' + opId;
    $(id).text(txt);
}


