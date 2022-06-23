function Tab( ) {
    var self = this;
    $('.tab-item').click( function() {
        self.show(this);
    })
}

Tab.prototype.show = function ( tabItem ) {
    var name = null;
    if (! tabItem.id) {
        name = tabItem;
    }
    else {
        var id = tabItem.id;
        name = id.substring( "tab-item-".length );
    }
    $('.tab-panel').hide();
    $('#tab-'+name).show();

}