define([
    'display/AssetManager',
    'EventManager'
], function(
    AssMan,
    EvtMgr
) {

    var nothingValue = -1;
    var nothingValueString = nothingValue.toString();

    var tiles = {
        0x00000000: 9, // wall
        //0x00000002: 0, // floor
        0x00000010: 8 // perimeter
    };

    var defaultColors = {
        0x00000000: '#008088', // NOTHING
        0x00000001: '#be31e1', // BLOCKED
        0x00000002: '#bcbcbc', // ROOM
        0x00000004: '#bfbfbf', // CORRIDOR
        0x00000010: '#616161', // PERIMETER
        0x00000020: '#f33', // ENTRANCE
        0x0000FFC0: '#123', // ROOM_ID
        0x00010000: '#523', // ARCH
        0x00020000: '#a87', // DOOR
        0x00040000: '#74d', // DOOR
        0x00080000: '#b34', // DOOR
        0x00100000: '#c82', // DOOR
        0x00200000: '#908', // PORTCULLIS
        0x00400000: '#fff', // STAIR_DOWN
        0x00800000: '#fff', // STAIR_UP
        0xFF000000: '#aaa', // LABEL
        1337: "red", // active character
        "character": "green", // other character
        "item": "#a45b32",
        'text': "#fff",
        'visible': '#bfbfbf',
        'monster': '#8500F2',
        nothingValueString: "#000"
    };

    var not_room = [0x00000000, 0x00000001, 0x00000004, 0x00000010,
        0x00000020, 0x00010000, 0x00020000, 0x00040000, 0x00080000,
        0x00100000, 0x00200000, 0x00400000, 0x00800000, 0xFF000000,
        "character", "item", "monster", nothingValueString];
    var blocking_blocks = [0x00000000, 0x00000001, 0x00000010, -1];

    var SimpleGameView = function() {
        this.canvas = document.createElement('canvas');
        this.width = AssMan.width;
        this.height = AssMan.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
        this.mesh = AssMan.Sprite(this.canvas, this.width, this.height);

        this.active = false;

        EvtMgr.on('onScan', (function(args) {
            if (!this.lastScan) {
                console.log(args[0]);
            }
            this.lastScan = args[0];

            if (this.active) {
                this.draw();
            }
        }).bind(this));
    };

    SimpleGameView.prototype.setActive = function(active) {
        this.active = active;
        if (this.active) {
            this.draw();
        }
    };

    SimpleGameView.prototype.getMesh = function() {
        return this.mesh;
    };

    SimpleGameView.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.mesh.update();
    };

    SimpleGameView.prototype.draw = function() {
        var ctx = this.ctx;

        ctx.fillStyle = '#666';
        ctx.fillRect(0, 0, this.width, this.height);

        var scale, ox, oy,
            spacing = 0;

        if (this.lastScan) {
            var scan = this.lastScan;
            var vw = 20;
            var vh = 20;
            var w = scan.area[0].length;
            var h = scan.area.length;

            if (this.height > this.width) {
                scale = Math.round(this.width / (vw + 2 * spacing));
                ox = spacing * scale;
                oy = this.height / 2 - scale * vh / 2;
            } else {
                scale = Math.round(this.height / (vh + 2 * spacing));
                ox = this.width / 2 - scale * vw / 2;
                oy = spacing * scale;
            }

            var x, y;
            for (var i = 0; i < vw; i++) {
                x = scan.x - scan.bx + i - vw / 2;
                if (x >= 0 && x < w) {
                    for (var j = 0; j < vh; j++) {
                        y = scan.y - scan.by + j - vh / 2;
                        if (y >= 0 && y < h) {
                            var tile = tiles[scan.area[y][x]];
                            if (!tile) {
                                tile = 0;
                            }
                            this.drawTileAt(tile, ox + i * scale, oy + j * scale, scale);
                        }
                    }
                }
            }

            scan.entities.forEach((function(e) {
                var tile;

                switch (e.type) {
                    case 'character':
                        tile = 10;
                        break;
                    case 'monster':
                        tile = 11;
                        break;
                }

                if (tile !== undefined) {
                    this.drawTileAt(tile, ox + (e.x - scan.x + vw / 2) * scale, oy + (e.y - scan.y + vh / 2) * scale, scale);
                }
            }).bind(this));

            scan.items.forEach((function(e) {
                this.drawTileAt(12, ox + (e.x - scan.x - scan.bx + vw / 2) * scale, oy + (e.y - scan.y - scan.by + vh / 2) * scale, scale);
            }).bind(this));
        }

        this.mesh.update();
    };

    SimpleGameView.prototype.drawTileAt = function(tile, x, y, size) {
        var s = 16;
        var t = 4;
        var ty = Math.floor(tile / t);
        var tx = Math.floor(tile - ty * t);
        this.ctx.drawImage(AssMan.images.tiles, tx * s, ty * s, s, s, x, y, size, size);
    };

    return SimpleGameView;

});