define([
    './GUIComponent',
    'world/EntityManager',
    './GridDialog',
    'display/AssetManager',
    'EventManager'
], function(
    GUIComponent,
    EntMan,
    GridDialog,
    AssMan,
    EvtMgr
) {
    var Crafting = function(director) {
        GridDialog.call(this, director);
        this.ids = [];
    };

    Crafting.prototype = Object.create(GridDialog.prototype);

    Crafting.prototype.init = function(character) {
        this.character = character;

        this.addButton('Combine', function(i, data) {
            console.log("crafting selected");
            var ids = this.ids.join();
            this.character.craft(ids);

        }.bind(this));

        this.addButton('Clear', function(i, data) {
            this.clearGrid();
        }.bind(this));

        this.addButton('Cancel', function(i, data) {
            this.clearGrid();
            this.ids = [];
            this.setVisible(false);
        }.bind(this));

        return this;
    };

    Crafting.prototype.onItemSelected = function(item) {
        console.log("Crafting sent inventory selected item " + item.name);

    };

    Crafting.prototype.onInventorySelect = function(item) {
        var el = new GUIComponent()
            .setDisplay(AssMan.Sprite(AssMan.images[item.name]));
        console.log("Crafting adding item " + item.name);
        this.ids.push(item._id);
        this.addElement(el, item, this.onItemSelected.bind(this));
    };


    return Crafting;
});