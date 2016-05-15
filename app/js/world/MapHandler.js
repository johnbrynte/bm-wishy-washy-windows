define([
    'api/api',
    'EventManager'
], function(
    api,
    evtMgr
) {

    /** Class MapHandler **/

    var MapHandler = function() {
        this._mapUpdateSubscribers = [];
    };

    MapHandler.prototype.onMapUpdate = function(fn) {
        this._mapUpdateSubscribers.push(fn);
    };

    MapHandler.prototype.mapUpdate = function(data) {
        for (var i = 0; i < this._mapUpdateSubscribers.length; i++) {
            this._mapUpdateSubscribers[i](data);
        }
    };

    return MapHandler;

    /** End Class MapHandler **/

});