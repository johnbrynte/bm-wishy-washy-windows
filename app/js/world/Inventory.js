define([], function() {

    /** Class Inventory **/

    var Inventory = function() {
        this.items = {};
        this.size = 0;
    };

    Inventory.prototype.addItem = function(item) {
        if (typeof this.items[item.subtype] === 'undefined') {
            this.items[item.subtype] = {};
        }
        this.items[item.subtype][item.id] = item;
        this.size++;
    };

    Inventory.prototype.removeItem = function(itemID) {
        for (subtype in this.items) {
            for (id in this.items[subtype]) {
                if (id === itemID) {
                    delete this.items[subtype][id];
                    this.size--;
                    return;
                }
            }
        }

        return;
    };


    /*
        @return Object [item] - If it's in the inventory
                null          - Otherwise
    */
    Inventory.prototype.getItemByID = function(itemID) {
        for (subtype in this.items) {
            for (id in this.items[subtype]) {
                if (id === itemID) {
                    return this.items[subtype][id];
                }
            }
        }

        return null;
    };


    /*
        @return an inventory object like this;
        var items = {
            'weapon': {
                'uofjd83H3': {
                        'id':'uofjd83H3',
                        'name':'Dagger',
                        'subtype':'weapon',
                        'description':'A pointy dagger.',
                    },
                'uioa3rw32': {
                        'id':'uioa3rw32',
                        'name':'Long sword +1',
                        'subtype':'weapon',
                        'description':'A sharp steel-sword.',
                        'bonus':'+1',
                },
            },
            'armor':{
                'jiado3442': {
                    'id':'jiado3442',
                    'name':'Leather armor',
                    'subtype':'armor',
                    'description':'A cheap and lousy armor.',
                    'ac':'2',
                },
                'ajkflsdji': {
                    'id':'ajkflsdji',
                    'name':'Steel platemail',
                    'subtype':'armor',
                    'description':'A fine crafted armor.',
                    'ac':'8',
                }
            },
            'potion':{
                'p813ujdia': {
                    'id':'p813ujdia',
                    'name':'Potion of gaseous form',
                    'subtype':'potion',
                    'description':'Makes you walk through stuff.',
                },
            },
        }
    */
    Inventory.prototype.getItems = function() {
        return this.items;
    };

    Inventory.prototype.toString = function() {
        var s = '';

        for (var subtype in this.items) {
            s = s + subtype + '(s):\n';
            for (id in this.items[subtype]) {
                var item = this.items[subtype][id];
                var desc = '';
                if (item.description) {
                    desc = ' - ' + item.description;
                }
                s = s + '    ' + item.name + desc + '\n';
            };
        }

        return s;
    };

    /** End Class Inventory **/
    return Inventory;
});