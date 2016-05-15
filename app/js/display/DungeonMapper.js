define([
	'lib/three',
	'display/AssetManager'
], function(
	THREE,
	AssMan
) {

	var TOP = 1;
	var RIGHT = 1 << 1;
	var BOTTOM = 1 << 2;
	var LEFT = 1 << 3;
	var BOTTOM_LEFT = 1 << 4;
	var BOTTOM_RIGHT = 1 << 5;
	var TOP_LEFT = 1 << 6;
	var TOP_RIGHT = 1 << 7;
	var FLOOR = 1 << 8;

	var metrics = {
		'corner_convex': {
			//'left': 13.3723,
			'left': 13,
			'right': 39.3701,
			'width': 42.5576
		},
		'corner_concave': {
			'left': 3.1848,
			'right': 13.3723,
			'width': 3.1877
		},
		'small_wall': {
			'left': 3.1872,
			'right': 39.3675,
			'width': 42.5577
		}
	};

	var tileSize = 3 * metrics.corner_convex.left + metrics.small_wall.right;
	var scale = 1 / (tileSize - metrics.corner_convex.left);

	var walls = [0x0, 0x10];

	var newEmptyArray = function(size) {
		var a = new Array(size);
		for (var i = 0; i < size; i++) {
			a[i] = 0;
		}
		return a;
	};

	var isWalkable = function(tile) {
		return walls.indexOf(tile) == -1;
	};

	var DungeonMapper = function(width, height) {
		this.width = width;
		this.height = height;
		this.data = new Array(height);
		for (var i = 0; i < height; i++) {
			this.data[i] = newEmptyArray(width);
		}

		this.dungeon = new THREE.Object3D();
		this.assets = new Array(height);
		for (var i = 0; i < height; i++) {
			this.assets[i] = new Array(width);
			for (var j = 0; j < width; j++) {
				this.assets[i][j] = {};

				// top wall
				mesh = AssMan.getNewInstanceOfModel('small_wall');
				mesh.scale.set(scale, scale, scale);
				mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
				mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
				mesh.rotation.y = Math.PI;
				this.dungeon.add(mesh);
				this.assets[i][j][TOP] = mesh;
				/*
					if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = -Math.PI / 2;
						this.dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						this.dungeon.add(mesh);
					}
				}
				if (tile & LEFT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					this.dungeon.add(mesh);
				}
				if (tile & RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					this.dungeon.add(mesh);
				}
				if (tile & BOTTOM) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
					this.dungeon.add(mesh);

					if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						this.dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						this.dungeon.add(mesh);
					}
				}
				if (tile & TOP_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					this.dungeon.add(mesh);
				} else if (i > 0 && this.data[i - 1][j] & BOTTOM && !(this.data[i - 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + metrics.small_wall.right);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					this.dungeon.add(mesh);
				}
				if (tile & TOP_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					this.dungeon.add(mesh);
				}
				if (tile & BOTTOM_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					this.dungeon.add(mesh);
				} else if (j > 0 && this.data[i][j - 1] & RIGHT && !(this.data[i][j - 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = Math.PI / 2;
					this.dungeon.add(mesh);
				}
				if (tile & BOTTOM_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					this.dungeon.add(mesh);
				} else if (j < w - 1 && this.data[i][j + 1] & LEFT && !(this.data[i][j + 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = -Math.PI / 2;
					this.dungeon.add(mesh);
				} else if (i < h - 1 && this.data[i + 1][j] & TOP && !(this.data[i + 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					this.dungeon.add(mesh);
				}
				if (tile & FLOOR) {
					mesh = AssMan.getNewInstanceOfModel('small_floor');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					this.dungeon.add(mesh);

					if (i < h - 1 && !(this.data[i + 1][j] & TOP) || i == h - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						this.dungeon.add(mesh);
					}

					if (j < w - 1 && !(this.data[i][j + 1] & LEFT) || j == w - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						this.dungeon.add(mesh);
					}

					if ((i < h - 1 && j < w - 1 && !(this.data[i][j + 1] & LEFT) && !(this.data[i + 1][j] & TOP) && !(this.data[i + 1][j + 1] & LEFT)) || ((i == h - 1 && (j == w - 1 || !(this.data[i][j + 1] & LEFT))) || (j == w - 1 && (i == h - 1 || !(this.data[i + 1][j] & TOP))))) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						this.dungeon.add(mesh);
					}
				}
			}
		}*/
			}
		}
	};

	DungeonMapper.prototype.parseMap = function(map) {
		var w = this.width;
		var h = this.height;
		// set all to 0
		for (var i = 0; i < h; i++) {
			for (var j = 0; j < w; j++) {
				this.data[i][j] = 0;
			}
		}
		for (var i = 0; i < h; i++) {
			for (var j = 0; j < w; j++) {
				if (isWalkable(map[i][j])) {
					this.data[i][j] = this.data[i][j] | FLOOR;
					// check top
					if (i > 0 && !isWalkable(map[i - 1][j])) {
						this.data[i - 1][j] = this.data[i - 1][j] | BOTTOM;
					}
					// check right
					if (j < w - 1 && !isWalkable(map[i][j + 1])) {
						this.data[i][j + 1] = this.data[i][j + 1] | LEFT;
					}
					// check bottom
					if (i < h - 1 && !isWalkable(map[i + 1][j])) {
						this.data[i + 1][j] = this.data[i + 1][j] | TOP;
					}
					// check left
					if (j > 0 && !isWalkable(map[i][j - 1])) {
						this.data[i][j - 1] = this.data[i][j - 1] | RIGHT;
					}
					// check top left
					if (i > 0 && j > 0 && !isWalkable(map[i - 1][j]) && !isWalkable(map[i][j - 1])) {
						this.data[i][j] = this.data[i][j] | TOP_LEFT;
					}
					// check top right
					if (i > 0 && j < w - 1 && !isWalkable(map[i - 1][j]) && !isWalkable(map[i][j + 1])) {
						this.data[i][j] = this.data[i][j] | TOP_RIGHT;
					}
					// check bottom left
					if (i < h - 1 && j > 0 && !isWalkable(map[i + 1][j]) && !isWalkable(map[i][j - 1])) {
						this.data[i][j] = this.data[i][j] | BOTTOM_LEFT;
					}
					// check bottom right
					if (i < h - 1 && j < w - 1 && !isWalkable(map[i + 1][j]) && !isWalkable(map[i][j + 1])) {
						this.data[i][j] = this.data[i][j] | BOTTOM_RIGHT;
					}
				}
			}
		}
	};

	DungeonMapper.prototype.drawMap = function(map, parent, startx, starty) {
		var tile, mesh;
		var w = this.width;
		var h = this.height;
		this.parseMap(map);
		parent.add(this.dungeon);
		/*if (!this.dungeon) {
			this.dungeon = new THREE.Object3D();
		} else {
			// empty the dungeon
			//parent.remove(this.dungeon);
			while (this.dungeon.children.length > 0) {
				console.log(this.dungeon.children.length);
				this.dungeon.remove(this.dungeon.children[0]);
			}
			//parent.add(this.dungeon);
		}*/
		//var dungeon = this.dungeon;
		for (var i = 0; i < h; i++) {
			for (var j = 0; j < w; j++) {
				tile = this.data[i][j];

				if (tile & TOP) {
					this.assets[i][j][TOP].visible = true;
				} else {
					this.assets[i][j][TOP].visible = false;
				}

				/*if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = -Math.PI / 2;
						dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						dungeon.add(mesh);
					}*/
				/*
				if (tile & LEFT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);

					if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						dungeon.add(mesh);
					}
				}
				if (tile & TOP_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);
				} else if (i > 0 && this.data[i - 1][j] & BOTTOM && !(this.data[i - 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + metrics.small_wall.right);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);
				}
				if (tile & TOP_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					dungeon.add(mesh);
				} else if (j > 0 && this.data[i][j - 1] & RIGHT && !(this.data[i][j - 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				} else if (j < w - 1 && this.data[i][j + 1] & LEFT && !(this.data[i][j + 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				} else if (i < h - 1 && this.data[i + 1][j] & TOP && !(this.data[i + 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					dungeon.add(mesh);
				}
				if (tile & FLOOR) {
					mesh = AssMan.getNewInstanceOfModel('small_floor');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);

					if (i < h - 1 && !(this.data[i + 1][j] & TOP) || i == h - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						dungeon.add(mesh);
					}

					if (j < w - 1 && !(this.data[i][j + 1] & LEFT) || j == w - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						dungeon.add(mesh);
					}

					if ((i < h - 1 && j < w - 1 && !(this.data[i][j + 1] & LEFT) && !(this.data[i + 1][j] & TOP) && !(this.data[i + 1][j + 1] & LEFT)) || ((i == h - 1 && (j == w - 1 || !(this.data[i][j + 1] & LEFT))) || (j == w - 1 && (i == h - 1 || !(this.data[i + 1][j] & TOP))))) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						dungeon.add(mesh);
					}
				}*/
			}
		}
		//parent.position.set(-scale * tileSize * w / 2, 0, -scale * tileSize * h / 2);
		/*
		for (var i = 0; i < h; i++) {
			for (var j = 0; j < w; j++) {
				tile = this.data[i][j];

				if (tile & TOP) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					dungeon.add(mesh);

					if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = -Math.PI / 2;
						dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * ((i - 1) * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						dungeon.add(mesh);
					}
				}
				if (tile & LEFT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);

					if (tile & LEFT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize - 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						dungeon.add(mesh);
					}
					if (tile & RIGHT) {
						mesh = AssMan.getNewInstanceOfModel('corner_convex');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						dungeon.add(mesh);
					}
				}
				if (tile & TOP_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);
				} else if (i > 0 && this.data[i - 1][j] & BOTTOM && !(this.data[i - 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + metrics.small_wall.right);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					dungeon.add(mesh);
				}
				if (tile & TOP_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM_LEFT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					dungeon.add(mesh);
				} else if (j > 0 && this.data[i][j - 1] & RIGHT && !(this.data[i][j - 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = Math.PI / 2;
					dungeon.add(mesh);
				}
				if (tile & BOTTOM_RIGHT) {
					mesh = AssMan.getNewInstanceOfModel('corner_concave');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				} else if (j < w - 1 && this.data[i][j + 1] & LEFT && !(this.data[i][j + 1] & BOTTOM)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left + metrics.small_wall.right);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);
				} else if (i < h - 1 && this.data[i + 1][j] & TOP && !(this.data[i + 1][j] & RIGHT)) {
					mesh = AssMan.getNewInstanceOfModel('small_wall');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * ((j + 1) * tileSize - 3 * metrics.corner_convex.left + metrics.small_wall.right);
					mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
					mesh.rotation.y = Math.PI;
					dungeon.add(mesh);
				}
				if (tile & FLOOR) {
					mesh = AssMan.getNewInstanceOfModel('small_floor');
					mesh.scale.set(scale, scale, scale);
					mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
					mesh.position.z = scale * ((i - 1) * tileSize + metrics.corner_convex.left);
					mesh.rotation.y = -Math.PI / 2;
					dungeon.add(mesh);

					if (i < h - 1 && !(this.data[i + 1][j] & TOP) || i == h - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						dungeon.add(mesh);
					}

					if (j < w - 1 && !(this.data[i][j + 1] & LEFT) || j == w - 1) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * ((j + 1) * tileSize);
						mesh.position.z = scale * (i * tileSize - 2 * metrics.corner_convex.left);
						mesh.rotation.y = Math.PI;
						dungeon.add(mesh);
					}

					if ((i < h - 1 && j < w - 1 && !(this.data[i][j + 1] & LEFT) && !(this.data[i + 1][j] & TOP) && !(this.data[i + 1][j + 1] & LEFT)) || ((i == h - 1 && (j == w - 1 || !(this.data[i][j + 1] & LEFT))) || (j == w - 1 && (i == h - 1 || !(this.data[i + 1][j] & TOP))))) {
						mesh = AssMan.getNewInstanceOfModel('small_floor');
						mesh.scale.set(scale, scale, scale);
						mesh.position.x = scale * (j * tileSize + 3 * metrics.corner_convex.left);
						mesh.position.z = scale * (i * tileSize + metrics.corner_convex.left);
						mesh.rotation.y = Math.PI / 2;
						dungeon.add(mesh);
					}
				}
			}
		}
		*/
		this.dungeon.position.set(startx - 0.9, -0.5, starty + 0.3);
		//window.dungeon = dungeon;
	};

	return DungeonMapper;

});