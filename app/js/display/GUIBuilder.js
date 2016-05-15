/**
 *  GUIBuilder.js
 *
 * Builds the whole GUI, creates joysticks and buttons and panels and stuff.
 */
define([
    'utils/Constants',
    'display/guicomponents/GUIComponent',
    'display/guicomponents/PopupJoystick',
    'display/guicomponents/Button',
    'display/guicomponents/SelectCharacterPanel',
    'display/AssetManager',
    'display/guicomponents/Joystick',
    'EventManager',
    'display/guicomponents/GridDialog',
    'display/guicomponents/Inventory',
    'api/api',
    'utils/animation',
    'display/guicomponents/StatusBar',
    'display/guicomponents/MessagePanel',
    'display/guicomponents/HighscorePanel'
], function(
    Constants,
    GUIComponent,
    PopupJoystick,
    Button,
    CharPanel,
    AssMan,
    Joystick,
    evtMgr,
    GridDialog,
    Inventory,
    api,
    Animation,
    StatusBar,
    MessagePanel,
    HighscorePanel
) {
    var self = {};

    /**
     * Builds the whole gui experience on the specified director
     * @param  {GUIComponent.Director} director
     */
    self.build = function(director) {
        /*
        var panel = director.newChild()
            .setSize(800, 600);
        panel.layoutMargin = 10;
        panel.margin.left = panel.margin.right = 20;
        panel.margin.top = panel.margin.bottom = 10;
        panel.setLayout(Constants.layout.VERTICAL);
        panel.setDisplay(director.gui.createPanel());
        var text = new GUIComponent()
            .setDisplay(director.gui.createText('This text is fitted within the predefined size.', 80));
        text.setSize(800, text.display.height);
        panel.addChild(text);
        var sprite = new GUIComponent(300, 300)
            .setPosition(100, 300)
            .setDisplay(director.gui.createSprite(AssMan.images.bluemoon));
        panel.addChild(sprite);
        */

        self.director = director;

        var bWidth = AssMan.width * 0.3;
        var bHeight = bWidth * 0.2;
        var statusHeight = 60;
        var iSize = AssMan.height * 0.15;
        var messageWidth = AssMan.width * 0.3;
        var messageHeight = AssMan.height * 0.6;

        var guiZIndex = 10;

        this.messagePanel = new MessagePanel(director, AssMan.width - messageWidth, 60, messageWidth, messageHeight);
        director.addChild(this.messagePanel);
        this.messagePanel.setZIndex(guiZIndex);

        //window.message = this.messagePanel;

        this.highscorePanel = new HighscorePanel(director, AssMan.width + 50 -
            messageWidth * 3, 60, messageWidth * 2 - 40, messageHeight);
        director.addChild(this.highscorePanel);
        this.highscorePanel.setVisible(false);
        this.highscorePanel.setZIndex(guiZIndex);

        var iconHighscore = director.createIconButton(5 * iSize, AssMan.height -
            iSize, iSize, iSize, AssMan.images.icon_highscore,
            function() {
                console.log("highscore button clicked");
                if (!this.highscorePanel.visible) {
                    if (this.character) {
                        this.character.charHandler.getHighscores();
                    }
                }
                this.highscorePanel.toggleVisibility();
            }.bind(this)
        );

        director.addChild(iconHighscore);
        iconHighscore.setZIndex(guiZIndex);

        //--------------------------------------------------------

        evtMgr.on('partyChange', function(chars) {
            this.chars = chars;
        }.bind(this));

        //--------------------------------------------------------

        var iconParty = director.createIconButton(0, AssMan.height - iSize,
            iSize, iSize, AssMan.images.icon_party, function() {
                console.log("Select character", iconParty.display);
                if (!this.charpanel) {
                    var height = iSize + 3 * bHeight;
                    this.charpanel = new CharPanel(0, AssMan.height -
                        height, bWidth, bHeight, director, this.chars);
                    director.addChild(this.charpanel);
                    this.charpanel.setZIndex(guiZIndex);
                } else {
                    this.charpanel.toggleVisibility();
                }
                if (this.charpanel.visible) {
                    this.charpanel.showCharacters();
                }
            }.bind(this));
        director.addChild(iconParty);
        iconParty.setZIndex(guiZIndex);
        evtMgr.on('partyChange', function(chars) {
            iconParty.activate();
        });

        var iconCreate = director.createIconButton(iSize, AssMan.height -
            iSize, iSize, iSize, AssMan.images.icon_create, function() {
                console.log("create character button clicked");
                api.getRandomUserName(function(name) {
                    // Create a default character
                    evtMgr.trigger('createCharacter', {
                        'name': name,
                        'str': 10,
                        'dex': 18,
                        'con': 10,
                        'int': 10,
                        'wis': 10
                    });
                    if (this.charpanel) {
                        this.charpanel.setVisible(false);
                    }
                }.bind(this));
            }.bind(this));
        director.addChild(iconCreate);
        iconCreate.setZIndex(guiZIndex);

        var iconInventory = director.createIconButton(2 * iSize, AssMan.height -
            iSize, iSize, iSize, AssMan.images.icon_inventory, function() {
                console.log("show inventory button clicked");
                if (this.character) {
                    if (!this.inventory) {
                        this.inventory = new Inventory(director);
                        window.inventory = this.inventory;

                        this.inventory.setPosition(0, 60);
                        director.addChild(this.inventory);
                        this.inventory.setZIndex(guiZIndex);

                        this.inventory.setSize(300, 300).setColumns(5).init();
                        //this.inventory.visible = true;
                        console.log("/// inventory created");
                        //console.dir(this.inventory);
                    }

                    console.log("inventory visible before was " + (this
                            .inventory.visible) +
                        ", this.inventoryshown = " + this.inventoryshown
                    );
                    this.inventoryshown = !this.inventoryshown;

                    this.inventory.setVisible(this.inventoryshown);
                    console.log("inventory visible is now set to " +
                        this.inventory.visible +
                        ", this.inventoryshown = " + this.inventoryshown
                    );

                    if (this.inventory.visible) {
                        this.inventory.loadInventory(this.character);
                    }
                }
            }.bind(this));
        director.addChild(iconInventory);
        iconInventory.setZIndex(guiZIndex);

        var iconGet = director.createIconButton(3 * iSize, AssMan.height -
            iSize, iSize, iSize, AssMan.images.icon_treasure, function() {
                console.log("get from floor");
                if (this.character) {
                    this.character.charHandler.pickupItems();
                }

            }.bind(this));
        iconGet.setVisible(false);
        director.addChild(iconGet);
        iconGet.setZIndex(guiZIndex);
        evtMgr.on('character_on_item', function() {
            iconGet.setVisible(true);
        });
        evtMgr.on('character_off_item', function() {
            iconGet.setVisible(false);
        });

        var joystickSize = AssMan.height * 0.4;
        var joystick = new Joystick(joystickSize, joystickSize)
            .setPosition(50, AssMan.height / 2 - joystickSize / 2);
        director.addChild(joystick);

        this.statusbar = new StatusBar(director, statusHeight);
        director.addChild(this.statusbar);
        this.statusbar.setZIndex(guiZIndex);
        window.statusbar = this.statusbar;

        evtMgr.on('activeCharacterChange', function(ch) {
            console.log("/////// setting character to " + ch.name + " in GUIBuilder");
            this.character = ch;
            if (this.charpanel) {
                this.charpanel.setVisible(false);
            }

        }.bind(this));
    }
    return self;
});