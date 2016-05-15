define([
    'display/gui/CanvasElement'
], function(
    CanvasElement
) {

    var CanvasSprite = function(ctx, x, y, width, height, image) {
        if (width === undefined) {
            width = image.width;
        }
        if (height === undefined) {
            height = image.height;
        }
        CanvasElement.call(this, ctx, x, y, width, height);
        this.image = image;
    }

    CanvasSprite.prototype = Object.create(CanvasElement.prototype);

    CanvasSprite.prototype.onDraw = function(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    return CanvasSprite;

});