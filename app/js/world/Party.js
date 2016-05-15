/*
    TODO:
    - add code for adding/deleting party members,
      (creating/deleting characters)
*/
define([
    'api/api',
    'world/Map',
    'world/Character',
    'utils/logger',
    'world/PartyHandler',
    'world/CharacterHandler',
    'EventManager'
], function(
    api,
    Map,
    Character,
    logger,
    PartyHandler,
    CharacterHandler,
    evtMgr) {

    var Party = function(partyHandler) {
        this.activeCharacterID = null;
        this.activeCharacter = null;
        this.activeCharacterObject = null;
        /*
        The members of the party are given as key value pairs:
        {
            [ID]: [Character object],
            ...
        }
         */
        this.members = {};
        this.partyHandler = partyHandler;
        this.map = new Map();
        this._registerEvents();

        evtMgr.on('getExistingParty', function()
        {
            console.log("party got 'getExistingParty..");
            evtMgr.trigger('partyChange', this.members);
        }.bind(this));
    };

    Party.prototype.update = function() {
        this.partyHandler.getParty();
    };

    Party.prototype.getActiveCharacter = function() {
        if (this.activeCharacterID !== null) {
            if (this.members[this.activeCharacterID] !== undefined) {
                return this.members[this.activeCharacterID];
            }
        }
        return null;
    };

    Party.prototype._registerEvents = function() {
        this.partyHandler.onCreateCharacter((function(data) {
            console.log("(Party.js) Response from server:", data);
            // Update party to set active character
            this.update();
        }).bind(this));

        var handleCharacterScan = (function(data) {
            if (!data || data.error) {
                // Something went wrong, better consult the party
                this.update();
            } else {
                this.map.extend(data, Object.keys(this.members));
                evtMgr.trigger('onScan', [data, this.map]);
            }
        }).bind(this);

        var handleCharacterData = (function(data)
        {
            console.log("Party:handleCharacterData got "+data);
            console.dir(data);
            var character;

            if (!data) {
                console.log("(Party.js)",
                    "No char data... Dead/Server down?");
                return;
            }

            if (data.error) {
                console.log("(Party.js)", data.error);
                return;
            }

            //---------------------------------------------------------------

            if (!this.members[data.id])
            {
                character = new Character(data, null, new CharacterHandler(data.id), this.map);
                this.members[data.id] = character;
                character.charHandler.onScan(handleCharacterScan);
            }
            else
            {
                // TODO: Pass to character data update function
                character = this.members[data.id];
                character.hp = data.hp;
            }

            if (this.activeCharacterID && this.activeCharacterID !==
                data.id) {
                //evtMgr.trigger('activeCharacterChange', character);
            }
            console.log("PartyHandler triggering 'partyChange'......");
            evtMgr.trigger('partyChange', this.members);
        }).bind(this);

        this.partyHandler.onCreateCharacter(handleCharacterData);
        this.partyHandler.onGetCharacter(handleCharacterData);

        this.partyHandler.onGetParty((function(data) {
            console.log("Party:onGetParty called with "+data);
            console.dir(data);
            var i,
                killed = [];

            if (!data || data.error) {
                this.activeCharacterID = null;
                return;
            }

            for (i in this.members) {
                if (data.characters.indexOf(i) === -1) {
                    // Notify that a warrior has fallen
                    this.members[i].onDead();
                    killed.push(i);
                    if (i === this.activeCharacterID) {
                        this.activeCharacterID = null;
                        //evtMgr.trigger('activeCharacterChange', null);
                    }
                }
            }

            for (i = 0; i < killed.length; i++) {
                delete this.members[killed[i]];
            }

            for (i = 0; i < data.characters.length; i++) {
                if (!this.members[data.characters[i]]) {
                    this.members[data.characters[i]] = null;
                }
            }

            // Set the first character as active if none are chosen
            if (this.activeCharacterID === null && data.characters.length >
                0) {
                this.activeCharacterID = data.characters[0];
            }


            data.characters.forEach((function(charid) {
                this.partyHandler.getCharacter(charid);
            }).bind(this));
        }).bind(this));
    };

    Party.prototype.toString = function() {
        var s = '';
        for (var i = 0; i < this.members.length; i++) {
            s = s + this.members[i].name + '\n';
        }
        return s;
    };

    return Party;
});