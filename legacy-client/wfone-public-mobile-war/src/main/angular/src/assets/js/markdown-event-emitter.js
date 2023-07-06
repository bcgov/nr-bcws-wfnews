var markdownEventEmitter = window[ 'markdownEventEmitter' ] = {}

var eventHandler = {}

markdownEventEmitter.emit = function ( event, arg ) {
    if ( !event ) throw Error( 'no event' )

    if ( !eventHandler[ event ] ) return

    eventHandler[ event ].forEach( function ( h ) {
        try {
            h( {
                event: event,
                arg: arg
            } )
        }
        catch ( e ) {
            console.warn( e )
        }
    } )
}

markdownEventEmitter.on = function ( event, handler ) {
    if ( !event ) throw Error( 'no event' )

    if ( !eventHandler[ event ] )
        eventHandler[ event ] = []

    eventHandler[ event ].push( handler )
}

markdownEventEmitter.off = function ( event, handler ) {
    if ( !event ) throw Error( 'no event' )

    if ( !handler ) {
        delete eventHandler[ event ]
        return
    }

    if ( !eventHandler[ event ] ) return

    eventHandler[ event ] = eventHandler[ event ].filter( function ( h ) {
        return h !== handler
    } )
}
