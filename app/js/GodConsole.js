define([
    'api/api',
    'world/Party'
], function(
    api,
    Party
) {
    var GodConsole = {};

    GodConsole.setParty = function(party) {
        this.Party = party;
        return this;
    };

    GodConsole.becomeGod = function() {
        var ch = this.Party.getActiveCharacter();
        if (!ch) {
            console.log('Got no  active char!');
            return;
        }

        api._enqueueAPICall({
            'command': 'adminsetentity',
            'arg': ch.id,
            'arg2': 'hp',
            'arg3': 500
        });

        return this;
    };

    GodConsole.noClip = function() {
        var ch = this.Party.getActiveCharacter();
        console.log(ch.id);
        if (!ch) {
            console.log('Got no active char!');
            return;
        }
        api._enqueueAPICall({
            'command': 'adminsetentity',
            'arg': ch.id,
            'arg2': 'gaseous',
            'arg3': true
        });
    };

    GodConsole.noClipOff = function() {
        var ch = this.Party.getActiveCharacter();
        if (!ch) {
            console.log('Got no active char!');
            return;
        }
        api._enqueueAPICall({
            'command': 'adminsetentity',
            'arg': ch.id,
            'arg2': 'gaseous',
            'arg3': false
        });
    };

    GodConsole.stopMonsters = function() {
        api._enqueueAPICall({
            'command': 'adminstopmonsters'
        }, function(data) {
            if (data.success) {
                console.log(data);
            }
        });
    };

    GodConsole.startMonsters = function() {
        api._enqueueAPICall({
            'command': 'adminstartmonsters'
        }, function(data) {
            if (data.success) {
                console.log(data);
            }
        });
    };

    return GodConsole;
});