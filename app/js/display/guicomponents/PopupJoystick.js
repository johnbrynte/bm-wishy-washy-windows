/**
 * A dynamic contextual or whatever you call it, temporary popup joystick
 */
define([
    './GUIComponent',
    './Joystick'
], function(
    GUIComponent,
    Joystick
) {
    var PopupJoystick = function() {
        console.log("--- popup joystick called.");
        GUIComponent.call(this, 200, 200);

        this.joystick = new Joystick(200, 200);
        this.joystick.setVisible(false);
        this.joystick.setPosition(100, 100);

        this.buttonNames = Object.keys(this.joystick.buttons);

        //this.on('touchstart', this.onTouchStart.bind(this));
        //this.on('mousedown', this.onTouchStart.bind(this));

        //this.on('touchend', this.onTouchEnd.bind(this));
        //this.on('mouseup', this.onTouchEnd.bind(this));

        // Activate joystick buttons on touchenter (set their display)
        Object.keys(this.joystick.buttons).forEach(function(bName) {
            this.joystick.buttons[bName].on('touchenter', function(evt) {
                //this.joystick.buttons[bName].setDisplay(this.joystick.buttons[bName].displays.active);
            }.bind(this));
            this.joystick.buttons[bName].on('click', function(evt) {
                //this.joystick.buttons[bName].setDisplay(this.joystick.buttons[bName].displays.active);
            }.bind(this));
        }.bind(this));

        // Toggle popup joystick with mouse click
        this.on.call(this, 'click', function(evt) {
            // Don't toggle when the click was on a direction button
            var onButton = false;
            Object.keys(this.joystick.buttons).forEach(function(bName) {
                var butt = this.joystick.buttons[bName];
                console.log(butt, evt.x, evt.y, butt.isInside(evt.x, evt.y));
                if (butt.isInside(evt.x, evt.y)) {
                    onButton = true;
                }
            }.bind(this));

            // Toggle joystick if click was not on a button or if it's invisible
            if (!onButton || !this.joystick.visible) {
                console.log("popupjoystick onclick called, toggle joystick..");
                //this.joystick.setVisible(!this.joystick.visible);
                this.joystick.setPosition(evt.x - this.x - this.joystick.width / 2,
                    evt.y - this.y - this.joystick.height / 2);
                console.log(this);
            }
        }.bind(this));

        this.addChild(this.joystick);
    }

    PopupJoystick.prototype = Object.create(GUIComponent.prototype);

    PopupJoystick.prototype.onTouchStart = function(evt) {
        //console.log("popup joystick got touchstart joystick visible = "+this.joystick.visible);
        this.joystick.setVisible(!this.joystick.visible);
        this.joystick.setPosition(evt.x - this.x - this.joystick.width / 2, evt.y - this.y - this.joystick.height / 2);
        //console.log("after setVisible joystick visible = "+this.joystick.visible);
    };

    PopupJoystick.prototype.onTouchEnd = function(evt) {
        this.joystick.setVisible(false);
        this.buttonNames.forEach(function(bn) {
            this.joystick.buttons[bn].deselect();

            // TODO: Send deactivate-event to controller
            // touchend is not triggered on children (buttons) since they are not visible
        }.bind(this))
    };

    PopupJoystick.prototype.onDraw = function(ctx) {
        console.log("====== popupjoystick ondraw called, joystick is " + this.joystick);
        this.joystick.onDraw(ctx);
    };

    //PopupJoystick.prototype = Object.create(GUIComponent.prototype);


    PopupJoystick.prototype.setSize = function(w, h) {
        //GUIComponent.prototype.setSize.call(this, w, h);

        this.joystick.setSize(200, 200);

        return this;
    };

    return PopupJoystick;
});