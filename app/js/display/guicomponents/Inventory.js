define([
    './GUIComponent',
    'world/EntityManager',
    './GridDialog',
    'display/AssetManager',
    'EventManager',
    './Crafting'
], function(
    GUIComponent,
    EntMan,
    GridDialog,
    AssMan,
    EvtMgr,
    Crafting
) {
    var Inventory = function(director) {
        GridDialog.call(this, director);
    };

    Inventory.prototype = Object.create(GridDialog.prototype);

    Inventory.prototype.init = function() {
        this.addButton('Use', function(i, data) {

            if (i != -1) {
                if (data.subtype == "weapon") {
                    this.character.wield(data._id);
                } else if (data.subtype == "armor") {
                    this.character.equip(data._id);
                } else if (data.subtype == "potion") {
                    this.character.quaff(data._id);
                }
            }
        }.bind(this));

        this.addButton('Drop', function(i, data) {
            if (i != -1) {
                this.character.drop(data._id);
            }
        }.bind(this));

        this.addButton('Repair', function(i, data) {
            if (i != -1) {
                console.log("Repairing " + data.name);
                this.character.repair(data._id);
            }
        }.bind(this));

        this.addButton('Craft', function(i, data) {
            console.log("Craft chosen.");
            if (!this.crafting) {
                this.crafting = new Crafting(this.director);
                this.crafting.setPosition(320, 60);
                this.director.addChild(this.crafting);
                this.crafting.setSize(300, 300).setColumns(5).init(this.character);

                console.log("/// Crafting created");
            }
            this.crafting.setVisible(true);

        }.bind(this));

        EvtMgr.on('inventoryUpdate', this.onInventoryUpdate.bind(this));

        return this;
    };

    Inventory.prototype.onItemSelected = function(item) {
        console.log("inventory item " + item.name + " selected");
        if (this.crafting) {
            this.crafting.onInventorySelect(item);
        }
    };

    Inventory.prototype.onSetVisible = function(v) {
        if (this.crafting) {
            this.crafting.setVisible(false);
        }
    };

    Inventory.prototype.onInventoryUpdate = function(character) {
        this.loadInventory(character);
    };

    Inventory.prototype.loadInventory = function(character) {
        this.clearGrid();
        if (this.crafting) {
            this.crafting.setVisible(false);
        }
        console.log(
            "++++++++++ +++++++++++++ +++++++++++++ Inventory.loadInventory called"
        );
        this.character = character;
        character.inventory.forEach(function(id) {
            EntMan.getEntity(id, function(ent) {
                var el = new GUIComponent()
                    .setDisplay(AssMan.Sprite(AssMan.images[ent.name]));
                console.log("Inventory adding item " + ent.name);
                console.dir(ent);
                this.addElement(el, ent, this.onItemSelected.bind(this));
            }.bind(this));
        }.bind(this));
    };

    return Inventory;
});