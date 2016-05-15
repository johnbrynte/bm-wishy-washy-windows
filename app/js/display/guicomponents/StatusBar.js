define([
    './GUIComponent',
    './TextComponent',
    'display/AssetManager',
    'EventManager',
    'world/EntityManager',
    'utils/Constants'
], function(
    GUIComponent,
    TextComponent,
    AssMan,
    evtMgr,
    EntityManager,
    Constants
) {

    var StatusBar = function(director, height) {
        GUIComponent.call(this, AssMan.width, height);

        this.director = director;
        this.height = height;

        evtMgr.on('activeCharacterChange', function(ch) {
            console.log("statusbar got character " + ch.name);

            if (ch) {
                if (!this.char) {
                    this.setDisplay(AssMan.Panel(AssMan.images.border, this.width, this.height, 9, 9));
                }
            } else {
                this.setDisplay(null);
            }

            this.char = ch;

            evtMgr.on('statsUpdate', function(cha) {
                if (cha._id == ch._id) {
                    console.log("StatusBar got stats update:");

                    this.update();
                }
            }.bind(this));

            this.update();

        }.bind(this));
    };

    StatusBar.prototype = Object.create(GUIComponent.prototype);

    StatusBar.prototype.update = function() {
        if (this.char) {
            console.log("StatusBar drawing info for character " + this.char.name);
            this.removeChildren();

            var textColor = 0x000000;
            var textSize = 20;
            var spacingLeft = 10;
            var spacingTop = 9;
            var height = this.height * 0.7;

            // First column
            var charWidth = 400;
            var charContainer = new GUIComponent(charWidth, height)
                .setLayout(Constants.layout.VERTICAL);
            var name = new TextComponent('Name: ' + this.char.name)
                .setTextColor(textColor)
                .setTextSize(textSize)
                .setSize(charWidth, height / 2);
            //name.display.position.setY(-7);
            charContainer.addChild(name);
            var status = new GUIComponent(charWidth, height / 2)
                .setLayout(Constants.layout.HORIZONTAL);
            ['hp', 'ac', 'level'].forEach(function(stat) {
                    var text = new TextComponent(stat + ': ' + this.char[stat])
                        .setTextColor(textColor)
                        .setTextSize(textSize)
                        .setSize(charWidth / 3, height / 2);
                    //text.display.position.setY(3);
                    status.addChild(text);
                }.bind(this));
            charContainer.addChild(status);
            charContainer.setPosition(spacingLeft, spacingTop);
            this.addChild(charContainer);
            window.nameComponent = name;
            window.statusComponent = status;

            // Second column
            var statWidth = 300;
            var stats = new GUIComponent(statWidth, height).setLayout(Constants.layout.GRID);
            ['exp', 'str', 'dex', 'con', 'int', 'wis'].forEach(function(stat) {
                var text = new TextComponent(stat + ': ' + this.char[stat])
                    .setTextColor(textColor)
                    .setTextSize(textSize)
                    .setSize(statWidth / 3, height / 2);
                stats.addChild(text);
            }.bind(this));
            stats.setPosition(charWidth + spacingLeft, spacingTop);
            this.addChild(stats);

            // Third column
            var itemWidth = 300;
            var itemContainer = new GUIComponent(itemWidth, height).setLayout(Constants.layout.VERTICAL);
            itemContainer.setPosition(charWidth + statWidth + spacingLeft, spacingTop);
            this.addChild(itemContainer);

            EntityManager.getEntity(this.char['wieldedweapon'], function(w) {
                var text = new TextComponent('Weapon: ' + w.name)
                    .setTextColor(textColor)
                    .setTextSize(textSize)
                    .setSize(itemWidth, height / 2);
                itemContainer.addChild(text);
            }.bind(this));

            EntityManager.getEntity(this.char['equippedarmor'], function(a) {
                var text = new TextComponent('Armor: ' + a.name)
                    .setTextColor(textColor)
                    .setTextSize(textSize)
                    .setSize(itemWidth, height / 2);
                itemContainer.addChild(text);
            }.bind(this));
        }
    };

    return StatusBar;
});