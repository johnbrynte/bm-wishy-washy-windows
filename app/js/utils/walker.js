/*
    TODO:
    - Make a neat interface for autowalking so it can be applied to
      the character.


define(["utils/pathfinder", "world/world"], function(pathfinder, world) {
    var self = {};

    var logger = console;

    self.Walker = function() {
        this.is_walking = false;
        this.char = world.party.get_active_character();
        self.path = [];
        this.walk = self.Walker.prototype.walk;
        this.stop = self.Walker.prototype.stop;
        this.
        continue = self.Walker.prototype.
        continue;
        this.step = self.Walker.prototype.step;

        return this;
    };

    self.Walker.prototype.walk = function(to) {
        var map_name = world.party.get_active_character().get_data().map.map,
            pf = new pathfinder.Pathfinder(world.map.get_map()[map_name],
                function(iw_c, iw_map) {
                    if (world.map.blocking_blocks.indexOf(iw_map[iw_c.y][
                        iw_c.x]) === -1) {
                        logger.log("true " + iw_map[iw_c.y][iw_c.x]);
                        return true;
                    } else {
                        logger.log("false " + iw_map[iw_c.y][iw_c.x]);
                        return false;
                    }
                }),
            path;

        logger.log(this.char.get_data().map.x + " " + this.char.get_data().map
            .y);
        path = pf.findPath({
            x: this.char.get_data().map.x,
            y: this.char.get_data().map.y
        }, to);
        if (path === null) {
            logger.error("Can't find path");
            return false;
        } else if (path.length === 0) {
            logger.error("You're already on your desination dumbass");
            return true;
        } else {
            logger.log("Found path, gtta go");
            this.is_walking = true;
            self.path = path;
            return path;
        }
    };

    self.Walker.prototype.stop = function() {
        this.is_walking = false;
    };

    self.Walker.prototype.
    continue = function() {
        this.is_walking = true;
        this.step();
    };

    self.Walker.prototype.is_walking = function() {
        return this.is_walking;
    };

    self.Walker.prototype.step = function(path) {
        logger.log(self);
        var _path;
        if (path) {
            _path = path;
            if (_path.length === 0);
            if (this.is_walking) {
                var next = self.path[0];
                self.path = self.path.slice(1, self.path.length);
                world.party.get_character(this.char.get_id()).move(next);
            }
        } else {
            if (self.path.length === 0) this.stop();
            if (this.is_walking) {
                var next = self.path[0];
                self.path = self.path.slice(1, self.path.length);
                world.party.get_character(this.char.get_id()).move(next,
                    self.step);
            }
        }
    }



    return self;
});

*/