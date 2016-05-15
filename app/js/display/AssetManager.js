define([
    'lib/three',
    'utils/Constants',
    'display/webgl/primitives/Panel',
    'display/webgl/primitives/Rect',
    'display/webgl/primitives/Sprite',
    'display/webgl/primitives/Cube',
    'display/webgl/primitives/MeshCube',
    'display/webgl/primitives/Text',
    'display/webgl/game/Items',
    //'display/SpeedBlendCharacter',
    'EventManager'
], function(
    THREE,
    Constants,
    Panel,
    Rect,
    Sprite,
    Cube,
    MeshCube,
    Text,
    Items,
    //SpeedBlendCharacter,
    EvtMgr
) {

    var self = {};

    var parameters_default = {
        shaders: {
            v_panel: 'v_panel.glsl',
            f_panel: 'f_panel.glsl',
            v_text: 'v_text.glsl',
            f_text: 'f_text.glsl'
        },
        images: {
            border: 'border.png',
            border_inactive: 'border_inactive.png',
            button: 'button.png',
            button_active: 'button_active.png',
            montserrat_map: 'montserrat_map.png',
            wall: 'wall.png',
            wall2: 'wall2.png',
            wall3: 'wall3.png',
            wall4: 'wall4.png',
            wall5: 'wall5.png',
            wall6: 'wall6.png',
            wall7: 'floor_foo17.png',
            wall8: 'wall7.png',
            wall9: 'tileable5j.png',
            wall10: 'wall2bis.png',
            wall11: 'floor_foo2.png',
            perimeter: 'perimeter.png',
            tiles: 'tiles.png',
            floor2: 'rect_gray1.png',
            floor3: 'mesh2.png',
            floor4: 'ice0.png',
            floor5: 'crystal_floor0.png',
            floor6: 'floor_foo.jpg',
            wizard: 'wizard.png',
            wizard_box: 'wizard_box.png',
            unknown: 'unknown.png',
            bluemoon: 'bluemoon.jpg',
            monster: 'monster1.png',
            forge: 'forge.png',
            // Adding specific old monster sprites as placeholders
            berserker: 'berserker.png',
            blackpuddong: 'blackpudding.png',
            gelatinouscube: 'gelatinouscube.png',
            ghoul: 'ghoul.png',
            goblin: 'goblin.png',
            hobgoblin: 'hobgoblin.png',
            kobold: 'kobold.png',
            skeleton: 'skeleton.png',
            // Images for state animations like hurt, poisoned, health up, et.c.
            anim_hurt: 'i-strong-poison.png',
            // Icons
            icon_party: 'icons/party.png',
            icon_create: 'icons/create.png',
            icon_inventory: 'icons/inventory.png',
            icon_treasure: 'icons/treasure.png',
            icon_simple: 'icons/simple.png',
            icon_messages: 'icons/messages.png',
            icon_highscore: 'icons/highscore.png'
        },
        json: {},
        fonts: {
            montserrat: 'montserrat_data.json'
        },
        models: {
            human: 'human_fas6a.js',
            goblin: 'goblin_fas6a.js',
            skeleton: 'skellet_lev.js',
            cauldron: 'cauldron.js',
            manapool: 'manapool.js',
            healingpool: 'healingpool.js',
            'corner_convex': 'corner_convex.js',
            'corner_concave': 'corner_concave.js',
            'small_wall': 'small_wall.js',
            'small_floor': 'small_floor.js'
        },
        modelTextures: {
            goblin: 'goblin.png',
            human: 'human.png',
            skeleton: 'skel_col.png',
            cauldron: 'cauldron.jpg',
            manapool: 'manapool.jpg',
            healingpool: 'healingpool.jpg',
            'corner': 'Corners_df_512x256.png',
            'small_wall': 'Small_Wall_01_df_512x512.png',
            'small_floor': 'Small_Floor_01_df_256x256.png'
        }
    };

    THREE.Utils = {
        /**
         * By mattdlockyer (http://stackoverflow.com/questions/15696963/three-js-set-and-read-camera-look-vector)
         * @type {Object}
         */
        cameraLookDir: function(camera) {
            var vector = new THREE.Vector3(0, 0, -1);
            vector.applyEuler(camera.rotation, camera.rotation.order.eulerOrder);
            return vector;
        }
    };

    self.loader = {
        init: function() {
            this.canvas = document.createElement('canvas');
            this.canvas.width = window.innerWidth; // * window.devicePixelRatio;
            this.canvas.height = window.innerHeight; // * window.devicePixelRatio;
            document.body.appendChild(this.canvas);
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
            this.canvas.width = this.canvas.width * window.devicePixelRatio;
            this.canvas.height = this.canvas.height * window.devicePixelRatio;
            this.context = this.canvas.getContext('2d');
            this.context.fillStyle = '#000';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this._nFiles = 0;

            this._barW = this.canvas.width * 0.6;
            this._barH = this.canvas.height * 0.05;
            this._barX = (this.canvas.width - this._barW) / 2;
            this._barY = this.canvas.height / 2 + 5;
            this._fontSize = this.canvas.height * 0.05;
            this.context.textAlign = 'center';
            this.font = this._fontSize + 'px Monospace';
        },
        setTotalFiles: function(n) {
            this._nFiles = n;
            this.setLoadedFiles(0);
        },
        setLoadedFiles: function(n, msg) {
            this.context.fillStyle = '#000';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = '#fff';
            this.context.strokeStyle = '#fff';
            this.context.font = this.font;
            this.context.fillText('Loading files... (' + n + '/' + this._nFiles + ') ' + (msg ? msg : ''),
                this.canvas.width / 2, this.canvas.height / 2 - this._fontSize - 5);
            this.context.strokeRect(this._barX, this._barY, this._barW, this._barH);
            this.context.fillRect(this._barX, this._barY, this._barW * n / this._nFiles, this._barH);
        },
        delete: function() {
            document.body.removeChild(this.canvas);
        }
    };

    /**
     * Init the module
     * @return {[type]} [description]
     */
    self.init = function(arg0, arg1) {
        self.loader.init();

        var parameters, callback;

        if (typeof arg1 == 'undefined' && typeof arg0 == 'function') {
            // use default parameters (load everything)
            parameters = parameters_default;

            for (var name in Items) {
                var item = Items[name];
                parameters.images[name] = item.icon;
            }

            callback = arg0;
        } else {
            parameters = arg0;
            callback = arg1;
        }

        self.parameters = parameters;

        self.keyFrames = {
            goblin: {
                walk: {
                    start: 0,
                    duration: 24
                },
                attack: {
                    start: 24,
                    duration: 6
                },
                hurt: {
                    start: 31,
                    duration: 6
                },
                death: {
                    start: 37,
                    duration: 21
                }
            },
            human: {
                walk: {
                    start: 0,
                    duration: 23
                },
                attack: {
                    start: 19,
                    duration: 8
                },
                attack2: {
                    start: 42,
                    duration: 3
                },
                hurt: {
                    start: 46,
                    duration: 4
                },
                death: {
                    start: 51,
                    duration: 13
                }
            }
        }

        self._loadAssets(parameters, function(data) {
            var material;

            self.shaders = data.shaders;
            self.images = data.images;

            // Parse the json files
            self.json = {};
            for (var key in data.json) {
                self.json[key] = JSON.parse(data.json[key]);
            }

            self._createMaterials();

            // init fonts
            self.fonts = {};
            for (var font in data.fonts) {
                material = self.materials.font.clone();
                material.uniforms.sampler.value.image = self.images[font + '_map'];
                self.fonts[font] = {
                    data: JSON.parse(data.fonts[font]),
                    material: material
                };
            }

            self.models = {};
            self.rawmodeldata = data.models ? data.models : {};
            self.rawmodeltextures = data.modelTextures ? data.modelTextures : {};
            // the two corners uses the same texture
            self.rawmodeltextures['corner_concave'] = self.rawmodeltextures['corner_convex'] = self.rawmodeltextures['corner'];

            self._preloadThreejsModels(data.models, data.modelTextures);
            console.dir(parameters.models);
            //self._standardLoadModels(parameters.models, function()
            //{
            // Remove the loader
            self.loader.delete();
            console.log(" -- loader deleted --");
            // Init WebGL
            self.renderer = new THREE.WebGLRenderer();
            self.renderer.autoClear = true;

            self.renderer.setClearColor(Constants.colors.background);
            self.width = window.innerWidth;
            self.height = window.innerHeight;
            // the renderer uses window.devicePixelRatio
            self.renderer.setSize(self.width, self.height);
            document.body.appendChild(self.renderer.domElement);
            this.canvas = self.renderer.domElement;
            self.width = self.width * window.devicePixelRatio;
            self.height = self.height * window.devicePixelRatio;
            self.aspect = self.width / self.height;

            /*
                 this.canvas.addEventListener("touchstart",self.onTouchStart, false);
                 this.canvas.addEventListener("touchend", self.onTouchEnd, false);
                 this.canvas.addEventListener("touchmove", self.onTouchMove, false);
                 */

            /*
                this.canvas.addEventListener('mousedown', self.onMouseDown);
                this.canvas.addEventListener('mousemove', self.onMouseMove);
                this.canvas.addEventListener('mouseup', self.onMouseUp);
                */


            if (callback) {
                callback();
            }
            //});


        });

    };

    self.onMouseDown = function(event) {
        console.log("mousedown event");
        console.dir(event);
        this.mousedown = true;
        this.mousex = event.x;
        this.mousey = event.y;
    }.bind(this);

    self.onMouseUp = function(event) {
        this.mousedown = false;
        console.log("mouseup event");
    }.bind(this);

    self.onMouseMove = function(event) {
        if (this.mousedown) {
            //console.log("mousemove event");
            var diffx = event.x - this.mousex;
            var diffy = event.y - this.mousey;
            //console.log("diffx = "+diffx+", diffy = "+diffy);

            if ((diffx > 10 || diffy > 10) && event.x < 20) {
                EvtMgr.trigger('swipe_x_event', [diffx]);
                EvtMgr.trigger('swipe_y_event', [diffy]);
            }
            this.mousex = event.x;
            this.mousey = event.y;

        }
    }.bind(this);

    self.onTouchStart = function(event) {
        console.log("touchstart eh");
        this.mousex = event.changedTouches[0].clientX;
        this.mousey = event.changedTouches[0].clientY;
        this.mousedown = true;
    };

    self.onTouchEnd = function(event) {
        this.mousedown = false;
    };

    self.onTouchMove = function(event) {
        var diffx = event.changedTouches[0].clientX - this.mousex;
        var diffy = event.changedTouches[0].clientY - this.mousey;
        //console.log("diffx = "+diffx+", diffy = "+diffy);

        EvtMgr.trigger('swipe_x_event', [diffx]);
        EvtMgr.trigger('swipe_y_event', [diffy]);

        this.mousex = event.changedTouches[0].clientX;
        this.mousey = event.changedTouches[0].clientX;
    };

    self._preloadThreejsModels = function(models, textures) {
        var name, model,
            loader = new THREE.JSONLoader();

        for (name in models) {
            model = loader.parse(JSON.parse(models[name]));
            self.models[name] = self._loadModel(model.geometry, model.materials, textures[name]);
            self.models[name].keyFrames = self.keyFrames[name];
            self.models[name].visible = true;
            console.log('finished loading model "' + name + '"');
        }
    };

    self.getNewInstanceOfModel = function(name, skinning) {
        var loader = new THREE.JSONLoader();
        var pdata = self.rawmodeldata[name];
        //console.log("pdata for '"+name+"' was "+pdata);
        var modelconfig = loader.parse(JSON.parse(pdata));

        var model = self._loadModel(modelconfig.geometry, modelconfig.materials, self.rawmodeltextures[name], skinning);
        if (self.keyFrames[name]) {
            model.keyFrames = self.keyFrames[name];
        }
        return model;
    };

    self._loadModel = function(geometry, materials, image, skinning) {
        for (var i = 0; i < materials.length; i++) {
            // add the corresponding texture map to all materials
            if (materials[i].map === null) {
                var m = materials[i];
                if (skinning) {
                    m.skinning = true;
                }
                if (image != undefined) {
                    m.map = new THREE.Texture(image);
                    m.map.needsUpdate = true;
                }
            }
        }

        var mesh;
        if (skinning) {
            mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        } else {
            mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        }

        mesh.scale.set(0.4, 0.4, 0.4);
        mesh.position.set(-1000, -1000, -1000);
        return mesh;
    };

    self.enableSkinning = function(skinnedMesh) {
        var materials = skinnedMesh.material.materials;
        for (var i = 0, length = materials.length; i < length; i++) {
            var mat = materials[i];
            mat.skinning = true;
        }
    };

    self.morphColorsToFaceColors = function(geometry) {
        if (geometry.morphColors && geometry.morphColors.length) {
            var colorMap = geometry.morphColors[0];
            for (var i = 0; i < colorMap.colors.length; i++) {

                geometry.faces[i].color = colorMap.colors[i];
                geometry.faces[i].color.offsetHSL(0, 0.3, 0);
            }
        }
    };

    self.Model = function(name, x, y) {
        var template = self.models[name];
        //console.log("creating a clone of model '"+name+"', which is "+template);
        var model = template.clone();
        model.keyFrames = template.keyFrames;
        //console.log("new clone is "+model);
        return model;

    };

    self.Text = function(string, font) {
        if (typeof font == 'undefined') {
            font = self.fonts.montserrat;
        }
        return new Text(string, font);
    };

    self.Panel = function(image, width, height, borderWidth, borderHeight) {
        return new Panel(self, image, width, height, borderWidth, borderHeight);
    };

    self.Rect = function(width, height, color, opacity) {
        return new Rect(width, height, color, opacity);
    };

    self.Sprite = function(image, width, height, spriteWidth, spriteHeight, lights) {
        return new Sprite(image, width, height, spriteWidth, spriteHeight, lights);
    };

    self.Cube = function(image, size, singleFace) {
        return new Cube(image, size, singleFace);
    };

    self.MeshCube = function(image, size) {

        var material = new THREE.MeshLambertMaterial({
            color: 0x000000,
            map: THREE.ImageUtils.loadTexture('floor_foo12.jpg')
        });

        // cube
        var cube = new THREE.Mesh(new THREE.CubeGeometry(size, size, size), material);
        cube.overdraw = true;

        return cube;
        //return new MeshCube(image, size);
    };

    self.removeChildren = function(object) {
        var children = object.children;
        while (children.length > 0) {
            object.remove(children[0]);
        }
    };

    self._createMaterials = function() {
        var material, texture;

        self.materials = {};

        // Panel Material
        texture = new THREE.Texture();
        texture.magFilter = THREE.NearestFilter;
        self.materials.panel = new THREE.ShaderMaterial({
            uniforms: {
                sampler: {
                    type: 't',
                    value: texture
                },
                size: {
                    type: 'v2',
                    value: new THREE.Vector2()
                },
                imageSize: {
                    type: 'v4',
                    value: new THREE.Vector4()
                }
            },
            vertexShader: self.shaders.v_panel,
            fragmentShader: self.shaders.f_panel,
            transparent: true
        });

        // Sprite material
        texture = new THREE.Texture();
        texture.magFilter = THREE.NearestFilter;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        self.materials.sprite = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });

        // Font material
        texture = new THREE.Texture();
        self.materials.font = new THREE.ShaderMaterial({
            uniforms: {
                sampler: {
                    type: 't',
                    value: texture
                },
                color: {
                    type: 'v3',
                    value: new THREE.Vector3()
                }
            },
            vertexShader: self.shaders.v_text,
            fragmentShader: self.shaders.f_text,
            transparent: true
        });
    };

    self._loadAssets = function(filesToLoad, callback) {
        var request, image,
            data = {},
            fileCount = 0,
            _fileCount = 0,
            loadedFiles = 0;

        var checkIfDone = function() {
            self.loader.setLoadedFiles(loadedFiles);
            // loadedFiles is never 0 here
            if (fileCount - loadedFiles === 0) {
                callback(data);
            }
        };

        for (var group in filesToLoad) {
            var path = Constants.paths.assets + group + "/";
            for (var name in filesToLoad[group]) {
                _fileCount++;

                // Special case to load images faster
                if (filesToLoad[group][name].match(/.*\.(png|jpg|jpeg)$/i)) {
                    image = document.createElement('img');
                    image.onload = (function(group, name, img) {
                        return function() {
                            loadedFiles++;

                            if (!data[group])
                                data[group] = {};
                            data[group][name] = img;

                            checkIfDone();
                        };
                    })(group, name, image);
                    image.src = path + filesToLoad[group][name];
                } else {
                    request = new XMLHttpRequest();
                    request.onreadystatechange = (function(group, name) {
                        return function() {
                            if (this.readyState === 4) {
                                if (this.status === 200) {
                                    loadedFiles++;

                                    if (!data[group])
                                        data[group] = {};
                                    data[group][name] = this.responseText;

                                    checkIfDone();
                                } else {
                                    throw 'Error loading file: ' +
                                        group + '.' + name;
                                }
                            }
                        };
                    })(group, name);
                    request.open('GET', path + filesToLoad[group][name], true);
                    request.send();
                }
            }
        }
        // update the file count
        fileCount = _fileCount;
        self.loader.setTotalFiles(fileCount);

    };

    return self;
});