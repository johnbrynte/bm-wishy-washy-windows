define([
    'lib/gl-matrix-min',
    'utils/Constants',
    'display/webgl/game/Camera',
    'display/webgl/primitives/Panel',
    'display/webgl/primitives/Sprite',
    'display/webgl/primitives/Cube3D',
    'display/webgl/primitives/Text',
    'display/webgl/gui/SpriteDisplay',
    'display/webgl/gui/ButtonDisplay',
    'display/webgl/gui/PanelDisplay',
    'display/webgl/gui/TextDisplay',
    'display/webgl/game/Items'
], function(
    glMatrix,
    Constants,
    Camera,
    Panel,
    Sprite,
    Cube3D,
    Text,
    SpriteDisplay,
    ButtonDisplay,
    PanelDisplay,
    TextDisplay,
    Items
) {

    var mat4 = glMatrix.mat4;

    var gl = null;

    var mMatrixStack = [];
    var vMatrixStack = [];
    var pMatrixStack = [];

    var AssetManager = {
        canvas: null,
        context: null,
        programs: null,
        cameras: null,
        images: null
    };

    AssetManager.Panel = function(image, x, y, width, height, borderWidth,
        borderHeight) {
        return new Panel(AssetManager, image, x, y, width, height,
            borderWidth, borderHeight);
    };

    AssetManager.Sprite = function(image, spriteWidth, spriteHeight) {
        return new Sprite(AssetManager, image, spriteWidth, spriteHeight);
    };

    AssetManager.Cube3D = function(image, textureSize) {
        return new Cube3D(AssetManager, image, textureSize);
    };

    AssetManager.SpriteDisplay = function(image, x, y, spriteWidth,
        spriteHeight) {
        return new SpriteDisplay(AssetManager, image, x, y, spriteWidth,
            spriteHeight);
    };

    AssetManager.ButtonDisplay = function(image, x, y, borderWidth,
        borderHeight, string, colorString) {
        return new ButtonDisplay(AssetManager, image, x, y, borderWidth,
            borderHeight, string, colorString);
    };

    AssetManager.PanelDisplay = function(image, x, y, width, height,
        borderWidth, borderHeight) {
        return new PanelDisplay(AssetManager, image, x, y, width, height,
            borderWidth, borderHeight);
    };

    AssetManager.TextDisplay = function(x, y, string, colorString) {
        return new TextDisplay(AssetManager, x, y, string, colorString);
    };

    AssetManager.Text = function(x, y, width, height, font, string,
        colorString) {
        return new Text(AssetManager, x, y, width, height, font, string,
            colorString);
    };

    AssetManager.init = function(callback) {
        // Create a loading 2d canvas
        var canvas = document.createElement('canvas');
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        this.canvas.style.width = this.canvas.width;
        this.canvas.style.height = this.canvas.height;
        this.canvas.width = this.canvas.width * window.devicePixelRatio;
        this.canvas.height = this.canvas.height * window.devicePixelRatio;
        this.context = canvas.getContext('2d');
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, canvas.width, canvas.height);

        var options = {
            vertex_shaders: {
                panel: 'v_panel.glsl',
                sprite: 'v_sprite.glsl',
                sprite_text: 'v_sprite_text.glsl',
                cube: 'v_cube.glsl',
                text: 'v_text.glsl'
            },
            fragment_shaders: {
                panel: 'f_panel.glsl',
                sprite: 'f_sprite.glsl',
                sprite_text: 'f_sprite_text.glsl',
                cube: 'f_cube.glsl',
                text: 'f_text.glsl'
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
                wall7: 'wall7.png',
                perimeter: 'perimeter.png',
                tiles: 'tiles.png',
                floor2: 'rect_gray1.png',
                floor3: 'mesh2.png',
                floor4: 'ice0.png',
                floor5: 'crystal_floor0.png',
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
                anim_hurt: 'i-strong-poison.png'

            },
            fonts: {
                montserrat_data: 'montserrat_data.json'
            }
        }

        for (var name in Items) {
            var item = Items[name];
            options.images[name] = '' + item.icon;

        }

        this._loadAssets(options, (function(data) {
            var canvas, camera;
            // Remove loading canvas
            document.body.removeChild(this.canvas);

            // Init WebGL
            canvas = document.createElement('canvas');
            this.canvas = canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            document.body.appendChild(canvas);
            this.canvas.style.width = this.canvas.width;
            this.canvas.style.height = this.canvas.height;
            this.canvas.width = this.canvas.width * window.devicePixelRatio;
            this.canvas.height = this.canvas.height * window.devicePixelRatio;
            this.context = canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl');

            // Initialize the cameras
            this.cameras = {};
            camera = new Camera(AssetManager);
            camera.setPerspectiveCamera(Math.PI / 8);
            this.cameras.perspective = camera;
            camera = new Camera(AssetManager);
            camera.setOrthographicCamera();
            this.cameras.orthographic = camera;

            // Initialize webgl
            gl = this.context;
            gl.viewport = {
                width: canvas.width,
                height: canvas.height
            };

            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);

            gl.clearColor(0.1, 0.1, 0.1, 1);

            // Handle the loaded data
            // Create the WebGL programs
            this.programs = {
                'panel': this._createProgram(
                    [this._createShader(data.vertex_shaders.panel, gl.VERTEX_SHADER),
                        this._createShader(data.fragment_shaders.panel, gl.FRAGMENT_SHADER)
                    ], ['aPosition'], ['uSampler', 'uSize', 'uBorderSize']),
                'sprite': this._createProgram(
                    [this._createShader(data.vertex_shaders.sprite, gl.VERTEX_SHADER),
                        this._createShader(data.fragment_shaders.sprite, gl
                            .FRAGMENT_SHADER)
                    ], ['aPosition'], [
                        'uSampler', 'uSize', 'uTextureSize', 'uTextureIndices'
                    ]
                ),
                'sprite_text': this._createProgram(
                    [this._createShader(data.vertex_shaders.sprite_text, gl.VERTEX_SHADER),
                        this._createShader(data.fragment_shaders.sprite_text,
                            gl.FRAGMENT_SHADER)
                    ], ['aPosition'], [
                        'uSampler', 'uSize', 'uTextureSize',
                        'uTextureIndices', 'uScale', 'uColor'
                    ]
                ),
                'cube': this._createProgram(
                    [this._createShader(data.vertex_shaders.cube, gl.VERTEX_SHADER),
                        this._createShader(data.fragment_shaders.cube, gl.FRAGMENT_SHADER)
                    ], ['aPosition', 'aTextureCoord'], ['uSampler']
                ),
                'text': this._createProgram(
                    [this._createShader(data.vertex_shaders.text, gl.VERTEX_SHADER),
                        this._createShader(data.fragment_shaders.text, gl.FRAGMENT_SHADER)
                    ], ['aPosition'], ['uSampler', 'uSize', 'uColor']
                )
            };

            // Create the images
            this.images = data.images;

            // Parse the json files
            this.json = {};
            for (var key in data.json) {
                this.json[key] = JSON.parse(data.json[key]);
            }

            // Init the fonts
            this.fonts = {
                'montserrat': {
                    'map': data.images.montserrat_map,
                    'data': this.json.montserrat_data
                }
            };

            // Bottom of the chain
            if (callback) {
                callback.call(this);
            }
        }).bind(this));
    };

    AssetManager.update = function() {
        for (var key in this.cameras) {
            this.cameras[key].update();
        };
    };

    AssetManager.clearScreen = function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    AssetManager._pushMatrix = function(stack, matrix) {
        var copy = mat4.create();
        mat4.copy(copy, matrix);
        stack.push(copy);
    };

    AssetManager.mPushMatrix = function(program) {
        this._pushMatrix(mMatrixStack, program.mMatrix);
    };

    AssetManager.vPushMatrix = function(program) {
        this._pushMatrix(vMatrixStack, program.vMatrix);
    };

    AssetManager.pPushMatrix = function(program) {
        this._pushMatrix(pMatrixStack, program.pMatrix);
    };

    AssetManager.mPopMatrix = function(program) {
        program.mMatrix = mMatrixStack.pop();
    };

    AssetManager.vPopMatrix = function(program) {
        program.vMatrix = vMatrixStack.pop();
    };

    AssetManager.pPopMatrix = function(program) {
        program.pMatrix = pMatrixStack.pop();
    };

    AssetManager._createShader = function(shaderScript, glShaderType) {
        var shader;

        shader = gl.createShader(glShaderType);
        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw gl.getShaderInfoLog(shader);
        }

        return shader;
    };

    AssetManager._createProgram = function(shaders, attribs, uniforms) {
        var junkBuffer,
            program = gl.createProgram();

        // Fill the buffer with junk
        junkBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]),
            gl.STATIC_DRAW);

        for (var i = 0; i < shaders.length; i++) {
            gl.attachShader(program, shaders[i]);
        }
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(program);
        }

        if (attribs) {
            for (var i = 0; i < attribs.length; i++) {
                program[attribs[i]] = gl.getAttribLocation(program,
                    attribs[i]);
                gl.enableVertexAttribArray(program[attribs[i]]);
                // Fill it with junk to avoid errors
                gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
                gl.vertexAttribPointer(program[attribs[i]], 1, gl.FLOAT,
                    false, 0, 0);
            }
        }
        if (uniforms) {
            for (var i = 0; i < uniforms.length; i++) {
                program[uniforms[i]] = gl.getUniformLocation(program,
                    uniforms[i]);
            }
        }

        program.uMMatrix = gl.getUniformLocation(program, 'uMMatrix');
        program.uVMatrix = gl.getUniformLocation(program, 'uVMatrix');
        program.uPMatrix = gl.getUniformLocation(program, 'uPMatrix');

        return program;
    };

    AssetManager._loadAssets = function(filesToLoad, callback) {
        var request, image, ctx, width, height, barWidth, x, y,
            barHeight = 30,
            data = {},
            fileCount = 0,
            _fileCount = 0,
            loadedFiles = 0,
            that = this;

        width = this.canvas.width;
        height = this.canvas.height;
        barWidth = width * 0.6;
        x = (width - barWidth) / 2;
        y = height / 2;
        ctx = this.context;
        ctx.font = '30px Monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('Loading assets...', width / 2, height / 2 - 30);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x, y, barWidth, barHeight);

        var checkIfDone = function(src) {
            if (fileCount > 0) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, y + barHeight + 5, ctx.canvas.width, ctx.canvas
                    .height / 2);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x, y, barWidth * loadedFiles / (fileCount - 1),
                    barHeight);
                ctx.fillText(src, width / 2, height / 2 + barHeight + 35);
            }

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
                    image.onload = (function(src, group, name, img) {
                        return function() {
                            loadedFiles++;

                            if (!data[group])
                                data[group] = {};
                            data[group][name] = img;

                            checkIfDone(src);
                        };
                    })(filesToLoad[group][name], group, name, image);
                    image.src = path + filesToLoad[group][name];
                } else {
                    request = new XMLHttpRequest();
                    request.onreadystatechange = (function(src, group, name) {
                        return function() {
                            if (this.readyState === 4) {
                                if (this.status === 200) {
                                    loadedFiles++;

                                    if (!data[group])
                                        data[group] = {};
                                    data[group][name] = this.responseText;

                                    checkIfDone(src);
                                } else {
                                    throw "Error loading file: " +
                                        group +
                                        "." + name;
                                }
                            }
                        };
                    })(filesToLoad[group][name], group, name);
                    request.open('GET', path + filesToLoad[group][name], true);
                    request.send();
                }
            }
        }
        // update the file count
        fileCount = _fileCount;
    };

    return AssetManager;
});