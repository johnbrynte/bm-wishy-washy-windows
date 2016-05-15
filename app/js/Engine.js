define([
    'utils/Timer',
    'lib/tween',
    'display/webgl/game/GameView',
    'display/guicomponents/Director',
    'display/GUIBuilder',
    'display/gui/GUICanvas',
    'world/Character',
    'display/webgl/primitives/Sprite',
    'tests/APITest',
    'world/Party',
    'world/PartyHandler',
    'world/EntityManager',
    'api/api',
    'EventManager',
    'GodConsole',
    'utils/animation',
    'utils/Globals'
], function(
    Timer,
    TWEEN,
    GameView,
    Director,
    GUIBuilder,
    GUICanvas,
    Character,
    Sprite,
    APITest,
    Party,
    PartyHandler,
    EntityManager,
    api,
    evtMgr,
    GodConsole,
    Animation,
    Globals
) {
    var Engine = function(AssMan) {

        var that = this;

        /** BUILD GUI/INPUT/GRAPHICS **/
        this.AssMan = AssMan;
        this.gameView = new GameView();
        this.director = new Director(AssMan);
        this.gameView.gui.add(this.director.object3d);
        //this.GUIOverlay = this.gameView.addOverlay(this.director.gui.getMesh());

        this.mainComponent = this.director.newChild();
        this.mainComponent.setSize(AssMan.width, AssMan.height);

        GUIBuilder.build(this.director);

        /** INIT GAME (PARTY ETC.) **/
        this.world = {};
        this.partyhandler = new PartyHandler();
        var party = this.party = new Party(this.partyhandler);
        Globals.Party = party;
        window.GOD = Globals.GodConsole.setParty(party);

        evtMgr.on('enableSimpleGameView', (function(bool) {
            this.gameView.setSimpleMode(bool);
        }).bind(this));

        /*
        Animation.addInterval((function() {
            this.party.update();
        }).bind(this), 1000);
        */

        var sound = new Howl({
            urls: ['assets/dungeon-ambience.wav'],
            autoplay: false,
            loop: true,
            volume: 0.5
        });

        //sound.play();

        evtMgr.on('activeCharacterChange', (function(ch) {
            //
            //  --- TODO: Actually delete any existing timers and info when switching characters !!
            //  The below code one works the very once.
            //
            if (!ch) {
                console.log("* UgH! Engine -> no character in activeCharacterChange")
                this.gameView.setActiveCharacter(null);
                // This update should probably be called continuous
                this.party.update();
                return;
            } else {
                console.log("++++++++++++++++++++++++++++++ Engine active character changed");
                EntityManager.getEntity(ch._id, function(obj) {
                    this.gameView.setActiveCharacter(ch);
                    this.gameView.setMap(party.map);

                    Animation.addInterval((function() {
                        var chr = this.party.getActiveCharacter();
                        if (chr) {
                            // Scan and update character
                            chr.charHandler.scan();
                        }
                    }).bind(this), 250);
                    // Iniital scan, doh
                    ch.charHandler.scan();
                    ch.getHighscores();
                    //console.log("Scan sent.");
                }.bind(this));
            }

        }).bind(this));

        console.log("calling getparty");
        this.partyhandler.getParty();

        evtMgr.on("move", function(evt) {
            var ch = party.getActiveCharacter();

            if (!ch) // Oh dear, we're dead...
            {
                console.log("** ** ** tried to move but apaprently we've got no active character. Eh?");
                console.dir(party);
            } else {
                ch.move(evt.direction);
            }

        });

        evtMgr.on("dig", function(evt) {
            var ch = party.getActiveCharacter();

            if (!ch) // Oh dear, we're dead...
            {
                console.log("** ** ** tried to move but apaprently we've got no active character. Eh?");
                console.dir(party);
            } else {
                ch.dig(evt.direction);
            }

        });

        evtMgr.on("animate", function(name) {
            var ch = party.getActiveCharacter();
            EntityManager.getEntity(ch._id, function(obj) {
                obj.animator.play(name);
                //obj._playAnimation(name);
            });
        });

        /*Animation.addInterval((function() {
            //this.director.draw();
        }).bind(this), 200);*/

        /*Animation.addInterval((function() {
            this.gameView.draw();
        }).bind(this), 1000 / 24);*/

        //this.gameView.draw();
    };

    Engine.prototype.update = function(timeStamp) {
        Animation.update();
        TWEEN.update(timeStamp);

        this.gameView.draw();

        api.makeAPICall();
    };

    return Engine;

});