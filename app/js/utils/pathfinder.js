/**
    A simple pathfinder from start to goal.
    @see tests/testPath/* for usage.
*/

define(["utils/priority_queue"], function(pq) {
    var self = {};

    /**
        A Pathfinder for a 2D map.
        @constructor
        @param map - A 2D array of numbers (tiles). Needs to be square (just pad it with non-walkables).
        @param is_walkable - a function taking two params:
                - an object containing coordinates - ex. {"x": 0, "y":0}
                - the map
                returning:
                    - true iff map[y][x] is walkable
                    - false otherwise
    */
    self.Pathfinder = function(map, is_walkable) {
        this.map = map;
        this.is_walkable = is_walkable;
    };


    self.Pathfinder.prototype._heuristicEval = function(coordinate, goal) {
        return coordinate.x * goal.x + coordinate.y * goal.y;
    };


    /**
        Finds the shortest path from start to goal using a Greedy Best-First Search.(GBFS)
        @param start - an object containing coordinates - ex. {"x": 0, "y":0}
        @param goal - an object containing coordinates - ex. {"x": 0, "y":0}
        @return - an array of directions (ex. ["left","upleft","left","down"] or [] if start === goal)
                    if a path could be found.
                - null otherwise.

    */
    self.Pathfinder.prototype.findPath = function(start, goal) {
        var mapCopy = [];
        var queue = new pq.PriorityQueue();

        /* Are we lucky? ;) */
        if (start.x === goal.x && start.y === goal.y) {
            return [];
        }

        // Make zero filled array
        for (var y = 0; y < this.map.length; y++) {
            mapCopy.push(Array.apply(null, new Array(this.map[0].length)).map(
                Number.prototype.valueOf, 0));
        }

        mapCopy[start.y][start.x] = "@"; // Mark start as visited

        queue.add(start, this._heuristicEval(start, goal));

        var cnt = 0;

        while (queue.getLength() > 0) {
            var tmp = queue.remove();
            var neighbors = this._get_unvisited_neighbors(tmp, mapCopy);
            for (var i = 0; i < neighbors.length; i++) {
                var x = neighbors[i].x;
                var y = neighbors[i].y;
                mapCopy[y][x] = this._get_direction(neighbors[i], tmp); // Mark neighbor as visited
                if (x === goal.x && y === goal.y) {
                    return this._backtrack(goal, mapCopy);
                }
                queue.add(neighbors[i], this._heuristicEval(neighbors[i],
                    goal));
            }
        }

        return null;
    };

    self.Pathfinder.prototype._get_unvisited_neighbors = function(c,
        mapCopy) {
        var neighbors = [];
        // Prioritize using diagonal moves -- makes zig-zag patterns where possible :D
        if (c.x !== 0 && c.y !== 0) {
            // upleft ok
            var tmp = this._backtrack_coordinate_from_dir("downright");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.x !== mapCopy[0].length - 1 && c.y !== 0) {
            // upright ok
            var tmp = this._backtrack_coordinate_from_dir("downleft");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.x !== 0 && c.y !== mapCopy.length - 1) {
            // downleft ok
            var tmp = this._backtrack_coordinate_from_dir("upright");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.x !== mapCopy[0].length - 1 && c.y !== mapCopy.length - 1) {
            // downright ok
            var tmp = this._backtrack_coordinate_from_dir("upleft");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.y !== 0) {
            // up ok
            var tmp = this._backtrack_coordinate_from_dir("down");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.x !== 0) {
            // left ok
            var tmp = this._backtrack_coordinate_from_dir("right");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.x !== mapCopy[0].length - 1) {
            // right ok
            var tmp = this._backtrack_coordinate_from_dir("left");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }
        if (c.y !== mapCopy.length - 1) {
            // down ok
            var tmp = this._backtrack_coordinate_from_dir("up");
            var new_c = {
                "y": c.y + tmp.y,
                "x": c.x + tmp.x
            };
            if (mapCopy[new_c.y][new_c.x] === 0) {
                if (this.is_walkable(new_c, this.map)) {
                    neighbors.push(new_c);
                }
            }
        }


        return neighbors;
    };

    self.Pathfinder.prototype._backtrack = function(goal, mapCopy) {
        var x = goal.x;
        var y = goal.y;
        var tmp = mapCopy[y][x];
        var path = [];
        while (tmp !== "@") {
            path.unshift(tmp);
            var c = this._backtrack_coordinate_from_dir(tmp);
            x = x + c.x;
            y = y + c.y;
            tmp = mapCopy[y][x];
        }
        return path;
    };

    /*
        @return - a string with direction  if from and to are adjacent
                - null otherwise
    */
    self.Pathfinder.prototype._get_direction = function(from, to) {
        dx = from.x - to.x;
        dy = from.y - to.y;

        /*
            | (-1,-1) | (-1,0) | (-1,1) |
            | (0,-1) | (0,0) | (0, 1) |
            | (1,-1) | (1, 0) | (1, 1) |
        */

        if (dy === -1 && dx === -1) {
            return "upleft";
        } else if (dy === -1 && dx === 0) {
            return "up";
        } else if (dy === -1 && dx === 1) {
            return "upright";
        } else if (dy === 0 && dx === -1) {
            return "left";
        } else if (dy === 0 && dx === 1) {
            return "right";
        } else if (dy === 1 && dx === -1) {
            return "downleft";
        } else if (dy === 1 && dx === 0) {
            return "down";
        } else if (dy === 1 && dx === 1) {
            return "downright";
        } else {
            return null;
        }
    };

    self.Pathfinder.prototype._backtrack_coordinate_from_dir = function(
        direction) {
        switch (direction) {
            case "upleft":
                return {
                    "y": 1,
                    "x": 1
                };
            case "up":
                return {
                    "y": 1,
                    "x": 0
                };
            case "upright":
                return {
                    "y": 1,
                    "x": -1
                };
            case "left":
                return {
                    "y": 0,
                    "x": 1
                };
            case "right":
                return {
                    "y": 0,
                    "x": -1
                };
            case "downleft":
                return {
                    "y": -1,
                    "x": 1
                };
            case "down":
                return {
                    "y": -1,
                    "x": 0
                };
            case "downright":
                return {
                    "y": -1,
                    "x": -1
                };
        }
    };


    return self;
});