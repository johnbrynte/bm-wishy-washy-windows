define([], function() {
	var Constants = {
		movement: {
			'LEFT': 'left',
			'UP': 'up',
			'DOWN': 'down',
			'RIGHT': 'right',
			'DOWNRIGHT': 'downright',
			'UPRIGHT': 'upright',
			'DOWNLEFT': 'downleft',
			'UPLEFT': 'upleft'
		},
		layout: {
			'VERTICAL': 'vertical',
			'HORIZONTAL': 'horizontal',
			'LEFT': 'left',
			'RIGHT': 'right',
			'TOP': 'top',
			'BOTTOM': 'bottom',
			'CENTER': 'center',
			'GRID': 'grid',
			'NONE': 'none'
		},
		paths: {
			'assets': 'assets/'
		},
		colors: {
			'background': 0xaaaaaa
		}
	};
	return Constants;
});