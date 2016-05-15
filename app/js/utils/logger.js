define([], function() {
    //TODO : make this awesome.
    var self = {};

    self.info = function() {
        console.info.apply(console, arguments);
    };

    self.debug = function() {
        console.debug.apply(console, arguments);
    };

    self.warning = function() {
        console.warning.apply(console, arguments);
    };

    /*
        This should probably be made somewhat nicer...
    */
    self.log = function() {
        console.log.apply(console, arguments);
    };

    return self;
});