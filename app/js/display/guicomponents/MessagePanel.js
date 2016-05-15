define([
    './GUIComponent',
    'display/AssetManager',
    'EventManager',
    'world/EntityManager',
    'utils/Constants',
    'display/guicomponents/GUIComponent'
], function(
    GUIComponent,
    AssMan,
    evtMgr,
    EntityManager,
    Constants,
    GUIComponent
) {

    var MessagePanel = function(director, x, y, width, height) {

        GUIComponent.call(this, width, height);

        this.messageQueue = [];
        this.shownMessages = [];
        this.director = director;

        this.setDisplay(AssMan.Rect(this.width, this.height, 0x000000, 0.6));
        this.setLayout(Constants.layout.VERTICAL);

        evtMgr.on('newMessage', function(msg) {
            //console.log("+++ MessagePanel got new message: '" + msg + "'");
            this.addMessage(msg);
        }.bind(this));

        this.setPosition(x, y);
    };

    MessagePanel.prototype = Object.create(GUIComponent.prototype);

    MessagePanel.prototype.addMessage = function(m) {
        var textComponent = this.director.createTextComponent(m, 20);
        textComponent.setSize(this.width - 20, textComponent.height + 5);

        // Simple message parsing
        if (m.search('missed') != -1) {
            textComponent.setColor(0xF09D84);
        } else if (m.search('scored') != -1) {
            textComponent.setColor(0x9FE67E);
        } else {
            textComponent.setColor(0xFFFFFF);
        }

        this.addChildBefore(textComponent);

        setTimeout(function() {
            this.removeChild(textComponent);
        }.bind(this), 10000);
    };

    MessagePanel.prototype.setVisible = function(v) {
        console.log("MessagePanel setVisible got " + v + " (Unimplemented)");
    };

    return MessagePanel;

});