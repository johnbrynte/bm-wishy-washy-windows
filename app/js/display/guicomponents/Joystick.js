/**
 * A joystick component for input!
 */
define([
    './GUIComponent',
    'display/AssetManager',
    './Button',
    'EventManager',
    'utils/animation'
], function(
    GUIComponent,
    AssMan,
    Button,
    evtMgr,
    Animation
) {
    var Joystick = function(width, height) {

        GUIComponent.call(this, width, height);

        this.width = width;
        this.height = height;

        var thirdOfW = this.width / 3;
        var thirdOfH = this.height / 3;

        // Add buttons
        var buttons = {
            UP: new Button(thirdOfW, thirdOfH).setPosition(thirdOfW, 0),
            RIGHT: new Button(thirdOfW, thirdOfH).setPosition(2 * thirdOfW, thirdOfH),
            DOWN: new Button(thirdOfW, thirdOfH).setPosition(thirdOfW, 2 * thirdOfH),
            LEFT: new Button(thirdOfW, thirdOfH).setPosition(0, thirdOfH),
        };

        var that = this;

        // TODO: This should call party and request a move for the active character
        Animation.addInterval(function() {
            if (typeof activeButton !== "undefined" && activeButton) {


                activeButton = null;
            }
        }, 200);

        // run when a button is activated/clicked
        var activateButton = function(evt, buttonName) {
            console.log("joystick activate button " + buttonName);
            //var keyCode = "Joystick" + buttonName;
            var keyCode = "Joystick" + buttonName;

            activeButton = buttonName;

            console.log(" - joystick move to '" + activeButton + "'");
            evtMgr.trigger("move", {
                direction: activeButton
            });

            evtMgr.trigger("keyPressed", {
                keyCode: "Joystick" + keyCode
            });
        }

        // run when a button is deactivated
        var deactivateButton = function(evt, buttonName) {

        }

        Object.keys(buttons).forEach(function(buttonName) {
            buttons[buttonName]
                .on('mousedown', function(evt) {
                    activateButton(evt, buttonName);
                })
                .on('touchstart', function(evt) {
                    activateButton(evt, buttonName);
                })
                .on('touchenter', function(evt) {
                    activeButton = buttonName.toLowerCase();
                    activateButton(evt, buttonName);
                });

            that.addChild(buttons[buttonName]);
        })

        this.buttons = buttons;

        // Deactivate buttons on mouseleave etc.
        var deactivateEvents = ['mouseleave', 'mouseup', 'touchend', 'touchleave'];
        for (var i = deactivateEvents.length - 1; i >= 0; i--) {
            this.on(deactivateEvents[i], this.deactivate.bind(this));
        };
    };

    Joystick.prototype = Object.create(GUIComponent.prototype);

    /**
     * Overrides setSize for GUIComponent to change size of children as well
     * @param {Number} width
     * @param {Number} height
     */
    Joystick.prototype.setSize = function(width, height) {
        console.warn('Panel does not yet support resize after creation.');

        this.width = width;
        this.height = height;

        /*
        var thirdOfW = this.width / 3;
        var thirdOfH = this.height / 3;

        // Set new sizes and positions for buttons
        this.buttons.UP
            .setPosition(thirdOfW, 0)
            .setSize(thirdOfW, thirdOfH);
        this.buttons.RIGHT
            .setPosition(2 * thirdOfW, thirdOfH)
            .setSize(thirdOfW, thirdOfH);
        this.buttons.DOWN
            .setPosition(thirdOfW, 2 * thirdOfH)
            .setSize(thirdOfW, thirdOfH);
        this.buttons.LEFT
            .setPosition(0, thirdOfH)
            .setSize(thirdOfW, thirdOfH);
        */

        return this;
    };

    /**
     * Deactivate the joystick by deactivating (i.e. "releasing") any pressed
     * down buttons. For, when example, the nouse is released from the joystick
     * outside of a button's area.
     * @param  {Object} evt The event that triggered the deactivation (optional)
     */
    Joystick.prototype.deactivate = function(evt) {
        Object.keys(this.buttons).forEach(function(bName) {
            var b = this.buttons[bName];
            if (b.selected) {
                b.deselect(evt);
                var keyCode = "Joystick" + bName;

                activeButton = null;

                evtMgr.trigger("keyReleased", {
                    keyCode: "Joystick" + bName
                });
            }
        }.bind(this));

        return this;
    };

    return Joystick;
});