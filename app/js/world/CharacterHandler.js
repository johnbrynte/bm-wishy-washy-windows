define(['api/api', 'EventManager'], function(api, evtMgr) {
    var CharacterHandler = function(id) {
        this.id = id;

        this._scanSubscribers = [];
        this._getSubscribers = [];
        this._pickupSubscribers = [];
        this._wieldSubscribers = [];
        this._unwieldSubscribers = [];
        this._equipSubscribers = [];
        this._unequipSubscribers = [];
        this._quaffSubscribers = [];
        this._dropSubscribers = [];
        this._moveSubscribers = [];
        this._levelUpSubscribers = [];
        this._levelDownSubscribers = [];
        this._planeshiftSubscribers = [];
        this._digSubscribers = [];
        this._repairSubscribers = [];
        this._craftSubscribers = [];
        this._getHighscoresSubscribers = [];

        evtMgr.on('get', function(data) {
            this.pickupItems();
        }.bind(this));

        
    }


    CharacterHandler.prototype.onScan = function(fn) {
        this._scanSubscribers.push(fn);
    };

    /*
        @event onPickup
    */
    CharacterHandler.prototype.onPickup = function(fn) {
        this._pickupSubscribers.push(fn);
    };

    /*
        @event onWield
    */
    CharacterHandler.prototype.onWield = function(fn) {
        this._wieldSubscribers.push(fn);
    };


    /*
        @event onUnwield
    */
    CharacterHandler.prototype.onUnwield = function(fn) {
        this._unwieldSubscribers.push(fn);
    };


    /*
        @event onEquip
    */
    CharacterHandler.prototype.onEquip = function(fn) {
        this._equipSubscribers.push(fn);
    };


    /*
        @event onUnequip
    */
    CharacterHandler.prototype.onUnequip = function(fn) {
        this._unequipSubscribers.push(fn);
    };


    /*
        @event onQuaff
    */
    CharacterHandler.prototype.onQuaff = function(fn) {
        this._quaffSubscribers.push(fn);
    };


    /*
        @event onDrop
    */
    CharacterHandler.prototype.onDrop = function(fn) {
        this._dropSubscribers.push(fn);
    };

    /*
        @event onMove
     */
    CharacterHandler.prototype.onMove = function(fn) {
        this._moveSubscribers.push(fn);
    };

    /*
        @event onLevelUp
     */
    CharacterHandler.prototype.onLevelUp = function(fn) {
        this._levelUpSubscribers.push(fn);
    };

    /*
        @event onLevelDown
     */
    CharacterHandler.prototype.onLevelDown = function(fn) {
        this._levelDownSubscribers.push(fn);
    };

    /*
        @event onPlaneshift
     */
    CharacterHandler.prototype.onPlaneshift = function(fn) {
        this._planeshiftSubscribers.push(fn);
    };

    CharacterHandler.prototype.onDig = function(fn) {
        this._digSubscribers.push(fn);
    };

    CharacterHandler.prototype.onRepair = function(fn) {
        this._repairSubscribers.push(fn);
    };

    CharacterHandler.prototype.onCraft = function(fn) {
        this._craftSubscribers.push(fn);
    };

    CharacterHandler.prototype.onGetHighscores = function(fn) {
        this._getHighscoresSubscribers.push(fn);
    };


    /**
        API-call wrappers.
    **/

    CharacterHandler.prototype.scan = function() {
        api.scan(this.id, (function(data) {
            for (var i = this._scanSubscribers.length - 1; i >= 0; i--) {
                this._scanSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.pickupItems = function() {
        api.get(this.id, (function(data) {
            for (var i = 0; i < this._getSubscribers.length; i++) {
                this._getSubscribers[i](data);
            }
        }).bind(this));
    };


    CharacterHandler.prototype.wield = function(itemID) {
        api.wield(this.id, itemID, (function(data) {
            for (var i = 0; i < this._wieldSubscribers.length; i++) {
                this._wieldSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.unwield = function(itemID) {
        api.unwield(this.id, itemID, (function(data) {
            for (var i = 0; i < this._unwieldSubscribers.length; i++) {
                this._unwieldSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.equip = function(itemID) {
        api.equip(this.id, itemID, (function(data) {
            for (var i = 0; i < this._equipSubscribers.length; i++) {
                this._equipSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.unequip = function(itemID) {
        api.unequip(this.id, itemID, (function(data) {
            for (var i = 0; i < this._unequipSubscribers.length; i++) {
                this._unequipSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.quaff = function(itemID) {
        api.quaff(this.id, itemID, (function(data) {
            for (var i = 0; i < this._quaffSubscribers.length; i++) {
                this._quaffSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.drop = function(itemID) {
        api.drop(this.id, itemID, (function(data) {
            for (var i = 0; i < this._dropSubscribers.length; i++) {
                this._dropSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.move = function(direction) {
        
        api.move(this.id, direction, (function(data) {
            for (var i = 0; i < this._moveSubscribers.length; i++) {
                this._moveSubscribers[i](data);
            }
            // TODO: As all moves returns a scan with the results, this might be confusing, but effective
            for (var j = 0; j < this._scanSubscribers.length; j++) {
                this._scanSubscribers[j](data);
            }
        }).bind(this), false, api.HIGH_PRIORITY);
    };

    CharacterHandler.prototype.levelUp = function() {
        api.levelUp(this.id, (function(data) {
            for (var i = 0; i < this._levelUpSubscribers.length; i++) {
                this._levelUpSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.levelDown = function() {
        api.levelDown(this.id, (function(data) {
            for (var i = 0; i < this._levelDownSubscribers.length; i++) {
                this._levelDownSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.planeshift = function(planename) {
        api.planeshift(this.id, planename, (function(data) {
            for (var i = 0; i < this._planeshiftSubscribers.length; i++) {
                this._planeshiftSSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.dig = function(dir) 
    {
        api.dig(dir, this.id, (function(data) {
            console.log("* * dig api call returns "+data);
            for (var i = 0; i < this._digSubscribers.length; i++) {
                this._digSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.repair = function(id) 
    {
        api.repair(id, this.id, (function(data) {
            console.log("* * repair api call returns "+data);
            for (var i = 0; i < this._repairSubscribers.length; i++) {
                this._repairSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.craft = function(ids) 
    {
        api.craft(ids, this.id, (function(data) {
            console.log("* * craft api call returns "+data);
            for (var i = 0; i < this._craftSubscribers.length; i++) {
                this._craftSubscribers[i](data);
            }
        }).bind(this));
    };

    CharacterHandler.prototype.getHighscores = function() 
    {
        api.getHighscores(this.id, (function(data) {
            //console.log("* * gethighscores api call returns "+data);
            for (var i = 0; i < this._getHighscoresSubscribers.length; i++) {
                this._getHighscoresSubscribers[i](data);
            }
        }).bind(this));
    };

    

    return CharacterHandler;
});