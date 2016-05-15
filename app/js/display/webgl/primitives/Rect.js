/**
 * A 2-dimensional rectangle with a set color.
 */
define([
    'lib/three'
], function(
    THREE
) {

    var Rect = function(width, height, color, opacity) {
        THREE.Mesh.call(this);

        var geometry = new THREE.PlaneGeometry(1, 1);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, -0.5, 0));
        var material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: opacity ? opacity : 1,
            transparent: true
        });

        this.geometry = geometry;
        this.material = material;

        this.setSize(width, height);
    };

    Rect.prototype = Object.create(THREE.Mesh.prototype);

    Rect.prototype.setSize = function(width, height) {
        this.scale.set(width, height, 1);
        return this;
    };

    Rect.prototype.setColor = function(color) {
        this.material.color.setHex(color);
        return this;
    };

    Rect.prototype.setOpacity = function(opacity) {
        this.material.opacity = opacity;
        return this;
    };

    return Rect;

});