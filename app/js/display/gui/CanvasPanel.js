define([
    'display/gui/CanvasElement'
], function(
    CanvasElement
) {

    var CanvasPanel = function(ctx, x, y, width, height, borderSize, innerColor, borderColor) {
        CanvasElement.call(this, ctx, x, y, width, height);
        //console.log("creating new panel w="+width+"; height="+height);

        if (innerColor === undefined) {
            innerColor = '#fbdb9f';
        }
        if (borderColor === undefined) {
            borderColor = '#513c2e';
        }
        if (borderSize === undefined) {
            borderSize = 4;
        }
        this.innerColor = innerColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
    }

    CanvasPanel.prototype = Object.create(CanvasElement.prototype);

    CanvasPanel.prototype.onDraw = function(ctx) {
        ctx.fillStyle = this.innerColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.borderSize) {
            var border = this.borderSize / 2;
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderSize;
            ctx.strokeRect(this.x + border, this.y + border, this.width - 2 * border, this.height - 2 * border);
        }
    }

    return CanvasPanel;

});