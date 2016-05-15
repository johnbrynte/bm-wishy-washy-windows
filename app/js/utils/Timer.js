define([], function() {

    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(f) {
            window.setTimeout(f, 1000 / 30);
    };

    var loopFunction;
    var loop = false;
    var prevTime = (new Date()).getTime();

    var mainLoop = function() {
        if (loop) {
            if (loopFunction) {
                loopFunction(prevTime);
            }
            tick();
            window.requestAnimationFrame(mainLoop);
        }
    };

    var tick = function() {
        var time = (new Date()).getTime();
        self.time = time - prevTime;
        self.delta = (self.time > 0) ? self.time / 1000 : 0;
        prevTime = time;
    };

    var self = {
        delta: 0,
        time: 0
    };

    self.loop = function(f) {
        loopFunction = f;
        self.start();
    };

    self.start = function() {
        loop = true;
        // Start the main loop
        mainLoop();
    };

    self.stop = function() {
        loop = false;
        self.time = 0;
        self.delta = 0;
    };

    return self;

});