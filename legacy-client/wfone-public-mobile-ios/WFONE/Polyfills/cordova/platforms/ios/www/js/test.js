
(function () {
    var app = {
        initialize: function () {
            this.bindEvents();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        onDeviceReady: function () {
            console.log("test.js device ready");
//            console.log("connection state is: " + window.navigator.connection.type);

        },
    };

    app.initialize();

})();
