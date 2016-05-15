define([
    'lib/three',
    //'lib/object3ddebug',
    'display/AssetManager',
    'display/webgl/game/Overlay',
    'EventManager',
    'utils/animation',
    'utils/Timer',
    'world/EntityManager',
    'display/SimpleGameView'
], function(
    THREE,
    //object3ddebug,
    AssMan,
    Overlay,
    evtMgr,
    Animation,
    Timer,
    EntityManager,
    SimpleGameView
) {

    var objectTypes = {
        'wall': 1,
        'wizard': 2
    };

    var angle = 0;
    var virtual = {
        x: 0,
        y: 0
    };

    var tiles = {
        'NOTHING': 0x00000000,
        'BLOCKED': 0x00000001,
        'ROOM': 0x00000002,
        'CORRIDOR': 0x00000004,
        'PERIMETER': 0x00000010,
        'ENTRANCE': 0x00000020,
        'ROOM_ID': 0x0000FFC0,
        'ARCH': 0x00010000,
        'DOOR': 0x00020000,
        'DOOR': 0x00040000,
        'DOOR': 0x00080000,
        'DOOR': 0x00100000,
        'PORTCULLIS': 0x00200000,
        'STAIR_DOWN': 0x00400000,
        'STAIR_UP': 0x00800000,
        'LABEL': 0xFF000000,
        'FORGE': 0x02000000
    };

    var defaultMap = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ];

    var GameView = function() {
        this.scene = new THREE.Scene();
        this.dungeon = new THREE.Object3D();
        this.scene.add(this.dungeon);
        this.clock = new THREE.Clock();

        this.gui = new THREE.Scene();
        this.guiCamera = new THREE.OrthographicCamera(0, AssMan.width, 0, -AssMan.height, 0, 10000);
        //this.guiCamera.position.z = 800;
        //this.guiCamera.lookAt(new THREE.Vector3(AssMan.width / 2, -AssMan.height / 2, 0));

        this.usertilt = 5;
        this.ydisplacement = 0.5;

        this.xoffset = 0.0
        this.yoffset = 0.2;

        this.chartextOffset = 1.6;

        this.camera = new THREE.PerspectiveCamera(25, AssMan.aspect, 0.1, 1000);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.camera.position.y = 10;

        this.overlay = new Overlay(this.camera, this.scene, 0.01);

        this.simpleMode = false;
        this.simpleGameView = new SimpleGameView();
        this.simpleOverlay = this.addOverlay(this.simpleGameView.getMesh());

        //this.scene.add(new THREE.AmbientLight(0x333333));

        var directionalLight = new THREE.DirectionalLight(0xaaaaaa);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(directionalLight);

        this.light = directionalLight;

        directionalLight = new THREE.DirectionalLight(0xaaaaaa);
        directionalLight.position.set(-1, 1, -1).normalize();
        this.scene.add(directionalLight);

        this.light2 = directionalLight;

        // create a point light
        this.pointLight = new THREE.PointLight(0xaaaaaa);
        this.pointLight.position.set(0, 2, 0);
        this.scene.add(this.pointLight);

        // create a spot light
        this.spotLight = new THREE.SpotLight(0xaaaaaa);
        this.spotLight.position.set(0, 2, 0);
        //this.spotLight.castShadow = true;

        this.spotLight.shadowMapWidth = 128;
        this.spotLight.shadowMapHeight = 128;

        this.spotLight.shadowCameraNear = 1;
        this.spotLight.shadowCameraFar = 1000;
        this.spotLight.shadowCameraFov = 30;
        this.scene.add(this.spotLight);

        this.hurtAnimations = {};
        //----------------------- Used to see if a thing existed on last scan, and if it needs to be added or maybe animate moved
        this.oldthings = [];
        this.newthings = [];

        this.toresolve = [];
        this.alreadyadded = []; // Hack arond double-char bug. TODO: Understand asynch mutliple calls and guard against instead

        this.renderObjects = {
            'wall': AssMan.Cube(AssMan.images.wall8, 1, true),
            'bigwall': AssMan.Cube(AssMan.images.wall7, 1, true),
            'perimeter': AssMan.Cube(AssMan.images.wall3, 1, true),
            'tiles': AssMan.Sprite(AssMan.images.tiles, 1, 1, 16, 16),
            'floor': AssMan.Sprite(AssMan.images.floor6, 1, 1, 128, 128),
            'unknown': AssMan.Cube(AssMan.images.unknown, 1),
            //'wizard': AssMan.Sprite(AssMan.images.wizard, 1, 1, 16, 16),
            'wizard': AssMan.getNewInstanceOfModel('human', 0, 0),
            'monster': AssMan.Sprite(AssMan.images.monster, 1, 1, 16, 16),
            'forge': AssMan.getNewInstanceOfModel('cauldron'),
            'healingpool': AssMan.getNewInstanceOfModel('healingpool'),
            'manapool': AssMan.getNewInstanceOfModel('manapool'),
            'anim_hurt': AssMan.Sprite(AssMan.images.anim_hurt, 1, 1, 16, 16)
        };

        // animation hurt (effect)
        this.renderObjects['anim_hurt'].scale.set(0.5, 0.5, 1);
        //this.renderObjects['anim_hurt'].setTile(3);
        // floor tiles
        this.renderObjects.tiles.rotation.x = -Math.PI / 2;
        this.renderObjects.floor.rotation.x = -Math.PI / 2;
        // characters and monsters
        var tilt = -Math.PI / 8;
        this.tilt = tilt;
        this.renderObjects.wizard.rotation.x = tilt;
        this.renderObjects.monster.rotation.x = tilt;
        this.renderObjects.unknown.rotation.x = tilt;
        this.activeCharacter = null;
        console.log("++ setting this.map to null");
        this.map = null;

        evtMgr.on('swipe_x_event', this.onSwipeX);
        evtMgr.on('swipe_y_event', this.onSwipeY.bind(this));

        //---------------------------------------------------------------------------
        evtMgr.on('onScan', function(args) {
            var data = args[0];
            var map = args[1];

            if (this.activeCharacter) {
                // Render all entities from the scan + // Render all items  
                if (data.x != this.activeCharacter.x || data.y != this.activeCharacter.y) {
                    this.showMap();
                }

                this.renderEntities(data.entities.concat(data.items));
            } else {
                console.log("ERROR!!  **** scan - no active character! ");
            }

        }.bind(this));
        //---------------------------------------------------------------------------

        evtMgr.on('newMessage', function(msg) {
            //console.log("+++ MessagePanel got new message: '" + msg + "'");
            this.handleUpdateMessage(msg);
        }.bind(this));

        evtMgr.on('prospectiveMove', this.onProspectiveMove.bind(this));
    };

    GameView.prototype.onProspectiveMove = function(msg) {
        console.log("====================== gameview prospective move =====================");
        console.log("alreadyadded is " + this.alreadyadded);
        console.dir(this.alreadyadded);
        var obj = msg.obj;
        var entity = msg.entity;
        var mesh = msg.mesh;

        var moveOK = true;

        for (var t in this.alreadyadded) {
            var thing = this.alreadyadded[t];
            if (thing) {
                console.log("==== checking if " + thing.name + " " + thing.x + "," + thing.y + " == " + entity.x + "," + entity.y);
                if (thing.x == entity.x && thing.y == entity.y && !thing.displayObject.moveanim) {
                    moveOK = false;
                }
            }
        }
        if (moveOK) {
            this.animateMoveEntity(obj, entity, mesh);
        }

    };

    // 1) Marjorie_Sanch.. [W03] hp 15 [rUgsN2J5e] scored a hit [damage 3] on Skeleton [rhSI2SO5W] hp 11!
    // 2) Kobold hp 8 [rIPZhvkqq] scored a hit [damage 1] on Hunter_West [W03] [r71yg29Kl] hp 11

    GameView.prototype.handleUpdateMessage = function(msg) {
        var aid = "";
        var did = "";

        if (msg.indexOf('scored a hit') > -1) {
            msg = msg.substring(msg.indexOf("hp") + 1, msg.length);
            aid = msg.substring(msg.indexOf("[") + 1, msg.indexOf("]"));
            var msg2 = msg.substring(msg.indexOf(" on "), msg.length);
            did = msg2.substring(msg2.indexOf("[") + 1, msg2.indexOf("]"));
        } else if (msg.indexOf('missed') > -1) {
            msg = msg.substring(msg.indexOf("]") + 1, msg.length);
            aid = msg.substring(msg.indexOf("[") + 1, msg.indexOf("]"));
            var msg2 = msg.substring(msg.indexOf("]") + 1);
            did = msg2.substring(msg2.indexOf("[") + 1, msg2.indexOf("]"));
        }
        console.log("================================== combat animation aid resolving objects. ["+aid+"] -> ["+did+"]");
        EntityManager.getEntity(aid, function(aobj) {

            EntityManager.getEntity(did, function(dobj) {

                var diffx = parseInt(dobj.x) - parseInt(aobj.x);
                var diffy = parseInt(dobj.y) - parseInt(aobj.y);
                var facing = this.getFacingFor(diffx, diffy);
                aobj._rotateModel(facing);
                aobj.animator.play(['attack', 'idle']);
                setTimeout(function() {
                    aobj.animator.stop();
                }, 850);

                dobj.animator.play(['hurt', 'idle']);
                setTimeout(function() {
                    dobj.animator.stop();
                }, 850);

            }.bind(this));
        }.bind(this));
    };

    GameView.prototype.onSwipeX = function(swipex) {

    };

    GameView.prototype.onSwipeY = function(swipey) {
        console.log("swipey = " + swipey);
        console.dir(this.camera);
        this.usertilt += parseInt(swipey / 10);
        this.camera.position.x = virtual.x;
        this.camera.position.z = virtual.y + this.usertilt;
        var center = new THREE.Vector3(virtual.x, 0, virtual.y);
        this.camera.lookAt(center);
    };

    GameView.prototype.setActiveCharacter = function(character) {
        console.log("GameView.setActiveCharacter called for char '" + character.name + "' [" + character._id + "]");
        console.dir(character);

        if (!this.activeCharacter) {
            virtual.x = character.x;
            virtual.y = character.y;
        }
        // TODO: Make this smarter and use just one sort of logic for all models (including character)
        this.activeCharacter = character;
        this.showMap();
    };

    GameView.prototype.showMap = function() {
        if (this.activeCharacter) {
            if (this.map) {
                this.map.currentMap = this.activeCharacter.map;
                if (!this.simpleMode) {
                    this.map.renderMap(this.renderObjects, this.dungeon, tiles, this.activeCharacter.x, this.activeCharacter.y);
                }
            }
        }
    };

    GameView.prototype.setMap = function(themap) {
        this.map = themap;
        console.log("-- GameView.setMap arguments is");
        console.dir(arguments);

        if (themap && themap.mapHandler) {
            themap.mapHandler.onMapUpdate((function(data) {
                //console.log(" * onMapUpdate *");
                //this.lastScan = data.scan;
                //this.map = data.map;
                this.updateMap();

                //console.log('Map updated');
            }).bind(this));
        }

        if (this.activeCharacter) {
            //console.log("++++ setting map name for Map");
            this.map.currentMap = this.activeCharacter.map;
            if (!this.simpleMode) {
                // Initially do show map, eh?
                this.map.renderMap(this.renderObjects, this.dungeon, tiles, this.activeCharacter.x, this.activeCharacter.y);
            }
        }

        window.updatemap = (function() {
            this.updateMap();
        }).bind(this);
    };

    GameView.prototype.setSimpleMode = function(bool) {
        if (!this.simpleMode && bool) {
            AssMan.removeChildren(this.dungeon);
            EntityManager.setAllEntitiesAsRemoved();
        } else if (this.simpleMode && !bool) {
            this.simpleGameView.clear();
            if (this.map) {
                this.map.renderMap(this.renderObjects, this.dungeon, tiles, this.activeCharacter.x, this.activeCharacter.y);
                EntityManager.getEntity(this.activeCharacter._id, function(obj) {
                    this.alreadyadded[obj._id] = null;
                    obj.added = false;
                    this.addThingIfNew(obj, obj.displayObject);
                }.bind(this));
            }
        }
        this.simpleMode = bool;
        this.simpleGameView.setActive(this.simpleMode);
    }

    GameView.prototype.updateMap = function() {
        //console.dir(this.lastScan);

        if (!this.simpleMode) {
            var obj, x, y, i, j, map;

            if (!this.activeCharacter || !this.map) {

                console.log("no char or no map");

                AssMan.removeChildren(this.dungeon);
                // Render a grave stone
                obj = this.renderObjects.tiles.clone();
                obj.setTile(6);
                obj.position.set(0, 0, 0);
                this.dungeon.add(obj);
                return;
            }

            if (this.currentMap) {
                map = this.currentMap;
            } else {
                console.log("** setting current map **");
                map = this.map.getCurrentMap();
                this.currentMap = map;
            }
            //console.log("-- GameView updating map");
            this.map.renderMap(this.renderObjects, this.dungeon, tiles, this.activeCharacter.x, this.activeCharacter.y);
        }

        //this.dungeon.add(this.charText);

    };

    //
    // Go through lsit of entities seen in this scan. Remove old entities we remember since last scan but aren't in this one,
    // also animate moves for entities that have changed position between last scan and this. And of course add new ones :)
    //
    GameView.prototype.renderEntities = function(entities) {
        this.newthings = [];
        this.charonitem = false;
        var entity_id;
        var count = entities.length;

        var checkCount = function() {
            //console.log("checkcount called. count = "+count);
            // If all asynchronously resolved entities are done for this scan, let's see if anyone is missing compared to last, and should be removed.
            if (--count === 0) {
                this.removeOldThings();
                this.oldthings = this.newthings;
                if (!this.charonitem) {
                    evtMgr.trigger("character_off_item");
                }
            }
        }.bind(this);

        for (var i = 0; i < entities.length; i++) {
            var ent = entities[i];
            if (!this.toresolve[ent._id]) {
                this.toresolve[ent._id] = ent; // To squelch a deluge of requests from scans before entity is in cache from server. 
                //console.log("checking entity "+ent._id);
                (function(entity) {
                    EntityManager.getEntity(entity._id, function(obj) {
                        //console.log("got entity obj from entitmgr: "+obj._id);
                        if (obj) {
                            var mesh = obj.displayObject;
                            this.toresolve[entity._id] = null; // we're got it, so any more getInfoFor should terminate in cache
                            this.newthings[obj._id] = obj; // Add each thing new in this scan, so we can compare to old things from last,
                            // if any of those should be removed now (since not seen -> not in scan)                            
                            if (!obj.added && !this.alreadyadded[obj._id]) {
                                this.addThingIfNew(obj, mesh); // If it's the scan and not yet added, do that
                            }
                            // Check if the current position has a diff from previous and the entity should be animated
                            this.animateMoveEntity(obj, entity, mesh);
                            this.checkIfCharacterOnItem(obj);
                            this.checkIfHealthChange(obj, entity);
                            checkCount(count);
                        }
                    }.bind(this));
                }.bind(this))(ent);
            } else {
                checkCount(count);
            }
        }
    };

    GameView.prototype.checkIfHealthChange = function(obj, entity) {
        if (obj.hp != entity.hp) {
            console.log("Detecting new hp for entity " + obj.name + " " + obj.hp + " --> " + entity.hp);
            obj.hp = entity.hp;
            //obj.maxhp = entity.maxhp;
            this.dungeon.remove(obj.healthbar)
            obj.healthbar.updateHealth(obj);
            obj.healthbar.position.set(obj.x - 0.7, this.chartextOffset - 0.2, obj.y);
            obj.healthbar.rotation.set(this.tilt, 0, mesh.rotation.z, "XYZ");
            this.dungeon.add(obj.healthbar);
        }
    };

    GameView.prototype.addThingIfNew = function(obj, mesh) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>  adding object '" + obj.name + "' [" + obj._id + "] to dungeon at " + obj.x + "," + obj.y);
        console.dir(obj);

        this.alreadyadded[obj._id] = obj;
        obj.added = true;
        if (obj.type == "item") {
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.position.set(obj.x - 0.3, -0.0, obj.y + 0.01);
        } else {
            mesh.position.set(obj.x + this.xoffset, -0.2, obj.y + this.yoffset);
            obj.charText.position.set(obj.x - 0.7, this.chartextOffset, obj.y);
            obj.charText.rotation.set(this.tilt, 0, 0, "XYZ");

            obj.healthbar.position.set(obj.x - 0.7, this.chartextOffset - 0.2, obj.y);
            obj.healthbar.rotation.set(this.tilt, 0, 0, "XYZ");

            this.dungeon.add(obj.charText);
            this.dungeon.add(obj.healthbar);
            obj.charText.uvsNeedUpdate = true;
            obj.healthbar.uvsNeedUpdate = true;
        }

        mesh.rotation.set(this.tilt, mesh.rotation.y, 0, "XYZ");

        this.dungeon.add(mesh);
        mesh.uvsNeedUpdate = true;
        mesh.geometry.verticesNeedUpdate = true;

    };

    GameView.prototype.checkIfCharacterOnItem = function(item) {
        var onspot = this.activeCharacter.x == item.x && this.activeCharacter.y == item.y && this.activeCharacter._id != item._id;

        if (onspot && !this.charonitem) {
            evtMgr.trigger("character_on_item");
            this.charonitem = true;
        }
    };

    GameView.prototype.removeOldThings = function() {
        for (var id in this.oldthings) {
            //console.log("checking to remove "+id);
            var _obj = this.oldthings[id];
            // temporary charcter vanish fix
            var newthing = this.newthings[id];
            var foo = "";
            if (newthing) foo = newthing._id;
            //console.log("checking new thing "+newthing+" "+foo+" -> old id "+_obj._id+" ["+_obj.name+"]");
            if (!newthing) // If there is no newthing that matches the old thing's id 
            {
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<< removing old object '" + id + "' from dungeon (since not present among scan entities)");
                this.dungeon.remove(_obj.displayObject); // We remove it from the dungoen, since it is not then part of the scan
                this.dungeon.remove(_obj.charText);
                this.dungeon.remove(_obj.healthbar)
                _obj.added = false;
                this.alreadyadded[_obj._id] = null;
            }
        }
    };

    GameView.prototype.animateMoveEntity = function(obj, entity, mesh) {
        var oldx = parseInt(obj.x);
        var oldy = parseInt(obj.y);

        var diffx = parseInt(entity.x) - parseInt(obj.x);
        var diffy = parseInt(entity.y + this.ydisplacement) - parseInt(obj.y);

        if ((diffx != 0 || diffy != 0) && obj.type != "item" && !mesh.moveanim) {
            mesh.moveanim = true;
            //console.log("animateMoveEntity for '"+obj.name+" ["+obj._id+"] mesh xy is " + mesh.position.x + "," + mesh.position.z + " [" + mesh.position.y + "], obj xy is " + obj.x + "," + obj.y + " diffx=" + diffx + ", diffy=" + diffy);
            //console.log("this.activeCharacter.x = "+this.activeCharacter.x+", this.activeCharacter.y = "+this.activeCharacter.y);
            obj._rotateModel(this.getFacingFor(diffx, diffy));
            // Animate move
            if (obj.animator && obj.animator.exists("run")) {
                obj.animator.play("run");
            } else {
                obj.animator.play("walk", 500);
            }

            Animation.animate({
                loop: (function(d) {
                    if (mesh && mesh.position) // can be removed during anim
                    {
                        mesh.position.set(obj.x + this.xoffset + d * diffx, -0.2, obj.y + this.yoffset + d * diffy);
                        obj.charText.position.set(obj.x - 0.7 + d * diffx, this.chartextOffset, obj.y + d * diffy);
                        obj.healthbar.position.set(obj.x - 0.7 + d * diffx, this.chartextOffset - 0.2, obj.y + d * diffy);
                    }

                }).bind(this),
                callback: (function() {
                    mesh.moveanim = false;
                    //obj.animator.play("idle");
                    obj.x = entity.x;
                    obj.y = entity.y;
                    if (obj._id == this.activeCharacter._id) {
                        this.activeCharacter.x = obj.x;
                        this.activeCharacter.y = obj.y;
                    }
                    obj.animator.stop()

                }).bind(this),
                duration: 500
            });
        }
    };

    /**
     * Adds an overlay in front of any other overlay
     * @param {[type]} source [description]
     * @param {[type]} width  [description]
     * @param {[type]} height [description]
     * @return {Number} Index for the created overlay
     */
    GameView.prototype.addOverlay = function(source, x, y) {
        if (x === undefined || y === undefined) {
            x = 0;
            y = 0;
        }
        var index = this.overlay.add(source, x, y, source.width, source.height);
        return index;
    };

    /**
     * Removes an overlay
     * @param  {[type]} index [description]
     */
    GameView.prototype.removeOverlay = function(index) {
        this.overlay.remove(index);
    };


    GameView.prototype.draw = function() {
        if (!this.simpleMode) {
            //console.log("draw");
            if (this.activeCharacter) {
                EntityManager.getEntity(this.activeCharacter._id, function(obj) {

                    var v, center;
                    //var mesh = obj;
                    //console.log("character "+this.activeCharacter._id+" is at "+mesh.x+","+mesh.y);
                    //v = new THREE.Vector3(mesh.x, 0, mesh.y);
                    //TODO: Here be dragons!

                    /*
                    virtual.x += Timer.delta * 10 * (v.x - virtual.x) / 2;
                    virtual.y += Timer.delta * 10 * (v.z - virtual.y) / 2;

                    var dx = Math.abs(mesh.x - virtual.x);
                    var dy = Math.abs(mesh.y - virtual.y);

                    if (dx < 0.01 || dx > 2) {
                        virtual.x = mesh.x;
                    }

                    if (dy < 0.01 || dy > 2) {
                        virtual.y = mesh.y;
                    }
                    */

                    //virtual.x = v.x;
                    //virtual.y = v.z;

                    //mesh.position.x = virtual.x;
                    //mesh.position.z = virtual.y + this.ydisplacement;
                    virtual.x = obj.displayObject.position.x;
                    virtual.y = obj.displayObject.position.z;

                    //this.charText.position.x = virtual.x;
                    //this.charText.position.z = virtual.z;

                    this.camera.position.x = virtual.x;
                    this.camera.position.z = virtual.y + this.usertilt + 2;

                    this.light.position.x = virtual.x;
                    this.light.position.y = 6;
                    this.light.position.z = virtual.y;

                    this.light2.position.x = virtual.x + 1;
                    this.light2.position.y = 6;
                    this.light2.position.z = virtual.y;

                    this.pointLight.position.set(virtual.x, 2, virtual.y);
                    this.spotLight.position.set(virtual.x, 2, virtual.y);

                    center = new THREE.Vector3(virtual.x, 0, virtual.y);
                    //console.log("camera is at "+this.camera.position.x+","+this.camera.position.z+", looking at "+virtual.x+","+virtual.y);
                    this.camera.lookAt(center);

                    //this.overlay.update();
                }.bind(this));
            }
            THREE.AnimationHandler.update(this.clock.getDelta());
        }

        AssMan.renderer.clear(); // clear buffers
        AssMan.renderer.render(this.scene, this.camera); // render scene 1
        AssMan.renderer.clearDepth(); // clear depth buffer
        AssMan.renderer.render(this.gui, this.guiCamera);
        //AssMan.renderer.render(this.scene, this.camera);
    };

    GameView.prototype.getObjectForItem = function(item) {
        var obj = AssMan.Sprite(AssMan.images[item.name], 1, 1, 32, 32);
        //console.log("getting render obj "+obj+" for item '"+item.name+"'");
        return obj || this.renderObjects.unknown.clone();
    };

    GameView.prototype.getFacingFor = function(ddx, ddy) {
        var dx = parseInt(ddx);
        var dy = parseInt(ddy);

        var f = 0;
        if (dx == 0 && dy < 0) {
            f = 0;
        } else if (dx > 0 && dy < 0) {
            f = 7;
        } else if (dx > 0 && dy == 0) {
            f = 6;
        } else if (dx > 0 && dy > 0) {
            f = 5;
        } else if (dx == 0 && dy > 0) {
            f = 4;
        } else if (dx < 0 && dy > 0) {
            f = 3;
        } else if (dx < 0 && dy == 0) {
            f = 2;
        } else if (dx < 0 && dy < 0) {
            f = 1;
        }

        //console.log("getFacingFor dx="+dx+", dy="+dy+" returns "+f);
        return f;
    };

    return GameView;

});