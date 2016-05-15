/**
 * Extends GUIComponent and is the director of all visuals as well as input
 */
define([
    './GUIComponent',
    'EventManager',
    'display/gui/GUICanvas',
    'display/guicomponents/Button'
], function(
    GUIComponent,
    evtMgr,
    GUICanvas,
    Button
) {

    /**
     * Initializes this Director
     * @param  {[type]} width  [description]
     * @param  {[type]} height [description]
     * @return {[type]}        this context
     */
    var Director = function(AssMan) {
        GUIComponent.call(this);
        this.name = "director";
        var that = this;

        this.AssMan = AssMan;

        this.gui = new GUICanvas(AssMan.width, AssMan.height);
        window.director = this; // Nothing happened here, move along..

        this.setPosition(0, 0);
        this.setSize(AssMan.width, AssMan.height);

        //this.setZIndex(-10000);
        this.object3d.position.z = -10000;

        // Add event listeners
        /**
         * Returns an event handler for position based/dependent/interested events.
         * "this", in this function, should be the object that wants to listen for events.
         * @param  {String} eventName Event name (click, touchstart etc.)
         * @return {function} A function that extracts x and y coordinates of
         *                    the event and then triggers the listener object for this event.
         */
        this.prevTouchEvent;
        var positionEventHandler = function(eventName) {
            var fn = function(evt) {
                if (evt.type !== 'click' && evt.touches) { // For touch events
                    if (evt.touches.length === 0) {
                        //touchend (on last remaining point of touch)
                        evt.x = this.prevTouchEvent.x;
                        evt.y = this.prevTouchEvent.y;
                    } else {
                        // only care about first touch as of now, no multitouch nonon
                        evt.x = evt.touches[0].pageX;
                        evt.y = evt.touches[0].pageY;
                    }

                    this.prevTouchEvent = evt;
                } else {
                    evt.x = evt.pageX || evt.screenX;
                    evt.y = evt.pageY || evt.screenY;
                }

                this.trigger(eventName, evt);
            }
            return fn.bind(this);
        }
        var positionEvents = Object.keys(this.events);
        for (var i in positionEvents) {
            window.addEventListener(positionEvents[i], positionEventHandler.call(this, positionEvents[i]));
        }

        this.listenToKeys = true;
        this.lastKeyTime = Date.now();

        window.addEventListener("keydown", function(evt) {
            //evt.preventDefault();
            evtMgr.trigger("keyPressed", evt);
            //console.log("- keydown for " + evt.keyCode);
            //console.dir(evt);

            switch (evt.keyCode) {
                case 39:
                    evt.direction = "right";
                    break;
                case 37:
                    evt.direction = "left";
                    break;
                case 38:
                    evt.direction = "up";
                    break;
                case 40:
                    evt.direction = "down";
                    break;
            }

            var diff = Date.now() - this.lastKeyTime;
            this.lastKeyTime = Date.now();
            if (diff < 200) {
                console.log("-- throttling key input");
                this.listenToKeys = false;
                setTimeout(function() {
                    this.listenToKeys = true;
                }.bind(this), 250);
            }
            //console.log("dir="+evt.direction+", listen="+this.listenToKeys);
            if (evt.direction && this.listenToKeys) {
                if (evt.shiftKey) {
                    //console.log("sending dig");
                    evtMgr.trigger("dig", evt);
                } else {
                    //console.log("      triggering move");
                    evtMgr.trigger("move", evt);
                }
            }
            //
            // DEBUG animation
            //
            else if (evt.keyCode === 49) {
                evtMgr.trigger("animate", "walk");
            } else if (evt.keyCode === 50) {
                evtMgr.trigger("animate", "attack");
            } else if (evt.keyCode === 51) {
                evtMgr.trigger("animate", "attack2");
            } else if (evt.keyCode === 52) {
                evtMgr.trigger("animate", "hurt");
            } else if (evt.keyCode === 53) {
                evtMgr.trigger("animate", "death");
            } else if (evt.keyCode === 54) {
                evtMgr.trigger("animate", "dance");
            } else if (evt.keyCode === 55) {
                evtMgr.trigger("animate", "run");
            }

        }.bind(this));

        window.addEventListener("keyup", function(evt) {
            evtMgr.trigger("keyReleased", evt);
        });
    };

    Director.prototype = Object.create(GUIComponent.prototype);

    Director.prototype.draw = function() {
        if (this.gui.needsUpdate) {
            this.gui.clear();

            if (this.visible && this.display !== undefined && this.display !==
                null) {
                this.display.draw();
            }
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].draw();
            }

            this.gui.update();
        }
    };

    Director.prototype.newChild = function() {
        var newGUIC = new GUIComponent();
        this.addChild(newGUIC);
        return newGUIC;
    };

    Director.prototype.createButton = function(x, y, width, height, string, onclick) {
        console.warn('Use Button instead');

        var butt = new GUIComponent(width, height)
            .setDisplay(this.AssMan.Panel(this.AssMan.images.border, width, height, 9, 9));
        var text = this.AssMan.Text(string)
            .setTextSize(20);
        var textWidth = text.getTextWidth();
        var textHeight = text.getTextHeight();
        var textcomponent = new GUIComponent()
            .setDisplay(text)
            .setPosition(10, 10);
        butt.addChild(textcomponent);

        butt.setPosition(x, y);

        // overwrite the setText function
        butt.setText = function(string) {
            text.setText(string);
        };

        butt.on('click', onclick).on('touchstart', onclick);

        butt.activate = function() {
            onclick();
        }

        return butt;
    };

    Director.prototype.createIconButton = function(x, y, width, height, image, onclick) {
        var butt = new GUIComponent(width, height)
            .setDisplay(this.AssMan.Sprite(image, width, height, image.width, image.height))
            .setPosition(x, y);

        butt.on('click', onclick).on('touchstart', onclick);

        butt.activate = function() {
            onclick();
        }

        return butt;
    };

    Director.prototype.createTextComponent = function(string, textSize) {
        console.warn('Use TextComponent instead');

        var text = this.AssMan.Text(string).setTextSize(textSize);
        var textComponent = new GUIComponent()
            .setDisplay(text)
            .setSize(text.getTextWidth(), text.getTextHeight());

        textComponent.setText = function(string) {
            text.setText(string);
        };

        textComponent.setColor = function(color) {
            text.setColor(color);
        };

        return textComponent;
    };

    return Director;
});