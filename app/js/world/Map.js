/**
 * The world map!
 **/
define([
    'world/MapHandler',
    'lib/qt2',
    'display/DungeonMapper'
], function(
    MapHandler,
    QuadTree,
    DungeonMapper
) {

    var nothingValue = -1;
    var nothingValueString = nothingValue.toString();

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

    var Map = function() {
        this.levels = {};
        this.area = 3;
        this.currentMap = null;
        this.mapHandler = new MapHandler();
        this.renderedTiles = [];
        this.tilecache = [];
        // init with size of map
        var w = 6;
        var h = 6;
        this.dungeonMapper = new DungeonMapper(w, h);
        this.dungeonMap = new Array(h);
        for (var i = 0; i < h; i++) {
            this.dungeonMap[i] = new Array(w);
        }
        this.dungeonMapperEnabled = false;
        this.startxPrev = -1;
        this.startyPrev = -1;

        // Load from localStorage

        if (localStorage.getItem('map')) {
            this.levels = JSON.parse(localStorage.getItem('map'));

            this.mapHandler.mapUpdate();
        }

        this.maxcache = 1000;
        this.newtilestorender = [];
        this.oldtilestoremove = [];
    };

    /**
     * Add the new scan results to the map
     */
    Map.prototype.extend = function(scanResults, party) {
        var areaW, areaH, i, j, extendBy, offsetX, offsetY, extend;
        this.needsUpdate = 0;

        if (this.currentMap === null) {
            this.currentMap = scanResults.map;
            console.log('currentmap null. set to scan map...');
            console.dir(scanResults.map);

        }

        areaW = scanResults.area[0].length;
        areaH = scanResults.area.length;
        offsetX = scanResults.bx;
        offsetY = scanResults.by;
        extendBy = 20;

        // Create a new map for the level if it 's not there
        if (!this.levels[scanResults.map]) {
            console.log("..creating new map. areaw = " + areaW + ", areah = " + areaH + ", offsetx = " + offsetX + "; offsety = " + offsetY);
            this.levels[scanResults.map] = [];
            console.log("created new map for " + scanResults.map);
            this.needsUpdate = 1;
        }

        // Add the new content to the map
        var savedmap = this.levels[scanResults.map];

        for (var y = offsetY; y < offsetY + areaH; y++) 
        {
            for (var x = offsetX; x < offsetX + areaW; x++) 
            {
                var scanpos = scanResults.area[y - offsetY][x - offsetX];
                var r = savedmap[y+ "_" + x];
                if (r != scanpos) 
                {
                    //console.log("detecting changed tile info at "+x+","+y+" r -> "+r);
                    if(r || r == 0)
                    {
                        console.log("detecting changed tile info at "+x+","+y);
                        var tile = this.renderedTiles[y+"_"+x];
                        this.oldtilestoremove.push(tile);
                        console.log("adding existing tile at "+tile.position.x+","+tile.position.z+" for removal");
                        this.needsUpdate++;
                    }
                    this.newtilestorender.push({x: x, y: y, val: scanpos});
                }
                savedmap[y + "_" + x] = scanpos;
            }
        }
        //debugger;
        if (this.needsUpdate > 0) {
            // Save to local storage
            this.needsUpdate = 0;
            localStorage.setItem('map', JSON.stringify(this.levels));

            console.log("*********   apparently Map needs updating. We got something not seen before!!");
        }
        // Always redraw map, since it's so few tiles. 

        this.mapHandler.mapUpdate({
            'scan': scanResults,
            'levels': this.levels,
            'map': this.getCurrentMap()
        });

    };

    Map.prototype.getFeaturesForCoordinates = function(x, y) {
        var themap = this.levels[this.currentMap];
        console.log("getfeatures for coord themap is "+themap +" for currentmap "+this.currentmap)
        return this.getFeaturesForCell(themap[y + "_" + x]);
    };

    Map.prototype.renderMap = function(renderObjects, dungeon, tiles, xx, yy, light) {
        var map = this.levels[this.currentMap];
        var area = light || this.area;
        //console.log("=== Map.renderMap called. current map "+map+" is '" + this.currentMap + "'");
        //console.dir(map);
        if (!this.currentMap) {
            debugger;
        }
       
       
            this.oldtilestoremove.forEach(function(oldtile)
            {
                this.removeTile(oldtile, dungeon);
                console.log("removing old tile at "+oldtile.position.x+","+oldtile.position.z);
            }.bind(this));
            this.oldtilestoremove = [];
       
            
            this.newtilestorender.forEach(function(tile)
            {
                console.log("adding new tile at "+tile.x+","+tile.y);
                var rv = this.getFeaturesForCell(tile.val);
                this.placeTileInDungeon(tile.x, tile.y, 0, rv, renderObjects, dungeon);
            }.bind(this));
            this.newtilestorender = [];
       
    };

    Map.prototype.renderCellAt = function(i, j, renderObjects, dungeon)
    {
        mv = map[j + "_" + i];
        var x = i;
        var y = j;
        var h = 0;
        //console.log(" rendering map floor tile "+j+","+i+" -> "+mv);
        var obj = null;
        var rv = this.getFeaturesForCell(mv);
        this.placeTileInDungeon(x, y, h, rv, renderObjects, dungeon);
    };

    Map.prototype.placeTileInDungeon = function(x, y, h, rv, renderObjects, dungeon)
    {
        if (rv.forge) {            
            obj = this.getTileOfType('floor', renderObjects);
            this.placeTileAt(dungeon, obj, x - 0.5, -0.5, y + 0.3)
            obj = this.getTileOfType('forge', renderObjects);
            this.placeTileAt(dungeon, obj, x, h, y);
        }
        if (rv.manapool) {
            obj = this.getTileOfType('floor', renderObjects);
            this.placeTileAt(dungeon, obj, x - 0.5, -0.5, y + 0.3)
            obj = this.getTileOfType('manapool', renderObjects);
            this.placeTileAt(dungeon, obj, x, h, y);
        }
        if (rv.healingpool) {
            obj = this.getTileOfType('floor', renderObjects);
            this.placeTileAt(dungeon, obj, x - 0.5, -0.5, y + 0.3)
            obj = this.getTileOfType('healingpool', renderObjects);
            this.placeTileAt(dungeon, obj, x, h, y);
        } else if (rv.perimeter) {            
            obj = this.getTileOfType('perimeter', renderObjects);
            this.placeTileAt(dungeon, obj, x, h, y);
        } else if (rv.blocked) {
            obj = this.getTileOfType('bigwall', renderObjects);
            this.placeTileAt(dungeon, obj, x, h, y);
        } else {
            obj = this.getTileOfType('floor', renderObjects);
            this.placeTileAt(dungeon, obj, x - 0.5, -0.5, y - 0.5);
        }
    };

    Map.prototype.getTileOfType = function(type, renderObjects) {
        var arr = this.tilecache[type] || [];
        this.tilecache[type] = arr;
        var obj = null;
        if (arr.length > 0) {
            obj = arr.pop();
        } else {
            obj = renderObjects[type].clone();
            obj.type = type;
        }
        return obj;
    };

    Map.prototype.placeTileAt = function(dungeon, obj, x, h, y) {
        obj.position.set(x, h, y);
        if(this.renderedTiles[y+"_"+x])
        {
            dungeon.remove(this.renderedTiles[y+"_"+x]);
        }
        dungeon.add(obj);
        this.renderedTiles[y+"_"+x] = obj;
    };

    Map.prototype.removeRenderedTiles = function(object) {
        //console.log("removing old tiles.")
        var children = this.renderedTiles;
        for (var i = 0; i < children.length; i++) {
            var obj = children[i];
            this.removeTile(obj, object);
        }
        this.renderedTiles = [];
    };

    Map.prototype.removeTile = function(obj, object)
    {
        //obj.position.set(-1000, -1000, -1000);
        object.remove(obj);
        console.log("tile removed");
        console.dir(obj);
        var arr = this.tilecache[obj.type] || [];
        arr.push(obj);
        this.tilecache[obj.type] = arr;
    }

    Map.prototype.getFeaturesForCell = function(v) {
        var rv = {};
        if (v === 0) {
            //rv += "0 -nothing "
            rv.blocked = true;
        }
        if (v & 0x00000001) {
            // 1 - Blocked
            rv.blocked = true;
        }
        if (v & 0x00000010) {
            //rv += "16 -perimeter "
            rv.blocked = true;
            rv.perimeter = true;
        }
        if (v & 0x00000002) {
            //rv += "2 -room "
            rv.blocked = false;
        }
        if (v & 0x00000004) {
            //rv += "4 -corridor "
            rv.blocked = false;
        }
        if (v & 0x00000020) {
            //rv += "32 - entrance "
            rv.blocked = false;
        }
        if (v & 0x0000FFC0) {
            //rv += "room id "+(v & 0x0000FFC0) >> 6
            rv.blocked = false;
            rv.roomid = (v & 0x0000FFC0) >> 6;
        }
        if (v & 0x00010000) {
            //rv += "0x10000 - arch "
            rv.blocked = false;
        }
        if (v & 0x00020000) {
            //rv += "0x20000 - door "
            rv.blocked = false;
            rv.door = true;
        }
        if (v & 0x00040000) {
            //rv += "0x40000 - locked "
            rv.blocked = false;
            rv.door = true;
        }
        if (v & 0x00080000) {
            //rv += "0x80000 - trapped "
            rv.blocked = false;
            rv.door = true;
        }
        if (v & 0x00100000) {
            //rv += "0x100000 - secret "
            rv.blocked = false;
            rv.door = true;
        }
        if (v & 0x00200000) {
            //rv += "0x200000 - portcullis "
            rv.blocked = false;
            rv.door = true;
        }
        if (v & 0x00400000) {
            //rv += "0x400000 - stair up "
            rv.blocked = false;
            rv.stairsup = true;
        }
        if (v & 0x00800000) {
            //rv += "0x800000 - stair down "
            rv.blocked = false;
            rv.stairsdown = true;
        }
        if (v & 0x02000000) {
            rv.blocked = true;
            rv.forge = true;
        }
        if (v & 0x04000000) {
            rv.blocked = true;
            rv.manapool = true;
        }
        if (v & 0x08000000) {
            rv.blocked = true;
            rv.healingpool = true;
        }

        return rv;

    };

    /**
     * TODO?
     * @param  {[type]} map [description]
     * @return {[type]}     [description]
     */
    Map.prototype.combine = function(map) {

    };


    Map.prototype.toString = function() {
        var i, x, y,
            tmpString = '',
            undefinedChar = 'X';

        for (var level in this.levels) {
            tmpString += 'Level: ' + level + '\n';
            //TODO: Test
            for (y = 0; y < this.levels[level].length; y++) {
                for (x = 0; x < this.levels[level][0].length; x++) {
                    if (this.levels[level][y][x] === 0) {
                        tmpString += undefinedChar;
                        // console.log("whyudnefine");
                    } else {
                        tmpString += String.fromCharCode(this.levels[level]
                            [y][x]);
                    }
                }
                tmpString += "\n"; // TODO: Check if works
            }
            tmpString += "\n";
        };

        return tmpString;
    };

    Map.prototype.getMap = function(map) {
        return this.levels[map];
    };

    Map.prototype.getCurrentMap = function() {
        return this.levels[this.currentMap];
    };

    /**
     * thx http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
     */
    var _getArrayOfSomething = function(length, something) {
        return Array.apply(null, new Array(length)).map(Number.prototype
            .valueOf,
            something);
    };

    return Map;

});