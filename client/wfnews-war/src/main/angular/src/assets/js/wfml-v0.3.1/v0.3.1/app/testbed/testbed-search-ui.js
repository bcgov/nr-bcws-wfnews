( function () {

SearchUI = function( mapapi ) {
    this.mapapi = mapapi;
    this.search = mapapi.search;
    this.anchorLoc = null;
    this.init();
}

SearchUI.prototype.init = function() {
    var self = this;

    $( '#search-callback' )
        .change( function ( ev ) {
            if ( ev.target.checked )
                self.search.setResultHandler( function ( state ) { self.update( state ) } )
            else
                self.search.setResultHandler( null )
        } )
        .val( true )
        .change()

    $( '#search-max-distance' )
        .change( function ( ev ) {
            self.search.setMaximumDistance( parseInt( ev.target.value ) );
        } )
        .val( '50' )
        .change()

    $( '#search-max-results' )
        .val( 10 )

    $('#search-txt-place').keyup( function() {
        var txt = $('#search-txt-place').val();
        self.search.findPlace( txt );
    });
    
    $('#search-txt-road').keyup( searchRoadOrInt );
    $('#search-txt-intersection').keyup( searchRoadOrInt );

    function searchRoadOrInt() {
        var txt1 = $('#search-txt-road').val().trim();
        var txt2 = $('#search-txt-intersection').val().trim();

        tableRowsRemove("#search-item-road");
        tableRowsRemove("#search-item-intersection");

        if ( ! txt1) return;
        if (! txt2 ) {
            self.search.findRoad( txt1 );
        }
        else {
            self.search.findIntersection( txt1, txt2 );
        }
    }
    $('#search-clear').click(function() {
        self.search.clear();
        tableRowsRemove("#search-item-place");
        tableRowsRemove("#search-item-road");
        tableRowsRemove("#search-item-intersection");
        $('#search-txt-place').val("");
        $('#search-txt-road').val("");
        $('#search-txt-intersection').val("");
        $('#search-anchor-txt').val("");
    });

    $('#search-zoom').click(function() {
        self.search.zoomToAnchor();
    });
    
    $('#search-pan').click(function() {
        self.search.panToAnchor();
    })

    $('#search-set-pt').click(function() {
        self.setPointFromMap();
    })
}

SearchUI.prototype.setAnchor = function( pt, name )  {
    var txt = name ? name : '';
    this.search.setAnchor( pt );
    this.showLocation(pt, txt);
}

SearchUI.prototype.update = function( state )  {
    tableRowsRemove("#search-item-place");
    $("#search-item-place").append( this.createLocRows$( state.places, true ));

    tableRowsRemove("#search-item-road");
    $("#search-item-road").append( this.createLocRows$( state.roads, false ));

    tableRowsRemove("#search-item-intersection");
    $("#search-item-intersection").append( this.createLocRows$( state.intersections, false ));
}

SearchUI.prototype.showLocation = function( pt, name )  {
    var txt = WFML.Search.formatDDM( pt[1] ) + ", " + WFML.Search.formatDDM( pt[0]);
    $('#search-anchor-txt').val( txt );
}

SearchUI.prototype.createLocRows$ = function( locs, showType ) {
    var rows = [];
    var self = this;
    var max = parseInt( $( '#search-max-results' ).val() )
    locs.slice(0,max).forEach(function(loc, i) {
        rows.push( self.createLocRow$( loc, showType ));
    });
    return rows;
}
SearchUI.prototype.createLocRow$ = function( loc, showType) {
    var self = this;
    var $r = $('<tr>')
        .toggleClass( 'search-is-anchor', !!loc.isAnchor )
        .append( $('<td class="search-item-name">').text( loc.name) );
    if (showType) {
        $r = $r.append( $('<td class="search-item-type">').text( loc.type  ) );
    }
    $r = $r
        .append( $('<td class="search-item-dist">').text( WFML.Search.formatDistance(loc.dist, 'km')   ) )
        .append( $('<td class="search-item-dist">').text( loc.direction ) )
        /*
        .append( $('<td>').text( WFML.Search.formatDDM( loc.loc[1]) ) )
        .append( $('<td>').text( WFML.Search.formatDDM( loc.loc[0]) ) );
        */
    $r.attr('title', loc.name +  ' - '  + loc.type )
    $r.click( function() { 
        //$("#search-item-place").find(".show-place").removeClass("show-place");
        var pt = loc.loc;
        self.search.setAnchor( pt );
        self.showLocation(pt, loc.name);
    });
    $r.hover( function() { 
        self.hover( loc );
    }, function() {
        self.hover( );
    });

    return $r;
}

SearchUI.prototype.setPointFromMap = function( )  {
    var pt = this.mapapi.selectPoint.get();
    if (! pt) return;
    this.mapapi.selectPoint.clear();
    this.setAnchor( pt );
}
SearchUI.prototype.hover = function( loc ) {
    if (loc) {
        this.search.showCandidate( loc );
    }
    else {
        this.search.showCandidate();
    }


}

function tableRowsRemove(sel) {
    $(sel).find("tr:gt(0)").remove();
}

} )();