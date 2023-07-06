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

function initPointId() {
    $('#btn-run').click( runBtn );

    updateRequest();

    $('#sel-host').change( updateRequest );
    $('#sel-op').change( updateRequest );
    $('#txt-lat').change( updateRequest );
    $('#txt-lat').keyup( updateRequest );
    $('#txt-lon').change( updateRequest );
    $('#txt-lon').keyup( updateRequest );
}

function runBtn() {
    run();
}
function run(lonLat) {

    updateRequest(lonLat);


    var opsToRun = opsSelected();
    for (var opIndex in opsToRun) {
        var opId = opsToRun[opIndex];
        var reqId = '#request-' + opId;
        var respId = '#response-' + opId;
        var req = $(reqId).text();
        showResponse( opId, "Querying..." );
        execQuery(req, opId);
    }
}

function opsSelected() {
    var selOp = $('#sel-op').val();
    if (selOp == 'all') {
        opsToRun = [ 'geo', 'own', 'wea' ];
        return opsToRun;
    }
    // run just chosen op
    return [ selOp ];
}

function updateRequest(lonLat) {
    var lon = $('#txt-lon').val();
    var lat = $('#txt-lat').val();
    if (lonLat) {
        lon = lonLat[0];
        lat = lonLat[1];
    }
    var req = {
        host: $('#sel-host').val(),
        lat: lat,
        lon: lon
    }

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
    var url = req.host + '/' + req.op + '?lat=' + req.lat + '&lon=' + req.lon;
    return url;
}

function execQuery(url, opId) {
    $('#spin-'+opId).show();
    var timeStart = (new Date()).getTime();
    $.ajax({
        url: url
    }).then(
        function(data, status, jqxhr) {
            $('#spin-'+opId).hide();
            showTime( opId, elapsedTime() );
            showResponse( opId, JSON.stringify(data, null, 2) );
        },
        function( jqXHR, textStatus, errorThrown) {
            $('#spin-'+opId).hide();
            showError(opId, 'Status: ' + textStatus 
                + '\nHTTPS code: ' + jqXHR.status
                + '\n' + jqXHR.responseText );
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
    $(responseId).text( txt );
}

function showError(opId, txt) {
    var responseId = '#response-' + opId;
    $(responseId).text( txt );
    $(responseId).addClass('response-error');
}

function showTime(opId, txt) {
    var id = '#response-time-' + opId;
    $(id).text( txt );
}


