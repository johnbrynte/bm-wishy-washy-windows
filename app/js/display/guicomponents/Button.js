/**
 *  Button.js
 */
define([
    'display/AssetManager',
    './GUIComponent',
    './TextComponent'
], function(
    AssMan,
    GUIComponent,
    TextComponent
) {

    var Button = function(width, height) {
        GUIComponent.call(this, width, height);

        this.fixedSize = false;

        this.selectable = false;
        this.selected = false;

        this.padding.up = this.padding.down = 0;
        this.padding.right = this.padding.left = 10;

        this.borderWidth = 10;
        this.borderHeight = 10;

        this.displays = {
            active: AssMan.Panel(AssMan.images.button_active, this.width, this.height, this.borderWidth, this.borderHeight),
            inactive: AssMan.Panel(AssMan.images.button, this.width, this.height, this.borderWidth, this.borderHeight)
        };

        this.text = new TextComponent();
        this.addChild(this.text);

        this.setDisplay(this.displays.inactive);
        this.setSize(this.width, this.height);

        var that = this;

        this.on('click', (function(evt) {
            if (this.selectable === true) {
                this.selected ? this.deselect(evt) : this.select(evt);
                console.log("Button selected = " + this.selected);
                this.trigger("select", {
                    selected: this.selected
                });
            }
        }).bind(this));

        this.on('touchstart', this.select.bind(this));
        this.on('mousedown', this.select.bind(this));

        this.on('touchend', this.deselect.bind(this));
        this.on('mouseup', this.deselect.bind(this));
    };

    Button.prototype = Object.create(GUIComponent.prototype);

    Button.prototype.select = function(evt) {
        if (this.selectable) {
            this.setDisplay(this.displays.active);
            this.trigger("select", evt);
            this.selected = true;
        }
    };

    Button.prototype.deselect = function(evt) {
        if (this.selectable) {
            this.trigger("deselect", evt);
            this.setDisplay(this.displays.inactive);
            this.selected = false;
        }
    };

    /**
     * Set images for this button
     * @param {Image} imagesObject Possible keys: active,inactive
     */
    Button.prototype.setButtonImages = function(imagesObject) {
        var active = AssMan.images.bluemoon,
            inactive = AssMan.images.bluemoon;

        if (imagesObject) {
            this.imagesObject = imagesObject;
            if (imagesObject.borderWidth) {
                this.borderWidth = imagesObject.borderWidth;
            }
            if (imagesObject.borderHeight) {
                this.borderHeight = imagesObject.borderHeight;
            }
            if (imagesObject.active) {
                this.displays.active.setImage(imagesObject.active, this.borderWidth, this.borderHeight);
            }
            if (imagesObject.inactive) {
                this.displays.inactive.setImage(imagesObject.inactive, this.borderWidth, this.borderHeight);
            }
        }

        return this;
    };

    Button.prototype.setSelected = function(sel) {
        this.setDisplay(sel ? this.imagesObject.active : this.imagesObject.inactive);
    };

    /**
     * Set the text for this button
     * @param {String} string Text as a string
     */
    Button.prototype.setText = function(string) {
        this.text.setText(string);
        this.fitTextToButtonSize();

        /*
        var text = this.gui.createText(text, 16)
            .setSize(50)
            .setColor("#eee");
        butt.addChild(new GUIComponent().setDisplay(text).setPosition(10, 10));
        */
        /*
        var ctxt = AssMan.Text(string)
            .setTextSize(this.textSize)
            .setColor(0xffffff);
        //ctxt.setPos(0,0);
        this.text.setDisplay(ctxt);
        this.text.setVisible(true);

        this.text.alignToParent({
            top: 35,
            left: 30
        });
*/
        //this.text.setPosition(this.x+30, this.y-200);

        //this.updateSize();

        return this;
    };

    /**
     * Set the text size for this button
     * @param {[type]} textSize [description]
     */
    Button.prototype.setTextSize = function(textSize) {
        this.text.setTextSize(textSize);
        this.fitTextToButtonSize();

        return this;
    };

    /**
     * Set the text color for this button
     */
    Button.prototype.setTextColor = function(color) {
        this.text.setTextColor(color);

        return this;
    };

    Button.prototype.fitTextToButtonSize = function() {
        if (!this.fixedSize) {
            var width = this.width;
            var height = this.height;
            if (this.text.width > width - this.padding.left - this.padding.right - 2 * this.borderWidth) {
                width = this.text.width + this.padding.left + this.padding.right + 2 * this.borderWidth;
            }
            if (this.text.height > height - this.padding.up - this.padding.down - 2 * this.borderHeight) {
                height = this.text.height + this.padding.up + this.padding.down + 2 * this.borderHeight;
            }
            if (width != this.width || height != this.height) {
                this.setSize(width, height);
            }
        }
        this.text.alignToParent({
            centerX: 0,
            centerY: 0
        });
    };

    /**
     * Update the button size from the ButtonDisplay
     */
    Button.prototype.updateSize = function() {
        if (this.displays.active) {
            // TODO
            //var boundaries = this.displays.active.getBoundingBox();
            //this.width = boundaries.width;
            //this.height = boundaries.height;
        }
        if (this.image) {
            this.image.setPos(this.x, this.y);
        }
    };

    /**
     * Set this button as selectable or not, i.e. if it can be "toggled"
     *
     * TODO: Implement when needed
     * @param {Boolean} selectable
     */
    Button.prototype.setSelectable = function(selectable) {
        this.selectable = selectable;

        return this;
    };

    Button.prototype.setFixedSize = function(bool) {
        this.fixedSize = bool;

        return this;
    };

    Button.prototype.click = function() {
        this.trigger('click', {});
        console.log('triggered click');
    };

    Button.prototype.setSize = function(width, height) {
        GUIComponent.prototype.setSize.call(this, width, height);

        this.displays.inactive.setSize(width, height);
        this.displays.active.setSize(width, height);

        this.fitTextToButtonSize();

        return this;
    }

    return Button;
});