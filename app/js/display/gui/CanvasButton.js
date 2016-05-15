define([
    'display/gui/CanvasElement',
    'display/gui/CanvasPanel',
    'display/gui/CanvasSprite',
    'display/gui/CanvasText',
], function(
    CanvasElement,
    CanvasPanel,
    CanvasSprite,
    CanvasText
    )
{
    var CanvasButton = function(ctx, x, y, width, height, text, image)
    {
        CanvasElement.call(this, ctx, x, y, width, height);
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.str = text;
        this.image = image;
    };

    CanvasButton.prototype = Object.create(CanvasElement.prototype);

    CanvasButton.prototype.onDraw = function(ctx)
    {
        console.log("* CanvasButton onDraw called for '"+this.text+"'");
        this.panel = new CanvasPanel(ctx, this.x, this.y, this.width, this.height, 1, 0, 1);
        if(this.str)
        {
            this.text = ctx.guicanvas.createText(this.str, 14, "#eee");
        }

        if(this.image)
        {
            this.sprite = new CanvasSprite(ctx, this.x+10, this.y+3, this.width-6, this.height-6, this.image);
        }
    };

    return CanvasButton;

});