/**
 * A grid dialog box with selectable items and action buttons
 */
define([
    './GUIComponent',
    'display/AssetManager',
    'display/guicomponents/Button',
    'display/guicomponents/TextComponent',
    'utils/Constants'
], function(
    GUIComponent,
    AssMan,
    Button,
    TextComponent,
    Constants
) {
    var GridDialog = function(director) {
        GUIComponent.call(this);

        this.director = director;

        this.selectedElement = null;
        this.selectedData = null;

        // Set up layout
        this.gridContainer = new GUIComponent()
            .setLayout(Constants.layout.GRID);

        this.descriptionContainer = new GUIComponent()
            .setDisplay(AssMan.Rect(0, 0, 0x000000, 0.5));

        this.buttonContainer = new GUIComponent()
            .setLayout(Constants.layout.HORIZONTAL)
            .setLayoutAlign(Constants.layout.TOP);

        this.buttonContainer.layoutMargin = 0;
        this.descriptionContainer.layoutMargin = 0;
        this.gridContainer.layoutMargin = 0;

        this.addChild(this.gridContainer);
        this.addChild(this.descriptionContainer);
        this.addChild(this.buttonContainer);

        this.columns = 4;
        this.elementSize = 0;
    };

    GridDialog.prototype = Object.create(GUIComponent.prototype);

    /**
     * Add a selectable element to the grid (e.g. item for inventory)
     * @param {GUIComponent} element An element to be shown in the grid.
     * @param {} data Any data to be attached to this element, returned in
     *                all button click callbacks.
     */
    GridDialog.prototype.addElement = function(element, data, onSelect) {
        var onClick = function(e, d) {
            return function() {
                if (this.selectedElement) {
                    this.selectedElement.setDisplay(null);
                }
                this.selectedElement = e;
                this.selectedData = d;
                this.setDescription(d);
                this.selectedElement.setDisplay(AssMan.Panel(AssMan.images.button, this.elementSize, this.elementSize, 9, 9));
                if (onSelect) onSelect(d);
                this.recalculateGridElements();
            }.bind(this);
        }.bind(this);

        var el = new GUIComponent();
        el.addChild(element.setSize(this.elementSize, this.elementSize))
            .setSize(this.elementSize, this.elementSize)
            .on('click', onClick(el, data))
            .on('touchstart', onClick(el, data));

        this.gridContainer.addChild(el);

        return this;
    };

    /**
     * Adds a button, e.g. "equip" or "drop".
     * @param {String} string A text to be shown on the button.
     * @param {Function} callback A callback function to this button's click event.
     *                            The callback recieves the index of the current selected
     *                            element as the first argument and the element's attached
     *                            data as the second argument.
     */
    GridDialog.prototype.addButton = function(string, callback) {
        var butt = new Button()
            .setTextSize(26)
            .setTextColor(0xffffff)
            .setText(string)
            .on('click', function() {
                // the first parameter will be equal to -1 if there is no selected element
                callback(this.gridContainer.children.indexOf(this.selectedElement), this.selectedData);
            }.bind(this));
        butt.setFixedSize(true);

        this.buttonContainer.addChild(butt);

        this.recalculateButtons();

        return this;
    };

    GridDialog.prototype.setDescription = function(data) {
        var ds = data.description || data.name;
        var text = new TextComponent(ds)
            .setTextSize(28)
            .setTextColor(0xffffff);
        this.descriptionContainer.removeChildren();
        this.descriptionContainer.addChild(text);
    };

    GridDialog.prototype.setSize = function(w, h) {
        this.width = w;
        this.height = h;

        this.gridContainer
            .setPosition(0, 0)
            .setDisplay(AssMan.Panel(AssMan.images.border, this.width, this.height, 9, 9))
            .setSize(w, h * 0.7);
        this.descriptionContainer
            .setPosition(0, h * 0.7)
            .setSize(w, h * 0.1);
        this.buttonContainer
            .setPosition(0, h * 0.8)
            .setSize(w, this.buttonContainer.height);

        this.recalculateGridElements();
        this.recalculateButtons();

        return this;
    };

    GridDialog.prototype.setColumns = function(columns) {
        this.columns = columns;
        this.recalculateGridElements();

        return this;
    };

    GridDialog.prototype.recalculateGridElements = function() {
        // recalculate grid elements
        var size = this.width / this.columns;
        this.elementSize = size;
        this.gridContainer.children.forEach(function(child) {
            child.setSize(size, size);
        });
        this.gridContainer._applyLayout();
    };

    GridDialog.prototype.recalculateButtons = function() {
        // recalculate buttons
        if (this.buttonContainer.children.length > 0) {
            var width = this.width / this.buttonContainer.children.length;
            var height = this.buttonContainer.children[0].height;
            this.buttonContainer.children.forEach(function(child) {
                child.setSize(width, height);
            });
            this.buttonContainer.setSize(this.width, height);
            this.buttonContainer._applyLayout();
        }
    };

    GridDialog.prototype.clearGrid = function() {
        this.gridContainer.removeChildren();
        this.selectedElement = null;
        this.selectedData = null;
        this.descriptionContainer.removeChildren();
        return this;
    };

    return GridDialog;
});