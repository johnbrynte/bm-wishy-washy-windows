/*
 
 */

define([
    'utils/Constants',
    'utils/logger',
    'world/EntityManager',
    'EventManager'
], function(
    Constants,
    logger,
    EntityManager,
    EvtMgr
) {

    var logIT = function(data) {
        if (!data.error) {
            logger.info(data);
        } else {
            logger.error(data.error);
        }
    };

    /*
        @constructor
        @param data - the data recieved from an API-call to
                      createCharacter.
    */
    var Character = function(data, inv, charHandler, map) {
        // Client side data
        this.realX = 0; //data.x;
        this.realY = 0; //data.y;
        this.horizontalWalk = 0;
        this.verticalWalk = 0;

        this.localMap = [];
        this.mapobj = map;

        this.charHandler = charHandler;

        // Server side data
        this._id = data._id; // :"rGDtRgV5t",
        this.id = this._id; // sure why not
        this.name = data.name; // :"foobar [A01]",
        this.exp = data.exp; // :0,
        this.level = data.level; // :1,
        this.str = data.str; // :14,
        this.int = data.int; // :10,
        this.wis = data.wis; // :10,
        this.dex = data.dex; // :14,
        this.con = data.con; // :10,
        this.map = data.map; // :"Bad feeling ruins",
        this.inv = inv;
        this.inventory = data.inventory;
        this.inventoryIDs = data.inventory;
        // :["rB1hUUPRr","rOzetmD27","rR4HlOOB8"],

        this.x = data.x; // :15,
        this.y = data.y; // :7,
        this.hp = data.hp; // :10,
        this.ac = data.ac; // :10,
        this.alloc = data.alloc; // :0,
        this.speed = data.speed; // :2,
        this.light = data.light; // :3,
        this.wieldedweapon = data.wieldedweapon; // :null,
        this.equippedarmor = data.equippedarmor; // :null,
        this.type = data.type; // :"character",
        this.hates = data.hates; // :["*"],
        this.attack = data.attack; // :{"type":"normal","damage":[1,2]},
        this.teamabbrev = data.teamabbrev; // :"A01",
        this.teamid = data.teamid; // :"r6GCOEH2W",
        this.maxhp = data.maxhp; // :10,
        this.resource = data.resource; // :"dungeonthing",
        this.updates = data.updates; // :[]

        this.facing = 4;  // 0 === up and facing away from screen

        this.moveMap =
        {
            'up':   {prop: 'y',  val: -1 },
            'down': {prop: 'y',  val:  1 },
            'right':{prop: 'x',  val:  1 },
            'left': {prop: 'x',  val: -1 }
        };

        //api.scan(this.id, this._setScanCallback);
        //api.makeAPICall();

        this.moveFuncs = {};

        this.moveFuncs[Constants.movement.UP] = this.moveUp;
        this.moveFuncs[Constants.movement.RIGHT] = this.moveRight;
        this.moveFuncs[Constants.movement.DOWN] = this.moveDown;
        this.moveFuncs[Constants.movement.LEFT] = this.moveLeft;
        this.moveFuncs[Constants.movement.UPRIGHT] = this.moveUpright;
        this.moveFuncs[Constants.movement.DOWNRIGHT] = this.moveDownright;
        this.moveFuncs[Constants.movement.UPLEFT] = this.moveUpleft;
        this.moveFuncs[Constants.movement.DOWNLEFT] = this.moveDownleft;

        this.registerEvents();
    };

    /** Events **/
    Character.prototype.registerEvents = function() {
        // this.charHandler.onMove(logIT);
        // this.charHandlers.onPickup(logIT);
        // this.charHandlers.onWield(function(data) {
        //     logger.debug('Wielded item!\n');
        //     logger.debug(data);

        //     if (data.error) {
        //         logger.error(data.error);
        //         return;
        //     }
        //     _this.wieldedweapon = data.wieldedweapon;
        //     _this.wieldedweaponname = data.wieldedweaponname;
        // });

        // this.charHandlers.onEquip(function(data) {
        //     logger.debug('Equipped item!\n');
        //     logger.debug(data);

        //     if (data.error) {
        //         logger.error(data.error);
        //         return;
        //     }
        //     _this.equippedarmor = data.equippedarmor;
        //     _this.equippedarmorname = data.equippedarmorname;
        // });

        this.charHandler.onScan((function(data) {
            //console.log("(Character.js) scan", data);
            if (data && !data.error) {
                this.localMap = data.area;

                this.x = data.x;
                this.y = data.y;

                if(data.updates && data.updates.length > 0)
                {
                    console.log("scan updates are ");
                    console.dir(data.updates);
                    data.updates.forEach(function(update)
                    {
                        if(update.inventory)
                        {
                            console.log("===== character got new inventory..");
                            console.dir(update.inventory);
                            this.inventory = update.inventory;
                            EvtMgr.trigger('inventoryUpdate', this);
                        }
                        else if(update.character)
                        {
                            var stats = update.character;
                            var diff = false;
                            console.log("character "+this._id+" stats changed");
                            for(var s in stats)
                            {
                                if(this[s] != stats[s])
                                {
                                    console.log("===== character update from scan: '"+s+"' is now "+stats[s]);
                                    diff = true;
                                }
                                this[s] = stats[s];
                            }
                            if(diff)
                            {
                                EvtMgr.trigger('statsUpdate', this);
                            }
                        }
                        else if(update.message)
                        {
                            EvtMgr.trigger('newMessage', update.message);
                        }
                    }.bind(this));
                }
            }
        }).bind(this));

        this.charHandler.onDig(function(data) 
        {
            console.log(" -- onDig return call");
            EntityManager.getEntity(this._id, function(e)
            {
                console.log("entity "+e.name+" playing attack animation for dig");
                e._playAnimation('attack');
            });
        }.bind(this));

        this.charHandler.onGetHighscores(function(data) 
        {
            //console.log("char get ihghscores from charHandler: "+data);
            EvtMgr.trigger('newHighscores', data);
        });
    }

    Character.prototype.getHighscores = function() 
    {
        this.charHandler.getHighscores();
    };

    Character.prototype.getMap = function() {
        return this.localMap;
    };

    Character.prototype.update = function(delta) {

    };

    Character.prototype.dig = function(dir) 
    {
        this.charHandler.dig(dir);
    };

    Character.prototype.repair = function(id) 
    {
        this.charHandler.repair(id);
    };

    Character.prototype.craft = function(ids) 
    {
        this.charHandler.craft(ids);
    };

    Character.prototype.drop = function(id) 
    {
        this.charHandler.drop(id);
    };

    Character.prototype.wield = function(id) 
    {
        console.log("char wield new weapon called");
        this.charHandler.wield(id);
    };

    Character.prototype.equip = function(id) 
    {
        this.charHandler.equip(id);
    };

    Character.prototype.quaff = function(id) 
    {
        this.charHandler.quaff(id);
    };

    Character.prototype.moveLeft = function() {
        if (this.displayObject) {
            //this.displayObject.animate([2, 6], animationDuration);
            this.rotateModel(2, 'walk');
        }
        this.charHandler.move(Constants.movement.LEFT);
    };
    Character.prototype.moveRight = function() {
        if (this.displayObject) {
            //this.displayObject.animate([3, 7], animationDuration);
            this.rotateModel(6, 'walk');
        }
        this.charHandler.move(Constants.movement.RIGHT);
    };
    Character.prototype.moveUp = function() {
        if (this.displayObject) {
            //this.displayObject.animate([1, 5], animationDuration);
            this.rotateModel(0, 'walk');
        }
        this.charHandler.move(Constants.movement.UP);
    };
    Character.prototype.moveDown = function() {
        if (this.displayObject) {
            //this.displayObject.animate([0, 4], animationDuration);
            this.rotateModel(4, 'walk');
        }
        this.charHandler.move(Constants.movement.DOWN);
    };
    Character.prototype.moveUpright = function() {
        this.charHandler.move(Constants.movement.UPRIGHT);
        this.rotateModel(1, 'walk');
    };
    Character.prototype.moveUpleft = function() {
        this.charHandler.move(Constants.movement.UPLEFT);
        this.rotateModel(7, 'walk');
    };
    Character.prototype.moveDownright = function() {
        this.charHandler.move(Constants.movement.DOWNRIGHT);
        this.rotateModel(3, 'walk');
    };
    Character.prototype.moveDownleft = function() {
        this.charHandler.move(Constants.movement.DOWNLEFT);
        this.rotateModel(5, 'walk');
    };

    /**
     * Move character in a string-represented direction
     * @param  {String} direction The direction in which to move (down, downleft etc.)
     */
    Character.prototype.move = function(direction) 
    {
        this.calculateProspectiveMove(direction);
        this.moveFuncs[direction.toLowerCase()].call(this);
    };

    Character.prototype.onDead = function() {
        // TODO: Fulfill the characters last wishes
    };

    Character.prototype.calculateProspectiveMove = function(direction) 
    {
        console.log("direction = "+direction);
        var ent = {x: this.x, y: this.y, _id: this._id};
        for(var dir in this.moveMap)
        {
            var move = this.moveMap[dir];
            if(dir.search(direction) > -1)
            {
                ent[move.prop] += move.val;
            }
        }
        if(!this.mapobj.currentmap)
        {
            this.mapobj.currentmap = this.map;
        }
        if(!this.mapobj.getFeaturesForCoordinates(ent.x, ent.y).blocked)
        {
            EntityManager.getEntity(ent._id, function(obj) 
            {
                EvtMgr.trigger("prospectiveMove", {obj: obj, mesh: obj.displayObject, entity: ent});
            });
        }        
    };

    Character.prototype.toString = function() {
        return '[' + this._id + '] ' + this.name;
    };

    Character.prototype.de2ra = function(degree)   { return degree*(Math.PI/180); }

    return Character;
});