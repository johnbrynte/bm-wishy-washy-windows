define([], function() {

    var CanvasElement = function(GUICanvas, x, y, width, height) {
        this.GUICanvas = GUICanvas;
        this.ctx = GUICanvas.ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;

        this.events = [];

        this.update();
    };

    CanvasElement.prototype.setPos = function(x, y) {
        this.x = x;
        this.y = y;
        this.update();

        return this;
    };

    CanvasElement.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.update();

        return this;
    };

    CanvasElement.prototype.setVisibility = function(bool) {
        this.visible = bool;
        this.update();

        return this;
    }

    CanvasElement.prototype.draw = function() {
        this.onDraw(this.ctx);
    };

    CanvasElement.prototype.on = function(eventName, eventFunction) {
        // console.log("Add event " + eventName + " for ", this, " " +
        //     eventFunction);

        if (this.events[eventName] === undefined) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(eventFunction);

        return this;
    };

    /**
     * Tells the GUICanvas that the canvas needs to be updated.
     * Any function that alters the appearance of the element should
     * call this function.
     */
    CanvasElement.prototype.update = function() {
        this.GUICanvas.requestUpdate();

        return this;
    };

    /**
     * This function should be overwritten to specify the drawing method.
     */
    CanvasElement.prototype.onDraw = function(ctx) {};

    return CanvasElement;

});