define([
    './GUIComponent',
    'display/AssetManager',
    'EventManager',
    'world/EntityManager'
], function(
    GUIComponent,
    AssMan,
    evtMgr,
    EntityManager
) {

    var SelectCharacterPanel = function(x, y, width, height, director, initialchars) {
        GUIComponent.call(this, width, height * 3);
        this.chars = initialchars;
        this.director = director;
        this.x = x;
        this.y = y;

        this.buttonHeight = height;

        evtMgr.on('partyChange', function(chars) {
            console.log("+++ select character got partyChange: " + chars);
            console.dir(chars);
            this.chars = chars;
            this.showCharacters();
        }.bind(this));

        this.butts = [];

        //console.log("charpanel asking for 'getExistingParty'");
        //evtMgr.trigger('getExistingParty', {});
    };

    SelectCharacterPanel.prototype = Object.create(GUIComponent.prototype);

    SelectCharacterPanel.prototype.showCharacters = function() {
        console.log("=== showCharacters " + this.chars);
        console.dir(this.chars);

        this.butts.forEach(function(butt) {
            this.removeChild(butt);
        }.bind(this));
        this.butts = [];
        var remeberchar = null;

        if (this.chars) 
        {
            this.setVisible(true);
            var len = 0,
                c = 0;
            for (var i in this.chars) 
            {
                var cobj = this.chars[i];
                if (cobj) {

                    (function(ch, ii) {
                        //console.log("creating select char button for " + ch._id);
                        //console.dir(ch);
                        var butt = this.director.createButton(this.x, this.y + (2 - ii) * this.buttonHeight, this.width, this.buttonHeight, ch.name, function() {
                            console.log("+++ selecting character " + ch);
                            evtMgr.trigger('activeCharacterChange', ch);
                            this.setVisible(false);

                        }.bind(this));
                        this.addChild(butt);
                        rememberchar = ch;
                        this.butts.push(butt);

                    }.bind(this))(cobj, c++);
                }
                len++;
            }
            if(len === 1)
            {
                evtMgr.trigger('activeCharacterChange', rememberchar);
            }

        } else {
            evtMgr.trigger('requestGetParty', null);
        }
    };

    return SelectCharacterPanel;

});