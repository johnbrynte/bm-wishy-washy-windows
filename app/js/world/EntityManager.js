define([
    'lib/three',
    'api/api',
    'display/AssetManager',
    'display/Animator'
], function(
    THREE,
    api,
    AssetManager,
    Animator
) {
    var EntityManager = {};

    var createHealthBar = function(entity) {
        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(1, 0, 0));

        var material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 5
        });

        var line = new THREE.Line(geometry, material);
        //  line.scale.set(5, 5, 5);

        line.updateHealth = function(entity) {
            console.log("hp=" + entity.hp + ", maxhp = " + entity.maxhp);
            entity.maxhp = entity.maxhp || entity.hp;
            var ratio = parseInt(entity.hp) / parseInt(entity.maxhp);
            var length = ratio > 1 ? 1 : (ratio < 0 ? 0 : ratio);
            console.log("// healthbar length = " + length + " //");

            this.scale.setX(length);

            var color = 0x00ff00;
            if (ratio < 0.8) {
                color = 0xffff00;
            }
            if (ratio < 0.5) {
                color = 0xfe9a2e;
            }
            if (ratio < 0.3) {
                color = 0xff0000;
            }
            if (ratio < 0.1) {
                color = 0x8a0808;
            }

            this.material.color.setHex(color);

            return this;
        };

        line.updateHealth(entity);

        return line;
    }


    EntityManager.lookupTable = {};

    EntityManager.setAllEntitiesAsRemoved = function() {
        for (var id in EntityManager.lookupTable) {
            EntityManager.lookupTable[id].added = false;
        };
    };

    EntityManager.getEntity = function(id, cb) {
        var o = this.lookupTable[id];
        if (o) {
            if (o._anim && !o._anim.data) {
                o._anim.data = o._sequence;
            }

            cb(o);
        } else {
            var mesh = null;

            api.getInfoFor(id, function(dataz) {
                if (dataz && !dataz.error && dataz.name) {
                    console.log("getinfofor for id " + id + " got info for thing " + dataz.name + " and position is " + dataz.x + "," + dataz.y);
                    this.lookupTable[id] = dataz;
                    if (dataz.type !== 'item') {

                        if (dataz.type === "character") {
                            mesh = AssetManager.getNewInstanceOfModel('human', true);
                        } else {
                            mesh = AssetManager.getNewInstanceOfModel('skeleton', true);
                        }

                        dataz.displayObject = mesh;
                        dataz.charText = AssetManager.Text(dataz.name).setTextSize(0.15).setColor(0xffffff);
                        dataz.healthbar = createHealthBar(dataz);

                        dataz.facing = 4;
                        dataz.added = false;

                        dataz.animator = new Animator(mesh, 200);

                        var de2ra = function(degree) {
                            return degree * (Math.PI / 180);
                        };

                        var calcRotation = function(obj, rotation) {
                            var euler = new THREE.Euler(rotation, 0, 0, 'XYZ');
                            obj.position.applyEuler(euler);
                        };

                        (function(entity) {
                            dataz._playAnimation = function(aname) {
                                var scale = 1000 / 24;
                                var anim = entity.displayObject.keyFrames[aname];
                                if (!anim._isplaying) {
                                    anim._isplaying = true;
                                    entity._anim.timeScale = 24;
                                    //console.log("anim '"+aname+"' keyframe start = "+anim.start+" duration = "+anim.duration+" scale = "+scale);
                                    if (entity._anim && !entity._anim.isplaying) {
                                        var start = parseInt(anim.start * scale);
                                        var stop = parseInt(anim.duration * scale);

                                        //console.log("anim start = "+start+"; stop = "+stop);
                                        //entity._anim.currentTime = start;
                                        entity._anim.play(start);

                                        setTimeout(function() {
                                            //entity._anim.play();
                                            entity._anim.stop();
                                            anim._isplaying = false;
                                            //entity._anim.currentTime = 0;
                                        }, stop);
                                    }
                                }
                            };

                            dataz._rotateModel = function(to_facing) {
                                //console.log("old facing = "+entity.facing+"; to_facing = "+to_facing);
                                var diff = to_facing - entity.facing;
                                //console.log("diff = "+diff+" ("+(45*diff)+" deg)");
                                entity.facing += diff;
                                if (entity.facing < 0) entity.facing = 7 - entity.facing;
                                if (entity.facing > 7) entity.facing = entity.facing - 7;
                                //console.log("new entity facing = " + entity.facing);
                                var rotation = entity.displayObject.rotation;
                                //rotation.set( rotation.x += de2ra(45*diff), rotation.y, rotation.z);
                                //rotation.y += de2ra(45*diff);
                                mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), de2ra(45 * diff));
                                //calcRotation(entity.displayObject, 45*diff);
                            };

                        }.bind(this))(dataz);
                    } else {
                        dataz.displayObject = AssetManager.Sprite(AssetManager.images[dataz.name], 1, 1, 32, 32);
                    }
                    cb(dataz);
                } else {
                    console.log("loaded entity without name ??: " + dataz);
                    console.dir(dataz);
                }


            }.bind(this));
        }
        window.eman = this;
    };



    return EntityManager;
});