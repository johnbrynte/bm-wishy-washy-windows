define([
    'display/AssetManager',
    'display/gui/CanvasPanel',
    'display/gui/CanvasSprite',
    'display/gui/CanvasText',
    'display/guicomponents/PopupJoystick',
], function(
    AssetManager,
    CanvasPanel,
    CanvasSprite,
    CanvasText,
    PopupJoystick
) {

    var GUICanvas = function(width, height) {
        this.width = width;
        this.height = height;

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        var ctx = canvas.getContext('2d');
        ctx.guicanvas = this;
        var img = AssetManager.images.border;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        this.ctx = ctx;
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++GUICanvas ctx is " + ctx);
        this.mesh = AssetManager.Sprite(canvas, width, height, width, height, false);
        this.needsUpdate = false;
    }

    GUICanvas.prototype.createPanel = function(width, height, borderSize, innerColor, borderColor) {
        return new CanvasPanel(this, 0, 0, width, height, borderSize, innerColor, borderColor);
    }

    GUICanvas.prototype.createSprite = function(image) {
        return new CanvasSprite(this, 0, 0, 0, 0, image);
    }

    GUICanvas.prototype.createText = function(string, textSize, color) {
        return new CanvasText(this, 0, 0, 0, 0, string, textSize, color);
    }

    GUICanvas.prototype.createPopupJoystick = function(x, y) {
        return new PopupJoystick(this, x, y);
    }

    GUICanvas.prototype.getMesh = function() {
        return this.mesh;
    }

    GUICanvas.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Tells the canvas that an update is requested.
     */
    GUICanvas.prototype.requestUpdate = function() {
        this.needsUpdate = true;
    };

    GUICanvas.prototype.update = function() {
        if (this.needsUpdate) {
            this.needsUpdate = false;
            this.mesh.update();
        }
    }

    return GUICanvas;

});