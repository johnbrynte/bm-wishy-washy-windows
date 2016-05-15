define([], function() {
    var self = {};

    /**
       Constructs a PriorityQueue.
       @constructor
     */
    self.PriorityQueue = function() {
        this._queue = [];
    };

    self.PriorityQueue.prototype.add = function(element, priority_value) {
        this._queue.unshift({"val":element, "priority":priority_value});
        this._queue.sort(function(a,b) {
            return a["priority"] < b["priority"];
        });
    };

    self.PriorityQueue.prototype.remove = function() {
        return this._queue.pop().val;
    };

    self.PriorityQueue.prototype.getLength = function() {
        return this._queue.length;
    };

    return self;
});
