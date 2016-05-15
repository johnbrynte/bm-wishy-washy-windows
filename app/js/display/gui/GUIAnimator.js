/**
 * Module for handling animation of GUIComponents.
 */
define([], function() {

    var self = {};

    var animations = {};

    var nextAnimationID = 0;

    var now = Date.now();
    var kill = null;

    self.easing = {
        'LINEAR': function(d) {
            return d;
        },
        'SMOOTH': function(d) {
            return 2 * d - Math.pow(d, 2);
        }
    };

    /**
     * Updates all the ongoing animations.
     * Relies on continous updating.
     */
    self.update = function() {
        var key;
        now = Date.now();
        for (key in animations) {
            if (!animations[key]._animationLoop()) {
                kill = key;
            }
        }
        if (kill) {
            delete animations[kill];
        }
    };

    /**
     * Animates supported attributes of GUIComponents.
     * @param {GUIComponent} component A GUIComponent.
     * @param {Object}       options   An Object containing target values for attributes
     *                                 to animate. Supported attributes: [x, y, width, height]
     * @param {Number}       duration  Duration of the animation.
     * @param {Function}     callback  Called on animation end.
     * @param {Function}     easing    An easing function.
     */
    self.animate = function(component, options, duration, callback, easing) {
        var id, ranges,
            anim = options;

        anim._component = component;
        if (typeof duration == 'undefined') {
            duration = 1000;
        }
        anim._duration = duration;
        if (typeof easing == 'function') {
            anim._easing = easing;
        } else {
            anim._easing = self.easing.LINEAR;
        }
        anim._callback = callback;

        ranges = {};
        for (var attr in options) {
            if (typeof component[attr] != 'undefined') {
                ranges[attr] = {
                    'from': component[attr],
                    'to': options[attr]
                };
            }
        }

        function getValue(d, from, to) {
            return from + d * (to - from);
        };

        /**
         * The function where the actual animation take place.
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        anim._loop = function(d) {
            var val;
            for (var attr in ranges) {
                val = ranges[attr].from + d * (ranges[attr].to - ranges[attr].from);

                switch (attr) {
                    case 'x':
                        component.setPosition(val, component.y);
                        break;
                    case 'y':
                        component.setPosition(component.x, val);
                        break;
                    case 'width':
                        component.setSize(val, component.height);
                        break;
                    case 'height':
                        component.setSize(component.width, val);
                }
            }
        };

        /**
         * The function returns true if the animation is still
         * running, otherwise false.
         */
        anim._animationLoop = function() {
            // Only loop if needed
            if (now - anim._prevTime > 0) {
                // Call the loop function with the new value
                anim._delta += (now - anim._prevTime) / anim._duration;
                if (anim._delta > 1) {
                    anim._delta = 1;
                }
                anim._prevTime = now;
                anim._loop(Math.abs(anim._easing(anim._delta)));
            }

            if (now - anim._startTime < anim._duration) {
                return true;
            }
            // In case the easing function is bad
            anim._loop(1);
            if (anim._callback) {
                anim._callback();
            }
            if ( !! anim.continuous) {
                // restart the loop
                anim._startTime = now;
                anim._delta = 0;
                return true;
            }

            return false;
        };

        anim._delta = 0;
        // Reset the timer
        anim._startTime = now;
        anim._prevTime = anim._startTime;

        id = nextAnimationID;
        animations[id] = anim;
        nextAnimationID++;

        return id;
    };

    self.removeAnimation = function(id) {
        if (id in animations) {
            delete animations[id];
        }
    };

    return self;

});