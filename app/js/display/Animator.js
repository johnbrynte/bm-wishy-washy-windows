define([
    'lib/three',
    'lib/tween'
], function(
    THREE,
    TWEEN
) {

    var Animator = function(mesh, transitionTime) {
        this.animation = null;
        this.currentTime = 0;
        this.playing = false;

        this.transitionTime = transitionTime != undefined ? transitionTime : 400;

        this.animations = {};
        for (var i = 0; i < mesh.geometry.animations.length; i++) {
            var a = mesh.geometry.animations[i];
            this.animations[a.name] = new THREE.Animation(mesh, a);
            this.animations[a.name].interpolationType = THREE.AnimationHandler.CATMULLROM;
            this.animations[a.name].weight = 0;
        }

        var that = this;
    };

    Animator.prototype.play = function(name, time, callback) {
        if (name instanceof Array) {
            // Play a series of animations right after one another
            this.play(name[0], time, function() {
                this.play(name.shift(), time);
            }.bind(this));
        } else if (name == null) {
            this.stop();
        } else {
            var sourceAnimation = this.animation;
            var destinationAnimation = this.animations[name];
            if (destinationAnimation) {
                if (!this.playing) {
                    this.playing = true;
                    // All animations are started in order to easily switch between them
                    // (an animation with weight = 0 will not play)
                    for (var a in this.animations) {
                        this.animations[a].play(this.animations[a].currentTime, this.animations[a].weight);
                    }
                }

                if (name) {
                    // Distribute the weight to the new animation
                    this.tween = new TWEEN.Tween({
                        weight: 0
                    }).to({
                        weight: 1
                    }, this.transitionTime)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .onUpdate(function() {
                            if (sourceAnimation) {
                                sourceAnimation.weight = 1 - this.weight;
                            }
                            destinationAnimation.weight = this.weight;
                        })
                        .onComplete(function() {
                            if (callback instanceof Function) {
                                callback();
                            }
                        }).start();
                    this.animation = destinationAnimation;

                    if (time != undefined & time) {
                        this.animation.timeScale = 1000 * this.animation.data.length / time;
                    }
                }
            }

        }
    };

    Animator.prototype.playFromStart = function(name, time, callback) {
        // reset all animations to the first frame
        for (var a in this.animations) {
            this.animations[a].currentTime = 0;
        }
        this.play(name, time, callback);
    };

    Animator.prototype.stop = function() {
        if (this.playing) {
            this.playing = false;
            this.currentTime = this.animation.currentTime;
            for (var a in this.animations) {
                this.animations[a].stop();
            }
        }
    };

    Animator.prototype.exists = function(a) {
        return a in this.animations;
    };

    return Animator;

});