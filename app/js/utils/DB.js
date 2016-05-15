/* Exports "singleton" */
define([], function() {

    /* Dead simple interface to localStorage to simulate a database. */
    var DB = {};

    DB.__Storage = window.localStorage;

    DB.put = function(key, data) {
        if (DB.__Storage[key] === undefined) {
            DB.__Storage[key] = JSON.stringify(data);
        }
    };

    DB.edit = function(key, data) {
        DB.__Storage[key] = JSON.stringify(data);
    };


    /*!
     * Gets something from the database.
     * @param  {String} key for the object to fetch
     * @return {Object} whatever you stored here.
     * @throws When the key is non-existant
     */
    DB.get = function(key) {
        var tmp;

        // Might be something fishy going on here...
        if (DB.__Storage[key] === undefined) {
            throw "404, not in database";
        }
        tmp = JSON.parse(DB.__Storage[key]);
        return tmp;
    };

    return DB;
});