/**
 * A GUI component.
 * Can have children (other gui components), a parent, and probably some other stuff as well.
 */
define([
    'utils/Constants',
    'lib/three'
], function(
    Constants,
    THREE
) {
    var GUIComponent = function(width, height) {
        /**
         * A list of components contained by this component.
         * The index in this array is the z-index of the components.
         * @type {Array}
         */
        this.children = [];

        /**
         * The GUIComponent that contains this component.
         * @type {GUIComponent}
         */
        this.parent = null;

        /**
         * The absolute x coordinate of this component
         * @type {Number}
         */
        this.x = 0;
        /**
         * The absolute y coordinate of this component
         * @type {Number}
         */
        this.y = 0;

        /**
         * The x coordinate of this component relative to its parent.
         * @type {Number}
         */
        this.relX = 0;
        /**
         * The y coordinate of this component relative to its parent.
         * @type {Number}
         */
        this.relY = 0;

        /**
         * The width of this component in pixels.
         * @type {Number}
         */
        this.width = width ? width : 0;
        /**
         * The width of this component in pixels.
         * @type {Number}
         */
        this.height = height ? height : 0;

        /**
         * The z-index for the display object
         */
        this.zIndex = 0;

        /**
         * A wrapper for the display object
         */
        this.object3d = new THREE.Object3D();

        /**
         * A "unique" identifier for this GUIComponent, so you can identify it :-))
         * @type {String}
         */
        this.id = (Math.random() + 1).toString(36).substr(2, 5);

        if (!width || !height) {
            //console.warn("GUIComponent (id " + this.id + "): No default w/h set, using 100 px");
        }

        this.events = {};
        this.visible = true;
        this.layout = Constants.layout.NONE;
        this.layoutMargin = 0;
        this.layoutAlign = Constants.layout.CENTER;
        this.margin = {
            up: 0,
            right: 0,
            down: 0,
            left: 0
        };
        this.padding = {
            up: 0,
            right: 0,
            down: 0,
            left: 0
        };

        // Set up event forwarding for some position-dependent events
        // TODO: Only send to components that are not lying underneath other components
        var events = ['click', 'mousedown', 'mousemove', 'mouseup',
            'touchstart', 'touchend', 'touchmove', 'touchleave', 'touchenter',
            'dragover', 'drop']; // Just add more if you want

        for (var ei = events.length - 1; ei >= 0; ei--) {
            var eventName = events[ei];
            this.events[eventName] = [];
            this.events[eventName].push((function(evtName) {
                return (function(event) {
                    var hits = []; // Save children that the event is "on", to skip children that are positioned behind this.
                    // Please note that hitting children is NEVER ok!!!
                    //console.log("GUComponent child check hit for event "+evtName);
                    for (var i = this.children.length - 1; i >= 0; i--) {
                        var child = this.children[i];
                        if (event.x && event.y) {
                            //console.log("isinside for child "+child+" and coord "+event.x+","+event.y+" == "+(child.isInside(event.x, event.y))+", hits for child = "+(hits.indexOf(child)));
                            if (child.isInside(event.x, event.y) && hits.indexOf(child) === -1) {
                                child.trigger(evtName, event);
                            }
                        } else {
                            child.trigger(evtName, event);
                        }
                    }
                }).bind(this);
            }).call(this, eventName));
        }

        // Enter/leave events
        this.lastTouchEvent = null;
        // this.events.touchenter = this.events.touchleave = [];
        this.events.touchmove.push((function(event) {
            // Determine if the move entered/left any children
            if (this.lastTouchEvent === null) {
                // Can't determine
                return;
            }

            //console.log(event.x, this.lastTouchEvent.x);
            //console.log('GUIComponent Check for move inside', event.x, event.y, this.lastTouchEvent.x, this.lastTouchEvent.y);
            for (var i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].isInside(event.x, event.y) && !
                    this.children[i].isInside(this.lastTouchEvent.x,
                        this.lastTouchEvent.y)) {
                    // Touch enter
                    this.children[i].trigger('touchenter',
                        this.lastTouchEvent);
                } else if (!this.children[i].isInside(event.x,
                        event.y) &&
                    this.children[i].isInside(this.lastTouchEvent.x,
                        this.lastTouchEvent.y)) {
                    //touch leave
                    this.children[i].trigger('touchleave',
                        this.lastTouchEvent);
                }
            }
        }).bind(this));
    };

    /**
     * Set the position of this component relative to its parents coordinates.<br>
     * Do this <strong>after</strong> you have added this component to another component!
     * @param {Number} x
     * @param {Number} y
     */
    GUIComponent.prototype.setPosition = function(x, y) {
        x = typeof x != 'undefined' ? x : this.relX;
        y = typeof y != 'undefined' ? y : this.relY;

        var offsetX = (this.parent !== null) ? this.parent.x : 0;
        var offsetY = (this.parent !== null) ? this.parent.y : 0;

        var oldX = this.x;
        var oldY = this.y;

        this.relX = x;
        this.relY = y;
        this.x = x + offsetX;
        this.y = y + offsetY;

        var diffx = this.x - x;
        var diffy = this.y - y;

        //console.log("GUIcomponent.setposition called x="+x+", y="+y+" this new xy is "+this.x+","+this.y+" diffx = "+diffx+"; diffy = "+diffy+", oldx = "+oldX+"; oldy = "+oldY+", relx = "+this.relX+", rely = "+this.relY);
        //console.dir(this.parent);

        if (this.parent) {
            this.object3d.position.set(this.x - this.parent.x, -(this.y - this.parent.y), this.zIndex);
        } else {
            this.object3d.position.set(this.x, -this.y, this.zIndex);
        }
        if (this.display) {
            //this.display.position.z = 1;
        }

        // Move children
        for (var i = this.children.length - 1; i >= 0; i--) {
            var child = this.children[i];
            child.setPosition(child.relX, child.relY);

        }

        return this;
    };

    GUIComponent.prototype.setZIndex = function(zIndex) {
        this.zIndex = zIndex;
        this.object3d.position.z = this.zIndex;

        this.children.forEach(function(c) {
            c.setZIndex(this.zIndex + 1);
        }.bind(this));

        return this;
    }

    GUIComponent.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        if (this.display && this.display.setSize) {
            this.display.setSize(this.width, this.height);
        }
        this._applyLayout();
        return this;
    };

    /**
     * Returns true if the specified coordinates are inside this component.
     * @param  {Number}  x
     * @param  {Number}  y
     * @return {Boolean}   True if (x,y) is inside this component, false otherwise.
     */
    GUIComponent.prototype.isInside = function(xx, yy) {
        // The DAMNEDEST scaling issues, I tell you.
        // TODO: Understand if this is local only on nexus tablets or show up everywhere.
        //
        var x = parseInt(xx * window.devicePixelRatio);
        var y = parseInt(yy * window.devicePixelRatio);
        //console.log("isInside for ",parseInt(x), parseInt(y), " inside ", this.x, this.y, " to ", (this.x + this.width), (this.y + this.height));
        return (x >= this.x && x <= this.x + this.width) &&
            (y >= this.y && y <= this.y + this.height);
    };

    /**
     * Sets the display object (PanelDisplay, SpriteDisplay etc.)<br>
     * The coordinates for the specified display
     * will be interpreted as coordinates relative to this component.
     * @param {Display} display
     */
    GUIComponent.prototype.setDisplay = function(display) {
        if (this.display) {
            this.object3d.remove(this.display);
        }
        if (display) {
            this.display = display;
            this.object3d.add(this.display);
            // update the relative position
            this.setPosition();
            //this.display.setSize(this.width, this.height);
        } else {
            this.display = null;
        }

        return this;
    };

    /**
     * Mark this component as visible or not (prevents it from rendering)
     * @param {boolean} visible
     */
    GUIComponent.prototype.setVisible = function(visible) {
        //console.log("setvisible set to "+visible+" for element "+this.id);
        if (visible === undefined) {
            visible = true;
        }
        this.visible = visible;
        this.object3d.visible = visible;
        if (this.onSetVisible) {
            this.onSetVisible(visible);
        }
        if (this.children) {
            this.children.forEach(function(c) {
                c.setVisible(visible);
            });
        }

        return this;
    };

    GUIComponent.prototype.toggleVisibility = function() {
        this.setVisible(!this.visible);

        return this;
    };

    /**
     * Sets the parent to this component
     * @param {GUIComponent} parent New parent
     * @return {GUIComponent} this context
     */
    GUIComponent.prototype.setParent = function(parent) {
        this.parent = parent;
        // update the relative position
        this.setPosition();
        this.setZIndex(this.parent.zIndex + 1);

        return this;
    };

    /** CHILDREN RELATED **/
    /** Below are functions related to children and child management etc. **/

    /**
     * Adds a child component to this component. The new component will (visually)
     * lie on top of any previously added components.
     * @param {GUIComponent} component
     */
    GUIComponent.prototype.addChild = function(component) {
        if (!component instanceof GUIComponent) {
            console.err('Component not instance of object GUIComponent.');
        } else {
            this.object3d.add(component.object3d);
            component.setParent(this);
            this.children.push(component);
            this._applyLayout();
        }

        return this;
    };

    /**
     * Adds a child to this component to the top of the children list.
     * @param {GUIComponent} component
     */
    GUIComponent.prototype.addChildBefore = function(component) {
        if (!component instanceof GUIComponent) {
            console.err('Component not instance of object GUIComponent.');
        } else {
            this.object3d.add(component.object3d);
            component.setParent(this);
            this.children.unshift(component);
            this._applyLayout();
        }

        return this;
    };

    /**
     * Adds several components at the same time
     * @param {Array<GUIComponents>} components An array of GUIComponents to add.
     */
    GUIComponent.prototype.addChildren = function(components) {
        for (var i = components.length - 1; i >= 0; i--) {
            this.object3d.add(components[i].object3d);
            components[i].setParent(this);
        }
        this.children.concat(components);
        this._applyLayout();

        return this;
    };

    /**
     * Removes this component from its parent (if there is a parent)
     */
    GUIComponent.prototype.remove = function() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    /**
     * Removes the specified child from this component.
     * @param  {GUIComponent} component The component to remove.
     */
    GUIComponent.prototype.removeChild = function(component) {
        if (this.contains(component)) {
            this.object3d.remove(component.object3d);
            this.children.splice(this.children.indexOf(component), 1);
            this._applyLayout();
        } else {
            console.error(this + ' has no child ' + component);
        }
        return this;
    };

    /**
     * Removes all children of this component.
     * @return {[type]} [description]
     */
    GUIComponent.prototype.removeChildren = function() {
        var c;
        while (this.children.length > 0) {
            c = this.children[0];
            if (c.children) {
                c.removeChildren();
            }
            this.removeChild(c);
        }
    };

    /**
     * Removes the child at the specified index in this components children array.
     * @param  {int} index
     */
    GUIComponent.prototype.removeChildByIndex = function(index) {
        return this.removeChild(this.children[index]);
    };

    /**
     * Returns true if this component contains the specified component.
     * @param  {GUIComponent} component
     */
    GUIComponent.prototype.contains = function(component) {
        return (this.children.indexOf(component) !== -1);
    };


    /** EVENTS **/
    /** Functions related to events and event handling **/

    /**
     * Adds a function to be executed every time the specified event is triggered on this component.
     * @param  {String} eventName     The name of the event
     * @param  {function} eventFunction The function to execute when the event happens.
     */
    GUIComponent.prototype.on = function(eventName, eventFunction) {
        // console.log("Add event " + eventName + " for ", this, " " +
        //     eventFunction);

        if (this.events[eventName] === undefined) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(eventFunction);

        return this;
    };

    /**
     * Disables the specified function (previously set with GUIComponent.on) for the given event.
     * @param  {String} eventName
     * @param  {function} eventFunction
     */
    GUIComponent.prototype.off = function(eventName, eventFunction) {
        var evtList = this.events[eventName];
        var index = evtList.indexOf(eventFunction);
        if (evtList !== undefined && index !== -1) {
            this.events[eventName] = evtList.splice(index, 1);
            return this;
        }

        console.error(this + 'has no event handler ' + eventFunction +
            ' for ' +
            eventName);
    };

    /**
     * Triggers the specified event on this component.
     * @param  {String} eventName   The name of the event to trigger
     * @param  {Object} eventObject The event object
     */
    GUIComponent.prototype.trigger = function(eventName, eventObject) {
        if (!this.visible) {
            return;
        }

        if (this.events[eventName]) {
            for (var i = this.events[eventName].length - 1; i >= 0; i--) {
                // console.log("GUIC:325", eventName)
                this.events[eventName][i](eventObject);
            }
        } else {
            // console.error('Faulty event name:', eventName);
        }

        //  TODO: Better copy object
        if (this.lastTouchEvent === null) {
            this.lastTouchEvent = {};
        }
        this.lastTouchEvent.x = parseInt(eventObject.x);
        this.lastTouchEvent.y = parseInt(eventObject.y);

        return this;
    };

    /**
     * Aligns this component to its parent (if it is defined) given an
     * Object with spacing parameters.
     * @param  {Object} alignment An Object with the following possible
     * keys and values specifying the alignment with the parent component:
     * {
     *  left: {Number},
     *  right: {Number},
     *  top: {Number},
     *  bottom: {Number},
     *  centerX: {Number},
     *  centerY: {Number}
     * }
     * @return {GUIComponent} This object
     */
    GUIComponent.prototype.alignToParent = function(alignment) {
        var parent,
            x = this.relX,
            y = this.relY;

        if (this.parent === null) {
            return this;
        }
        parent = this.parent;

        if (alignment.left !== undefined) {
            x = alignment.left;
        }
        if (alignment.right !== undefined) {
            x = parent.width - this.width + alignment.right;
        }
        if (alignment.top !== undefined) {
            y = alignment.top;
        }
        if (alignment.bottom !== undefined) {
            y = parent.height - this.height + alignment.bottom;
        }

        if (alignment.centerX !== undefined) {
            x = (parent.width - this.width) / 2 + alignment.centerX;
        }
        if (alignment.centerY !== undefined) {
            y = (parent.height - this.height) / 2 + alignment.centerY;
        }

        this.setPosition(x, y);

        return this;
    };

    /**
     * Organize/order/align the children according to this components layout.
     */
    GUIComponent.prototype._applyLayout = function() {
        var i;

        switch (this.layout) {
            case Constants.layout.VERTICAL:
                // VERTICAL
                // Puts children in a centered columm (top->bottom). Respects the
                // width of this component but changes the height to fit children.
                var x;
                var y = 0;
                for (i = 0; i < this.children.length; i++) {
                    var ch = this.children[i];
                    //console.log("  _applyLayout vertical for child "+(typeof ch));
                    //console.dir(ch);
                    switch (this.layoutAlign) {
                        case Constants.layout.LEFT:
                            x = 0;
                            break;
                        case Constants.layout.RIGHT:
                            x = this.width - ch.width;
                            break;
                        case Constants.layout.CENTER:
                        default:
                            x = this.width / 2 - ch.width / 2;
                            break;
                    }
                    ch.setPosition(x, y + this.layoutMargin);
                    //console.log(ch.x, ch.y);
                    y += ch.height + this.layoutMargin;
                }
                this.height = y;
                break;
            case Constants.layout.HORIZONTAL:
                // HORIZONTAL
                // Puts children in a centered row (left->right). Respects the
                // height of this component but changes the width to fit children.
                var x = 0;
                var y;
                for (i = 0; i < this.children.length; i++) {
                    var ch = this.children[i];
                    //console.log("  _applyLayout horizontal for child "+(typeof ch)+", this.layoutMargin = "+this.layoutMargin+", ch.width = "+ch.width+", x = "+x);
                    //console.dir(ch);
                    switch (this.layoutAlign) {
                        case Constants.layout.TOP:
                            y = 0;
                            break;
                        case Constants.layout.BOTTOM:
                            y = this.height - ch.height;
                            break;
                        case Constants.layout.CENTER:
                        default:
                            y = this.height / 2 - ch.height / 2;
                            break;
                    }
                    ch.setPosition(x + this.layoutMargin, y);
                    //x += ch.width + this.layoutMargin;
                    x += ch.width + this.layoutMargin;
                }
                this.width = x;
                break;
            case Constants.layout.GRID:
                // GRID
                // Respects the dimensions of this component; puts children on a row
                // until it's wider than this component, then continues on the next row
                // and so on.
                var row = 0,
                    x = 0,
                    y = 0,
                    maxHeight = 0,
                    rows = [];

                // Go through children and make rows
                for (i = 0; i < this.children.length; i++) {
                    var ch = this.children[i];
                    //console.log("  _applyLayout grid for child "+(typeof ch));
                    //console.dir(ch);
                    x += ch.width;
                    if (x <= this.width) {
                        // This child fits on the current row
                        rows[row] = rows[row] || [];
                        rows[row].push(ch);
                        maxHeight = Math.max(maxHeight, ch.height);
                        ch.setPosition(x - ch.width, y);
                    } else {
                        // Row is full

                        // We need at least one element per row
                        if (!rows[row]) {
                            // no child fits :(
                            rows[row] = [ch];
                            y += ch.height;
                        } else {
                            // we have at least one child on this row
                            i--; // step back, put current ch on next row
                            y += maxHeight;
                        }

                        row++;
                        x = 0;
                    }
                }
                break;
            case Constants.layout.NONE:
                break;
            default:
                throw new Error("Unsupported layout: " + this.layout);
                break;
        }

        if (this.display && this.display.setSize) {
            //this.display.setSize(this.width, this.height);
        }

        return this;
    };

    GUIComponent.prototype.draw = function() {
        /*if (this.visible && this.display !== undefined && this.display !== null) {
            this.display.draw();
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }*/
    };

    /**
     * Set the layout to be used by this component.
     * Supported layouts are in Constants.layout
     * @param {Layout constant} layout
     */
    GUIComponent.prototype.setLayout = function(layout) {
        this.layout = layout;
        this._applyLayout();

        return this;
    };

    GUIComponent.prototype.setLayoutMargin = function(margin) {
        this.layoutMargin = margin;
        this._applyLayout();

        return this;
    };

    GUIComponent.prototype.setLayoutAlign = function(align) {
        this.layoutAlign = align;
        this._applyLayout();

        return this;
    };

    GUIComponent.prototype.setId = function(id) {
        this.id = id;

        return this;
    };

    /** Return this object **/
    return GUIComponent;
});