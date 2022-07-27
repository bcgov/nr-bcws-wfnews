( function ( worker ) {
    var pathTokens = []

    worker.addEventListener( 'fetch', event => {
        var url = event.request.url

        var pt = pathTokens.find( function ( p ) {
            return p.pathPattern.test( url )
        } )
        if ( !pt ) return

        event.respondWith( fetch( url, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache',
            headers: {
                'Authorization': 'Bearer ' + pt.token
            }
        } ) )
    } )

    worker.addEventListener( 'message', event => {

        var type = event.data.type
        if ( type == 'token-for-path' ) {
            var id = event.data.id
            var i = pathTokens.findIndex( function ( p ) {
                return id = p.id
            } )
            if ( i == -1 ) {
                pathTokens.push( {
                    id: id,
                    pathPattern: event.data.pathPattern,
                    token: event.data.token
                } )
            }
            else {
                pathTokens[ i ].token = event.data.token
            }
        }
    } )
} )( self )

importScripts( './ngsw-worker.js' )
