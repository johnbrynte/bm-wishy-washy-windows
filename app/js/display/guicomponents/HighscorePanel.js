define([
    './GUIComponent',
    'display/AssetManager',
    'EventManager',
    'world/EntityManager',
    'utils/Constants'
], function(
    GUIComponent,
    AssMan,
    evtMgr,
    EntityManager,
    Constants
) {

    var HighscorePanel = function(director, x, y, width, height) {

        GUIComponent.call(this, width, height);

        this.messageQueue = [];
        this.shownMessages = [];
        this.director = director;
        this.oldRows = [];

        this.setDisplay(AssMan.Rect(this.width, this.height, 0x000000, 0.6));
        this.setLayout(Constants.layout.VERTICAL);
        this.setLayoutAlign(Constants.layout.LEFT);

        evtMgr.on('newHighscores', function(msg) {
            console.log("+++ HighscorePanel got new message: '" + msg + "' visible is " + this.visible);
            if (this.visible) {
                this.printHighscores(msg);
            } else {
                console.log("muting highscoreoutput, since we're not visible..");
            }
        }.bind(this));

        this.setPosition(x, y);
    };

    HighscorePanel.prototype = Object.create(GUIComponent.prototype);

    HighscorePanel.prototype.printHighscores = function(m) {
        console.dir(m);

        if (m.success) {
            this.oldRows.forEach(function(oldrow) {
                this.removeChild(oldrow);
            }.bind(this));
            this.oldRows = [];
            m.success.forEach(function(sobj, i) {
                var score = sobj.name + ", Level " + sobj.level + ", score " + sobj.score + " [equipped with " + sobj.armor + " and " + sobj.weapon + "]";
                var textComponent = this.director.createTextComponent(i + ". " + score, 20);

                // Simple message parsing
                if (score.search('missed') != -1) {
                    textComponent.setColor(0xF09D84);
                } else if (score.search('scored') != -1) {
                    textComponent.setColor(0x9FE67E);
                } else {
                    textComponent.setColor(0xFFFFFF);
                }

                this.addChild(textComponent);

                this.oldRows.push(textComponent);


            }.bind(this));

            //this._applyLayout();
            console.log(this);
        }
    };

    //console.log("returning HighscorePanel "+HighscorePanel);
    return HighscorePanel;

});