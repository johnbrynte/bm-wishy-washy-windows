define([
    'display/gui/CanvasElement'
], function(
    CanvasElement
) {

    var WH_RATIO = 0.5;

    var CanvasText = function(ctx, x, y, width, height, string, size, color) {
        //console.log("CanvasText called. text = '"+string+"'");
        //console.dir(arguments);
        // TODO: implement size
        CanvasElement.call(this, ctx, x, y, width, height);

        if (size === undefined) {
            size = 60;
        }
        if (color === undefined) {
            color = '#000';
        }
        this.color = color;
        this.string = string;
        //this.font = "Arial";
        // this calls the setText() function
        this.setTextSize(size);
    }

    CanvasText.prototype = Object.create(CanvasElement.prototype);

    CanvasText.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.setText(this.string);
        this.update();
        return this;
    }

    CanvasText.prototype.setText = function(string) {
        var i, j, k, w, y, width, chunkWidth, ctx, rows, words, str;
        //charEstimate = Math.floor(this.width / (this.size * WH_RATIO));
        ctx = this.ctx;
        ctx.font = this.font;
        this.string = string;
        this.rows = [];
        if (string === undefined) {
            return;
        }
        //console.log(this.width, this.height);
        if (this.width === undefined) {
            this.rows.push(string);
            this.height = this.size;
            return;
        }
        var getChunkWidth = function(str) {
            return ctx.measureText(str).width;
        }
        y = 0;
        rows = string.split('\n');
        for (j = 0; j < rows.length; j++) {
            words = rows[j].trim().split(/\s+/);
            i = 0;
            while (i < words.length) {
                w = 0;
                width = 0;
                chunkWidth = getChunkWidth(words[i + w]);
                while (i + w < words.length - 1 && width + chunkWidth < this.width) {
                    width += chunkWidth;
                    w++;
                    chunkWidth = getChunkWidth(' ' + words[i + w]);
                }
                while (width + chunkWidth > this.width) {
                    width -= chunkWidth;
                    w--;
                    chunkWidth = getChunkWidth(' ' + words[i + w]);
                }
                if (w < 1) {
                    w = 1;
                }
                str = words[i];
                for (k = i + 1; k <= i + w && k < words.length; k++) {
                    str += ' ' + words[k];
                }
                this.rows.push(str);
                y += this.size;
                i += w + 1;
            }
        }
        this.height = y;
        this.update();
        return this;
    }

    CanvasText.prototype.setTextSize = function(size) {
        this.size = size;
        this.font = this.size + 'px Monospace';
        this.setText(this.string);
        this.update();
        return this;
    }

    CanvasText.prototype.setColor = function(color) {
        this.color = color;
        this.update();
        return this;
    }

    CanvasText.prototype.onDraw = function(ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        for (var i = 0; i < this.rows.length; i++) {
            ctx.fillText(this.rows[i], this.x, this.y + (i + 1) * this.size);
        }
    }

    // Debug override
    CanvasText.prototype.setPos = function(x, y) {
        //console.log(" -- setPos for CanvasText '"+this.string+"' at "+x+","+y);
        this.x = x;
        this.y = y;
        this.update();
        return this;
    }

    return CanvasText;

});