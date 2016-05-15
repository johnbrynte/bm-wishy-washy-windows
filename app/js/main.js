require.config({
    'baseUrl': '/js/',
    'shim': {
        'lib/three': {
            'exports': 'THREE'
        }
    }
});

require([
    'utils/Constants',
    'utils/Timer',
    'utils/animation',
    'lib/three',
    'display/AssetManager',
    'display/gui/GUIAnimator',
    'display/guicomponents/Director',
    'display/guicomponents/GUIComponent',
    'display/guicomponents/TextComponent',
    'display/guicomponents/Button',
    'display/webgl/primitives/Panel',
    'display/webgl/primitives/Rect',
    'display/webgl/primitives/Sprite',
    'display/webgl/primitives/Text'
], function(
    Constants,
    Timer,
    Animation,
    THREE,
    AssetManager,
    GUIAnimator,
    Director,
    GUIComponent,
    TextComponent,
    Button,
    Panel,
    Rect,
    Sprite,
    Text
) {

    /**
     * The GUI is built here.
     * @return {[type]} [description]
     */
    function build(director) {
        var width = 600;
        var height = 400;
        var top = 0;
        var text;

        var container = new GUIComponent(width, 0)
            .setPosition(20, 20)
            .setLayout(Constants.layout.HORIZONTAL)
            .setLayoutAlign(Constants.layout.TOP);
        director.addChild(container);

        text = new TextComponent('<- A row of clickable buttons')
            .setTextSize(24)
            .setPosition(width + 30, 20);
        director.addChild(text);

        for (var i = 0; i < 4; i++) {
            var button = new Button()
                .setTextSize(26)
                .setTextColor(0xffffff)
                .setText('button' + i)
                .on('click', (function(i) {
                    return function() {
                        textOutput.setText('Clicked button ' + i);
                        GUIAnimator.animate(sprite, {
                            'width': 100 + i * 50,
                            'height': 100 + i * 50
                        }, 800, null, GUIAnimator.easing.SMOOTH);
                    };
                })(i));
            button.setFixedSize(true);
            container.addChild(button);

            // recalculate
            container.children.forEach(function(child) {
                child.setSize(width / container.children.length, child.height);
            });
            container._applyLayout();
        }

        top = container.children[0].height;
        container.setSize(container.width, top);

        text = new TextComponent('<- A nonclickable button')
            .setTextSize(24)
            .setPosition(width + 30, top + 20);
        director.addChild(text);

        var textOutput = new Button(width, 40)
            .setPosition(20, top + 20)
            .setTextSize(50)
            .setTextColor(0x000000)
            .setSelectable(false)
            .setButtonImages({
                'active': AssetManager.images.border_active,
                'inactive': AssetManager.images.border,
                'borderWidth': 9,
                'borderHeight': 9
            });
        director.addChild(textOutput);

        var sprite = new GUIComponent()
            .setPosition(20, 170)
            .setDisplay(AssetManager.Sprite(AssetManager.images.bluemoon))
            .setSize(100, 100);
        director.addChild(sprite);

        text = new TextComponent('<- An animated sprite (click the buttons)')
            .setTextSize(24)
            .setPosition(320, 170);
        director.addChild(text);
    };

    //---- GUI Tool initialization ----

    var activemenu = null;
    var menuhandlechange;
    var mousex, mousey;

    var editmode = false;

    var displayJSON = function(a0, a1, a2) {
        var el, json, callbacks;
        if (!a1 || !a2) {
            el = $('#object-json').html('');
            json = a0;
            callbacks = a1;
        } else {
            el = a0;
            json = a1;
            callbacks = a2;
        }
        if (!a0) {
            return;
        }
        el.append($('<p>').html('{'));
        var list = $('<ul>');
        for (var key in json) {
            var entry = $('<li>');
            if (Object.prototype.toString.call(json[key]) == '[object Object]') {
                displayJSON(entry, json[key], callbacks);
            } else {
                entry.html(key + ': ');
                if (typeof json[key] == 'number') {
                    entry.append($('<input>').attr({
                        'type': 'text',
                        'value': json[key]
                    }).on('keyup', (function(key) {
                        return function(evt) {
                            if (callbacks && callbacks[key]) {
                                callbacks[key](evt.target.value);
                            }
                        };
                    })(key)));
                } else {
                    entry.append(json[key]);
                }
            }
            list.append(entry);
        }
        el.append(list);
        el.append($('<p>').html('}'));
    };

    $(document).ready(function() {
        $('.menu .size-handle').on('mousedown', function(evt) {
            if (!activemenu) {
                activemenu = $(evt.target).parent();
                if (activemenu.hasClass('left')) {
                    menuhandlechange = function(change) {
                        return change;
                    }
                } else {
                    menuhandlechange = function(change) {
                        return -change;
                    }
                }
                mousex = evt.pageX;
            }
        });

        $(window).on('mousemove', function(evt) {
            if (activemenu) {
                evt.preventDefault();

                var width = parseInt($(activemenu).css('width')) + menuhandlechange(evt.pageX - mousex);
                $(activemenu).css({
                    width: width + 'px'
                });
                mousex = evt.pageX;
            }
        });

        $(window).on('mouseup', function(evt) {
            activemenu = null;
        });

        $(window).on('keydown', function(evt) {
            if (evt.keyCode == 9) {
                evt.preventDefault();
                editmode = !editmode;
                console.log('Edit mode ' + (editmode ? 'on' : 'off'));
            }
        });
    });

    //---- AssetManager initialization ----

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    AssetManager.init({
        shaders: {
            v_panel: 'v_panel.glsl',
            f_panel: 'f_panel.glsl',
            v_text: 'v_text.glsl',
            f_text: 'f_text.glsl'
        },
        images: {
            bluemoon: 'bluemoon.jpg',
            border: 'buttons/grey_button06.png',
            border_inactive: 'buttons/grey_button06.png',
            button: 'buttons/blue_button02.png',
            button_active: 'buttons/blue_button03.png',
            montserrat_map: 'montserrat_map.png'
        },
        fonts: {
            montserrat: 'montserrat_data.json'
        }
    }, function() {
        var gui, camera, director, selector, activecomponent;

        var getObjectType = function(component) {
            if (component instanceof Panel) {
                return 'Panel';
            }
            if (component instanceof Rect) {
                return 'Rect';
            }
            if (component instanceof Sprite) {
                return 'Sprite';
            }
            if (component instanceof Text) {
                return 'Text';
            }
            if (component instanceof Button) {
                return 'Button';
            }
            if (component instanceof TextComponent) {
                return 'TextComponent';
            }
            if (component instanceof GUIComponent) {
                return 'GUIComponent';
            }
            return typeof component;
        };

        var getReadableChildrenArray = function(children) {
            var c = new Array(children.length);
            for (var i = 0; i < children.length; i++) {
                c[i] = children[i].id;
            }
            return c.join(',');
        };

        var componentSelect = function(component) {
            return function(evt) {
                evt.preventDefault();

                $('#component-title').html(component.id);
                $('#family-tree .component').removeClass('active');
                $('#family-tree .component.' + component.id).addClass('active');

                var root = $('#family-tree')[0];
                var el = $('#family-tree .component.' + component.id).parent().parent();
                while (el.parent()[0] != root) {
                    el.parent().children('.expand').html('-');
                    el.slideDown('fast');
                    el = el.parent().parent();
                }

                selector
                    .setPosition(component.x, component.y)
                    .setSize(component.width, component.height);

                displayJSON({
                    type: getObjectType(component),
                    display: getObjectType(component.display),
                    position: {
                        x: component.x,
                        y: component.y
                    },
                    dimension: {
                        width: component.width,
                        height: component.height
                    }
                }, {
                    x: function(val) {
                        component.setPosition(parseFloat(val), component.relY);
                    },
                    y: function(val) {
                        component.setPosition(component.relX, parseFloat(val));
                    },
                    width: function(val) {
                        component.setSize(parseFloat(val), component.height);
                    },
                    height: function(val) {
                        component.setSize(component.width, parseFloat(val));
                    }
                });
            };
        };

        var componentDeselect = function() {
            $('#component-title').html('');
            $('#family-tree .component').removeClass('active');
            selector.setPosition(-1, -1).setSize(1, 1);
            displayJSON(null);
        };

        var componentMove = function(component) {

        };

        var componentDragOver = function(component) {
            return function(evt) {
                selector
                    .setPosition(component.x, component.y)
                    .setSize(component.width, component.height);

                activecomponent = component;
            };
        };

        var displayFamilyTree = function(forefather) {
            var _appendChildren = function(el, parent) {
                var li,
                    ul = $('<ul>');

                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i] != selector) {
                        li = $('<li>');
                        li.append($('<div>')
                            .addClass('expand')
                            .addClass(parent.children[i].children.length == 0 ? 'inactive' : '')
                            .html('+'));
                        li.append($('<span>')
                            .addClass('component')
                            .addClass(parent.children[i].id)
                            .html(parent.children[i].id)
                            .click(componentSelect(parent.children[i])));
                        _appendChildren(li, parent.children[i]);
                        ul.append(li);
                    }
                }

                el.append(ul);
            };

            _appendChildren($('#family-tree').html(''), forefather);

            $('#family-tree li').each(function() {
                if ($(this).children('ul').length > 0) {
                    $(this).addClass('parent');
                }
            });

            $('#family-tree li.parent > .expand').click(function() {
                $(this).parent().toggleClass('active');
                $(this).html($(this).parent().children('ul').css('display') == 'none' ? '-' : '+');
                $(this).parent().children('ul').slideToggle('fast');
            });
        };

        // show the GUI menu
        $('.menu').show();
        // attach drag and drop event
        $('#object-list input[type=button]').on('dragstart', function(evt) {
            evt.originalEvent.dataTransfer.setData('object', evt.target.value);
            activecomponent = null;
            componentDeselect();
        });
        $('canvas')
            .on('click', function(evt) {
                componentDeselect();
            })
            .on('dragover', function(evt) {
                evt.originalEvent.preventDefault();
            })
            .on('drop', function(evt) {
                var component,
                    data = evt.originalEvent.dataTransfer.getData('object'),
                    x = evt.originalEvent.pageX,
                    y = evt.originalEvent.pageY;

                switch (data) {
                    case 'Panel':
                        component = new GUIComponent(100, 100)
                            .setDisplay(AssetManager.Panel(AssetManager.images.border, 100, 100, 9, 9));
                        break;
                    case 'Button':
                        component = new Button()
                            .setText('Button');
                        break;
                }

                if (component) {
                    if (activecomponent) {
                        activecomponent.addChild(component);
                        component.setPosition(x - activecomponent.x, y - activecomponent.y);
                        component.on('click', componentSelect(component));
                        component.on('dragover', componentDragOver(component));
                        displayFamilyTree(director);
                    } else {
                        component.setPosition(x, y);
                    }
                }

                componentDeselect();
            });

        gui = new THREE.Scene();
        camera = new THREE.OrthographicCamera(0, AssetManager.width, 0, -AssetManager.height, 0, 10000);

        director = new Director(AssetManager);
        window.director = director;
        gui.add(director.object3d);

        build(director);

        displayFamilyTree(director);

        var attachSelectEvents = function(children) {
            for (var i = 0; i < children.length; i++) {
                children[i].on('click', componentSelect(children[i]));
                children[i].on('dragover', componentDragOver(children[i]));
                attachSelectEvents(children[i].children);
            }
        };
        attachSelectEvents(director.children);

        selector = new GUIComponent(0, 0)
            .setDisplay(AssetManager.Rect(1, 1, 0x00ff00, 0.4));
        director.addChild(selector);
        selector.setZIndex(10000);
        window.selector = selector;

        Animation.addInterval(function() {
            AssetManager.renderer.render(gui, camera);
        }, 30);

        var loop = function() {
            Animation.update();
            GUIAnimator.update();
        };

        Timer.loop(loop);
    });

    window.assman = AssetManager;

});