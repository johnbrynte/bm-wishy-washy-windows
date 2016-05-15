define([
    'api/api',
    'EventManager'
], function(
    api,
    evtMgr
) {

    /** Class PartyHandler **/

    var PartyHandler = function() {
        var that = this;

        this._characterCreateSubscribers = [];
        this._characterDeleteSubscribers = [];
        this._getPartySubscribers = [];
        this._getCharacterSubscribers = [];

        // TODO: Not sure how this relates to the below onCreateCharacter function...
        evtMgr.on('createCharacter', function(data) {
            that.createCharacter(data.name, data.str, data.dex,
                data.con,
                data.int, data.wis);
        });

        evtMgr.on('requestGetParty', function(e)
        {
            console.log("PartyHandler got request for getParty");
            this.getParty();
        }.bind(this));

    };

    PartyHandler.prototype.onCreateCharacter = function(fn) {
        this._characterCreateSubscribers.push(fn);
    };

    PartyHandler.prototype.onDeleteCharacter = function(fn) {
        this._characterDeleteSubscribers.push(fn);
    };

    PartyHandler.prototype.onGetParty = function(fn) {
        this._getPartySubscribers.push(fn);
    };

    PartyHandler.prototype.onGetCharacter = function(fn) {
        this._getCharacterSubscribers.push(fn);
    };

    PartyHandler.prototype.createCharacter = function(name, str, dex,
        con, int, wis) {
        var charInfo = {
            'name': name,
            'str': str,
            'dex': dex,
            'con': con,
            'int': int,
            'wis': wis
        };
        api.createCharacter(charInfo, (function(data) {
            for (var i = 0; i < this._characterCreateSubscribers.length; i++) {
                this._characterCreateSubscribers[i](data);
            }
        }).bind(this));
    };

    PartyHandler.prototype.deleteCharacter = function(charID) {
        api.deleteCharacter(charID, (function(data) {
            for (var i = 0; i < this._characterDeleteSubscribers.length; i++) {
                this._characterDeleteSubscribers[i](data);
            }
        }).bind(this));
    };

    PartyHandler.prototype.getParty = function() {
        console.log("PartyHandler.getParty called");
        api.getParty((function(data) {
            console.log("PartyHandler.getParty got data from server: "+data);
            for (var i = 0; i < this._getPartySubscribers.length; i++) {
                this._getPartySubscribers[i](data);
            }
        }).bind(this));
    };

    PartyHandler.prototype.getCharacter = function(charID) {
        api.getCharacter(charID, (function(data) {
            for (var i = 0; i < this._getCharacterSubscribers.length; i++) {
                this._getCharacterSubscribers[i](data);
            }
        }).bind(this));
    };

    return PartyHandler;

    /** End Class PartyHandler **/

});