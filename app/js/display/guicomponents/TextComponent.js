/**
 *  TextComponent.js
 */
define([
    './GUIComponent',
    'display/AssetManager'
], function(
    GUIComponent,
    AssetManager
) {

    var TextComponent = function(string) {
        GUIComponent.call(this);

        this.textColor = 0xffffff;
        this.textSize = 40;
        this.setText(string);
    };

    TextComponent.prototype = Object.create(GUIComponent.prototype);

    TextComponent.prototype.setText = function(string) {
        this.setDisplay(AssetManager.Text(string)
            .setTextSize(this.textSize)
            .setTextColor(this.textColor)
        ).setSize(this.display.getTextWidth(), this.display.getTextHeight());

        return this;
    };

    TextComponent.prototype.setTextSize = function(textSize) {
        this.textSize = textSize;
        this.display.setTextSize(textSize);
        this.setSize(this.display.getTextWidth(), this.display.getTextHeight());

        return this;
    }

    TextComponent.prototype.setTextColor = function(color) {
        this.textColor = color;
        this.display.setTextColor(color);

        return this;
    };

    return TextComponent;
});