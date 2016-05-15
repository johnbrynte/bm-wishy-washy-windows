define([], function() {
	var self = {};

	self.events = {};

	self.on = function(eventName, fn) {
		if (self.events[eventName] === undefined) {
			self.events[eventName] = [];
		}

		self.events[eventName].push(fn);

		return self;
	};

	self.trigger = function(eventName, evt) {
		if (eventName && self.events[eventName]) {
			self.events[eventName].forEach(function(fn) {
				if(fn)
				{
					fn(evt);	
				}
				else
				{
					console.log("EventManager was called to execute event '"+eventName+"* but there was no handler!?!?!");
				}
			});
		}

		return self;
	};

	return self;
});