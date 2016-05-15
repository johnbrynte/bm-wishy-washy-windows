/**
 * A 2-dimensional sprite.
 */
define([
    'lib/three'
], function(
    THREE
) {

    var Text = function(string, font) {
        THREE.Mesh.call(this);

        this._rightSideBearing = 0;

        this.font = font;
        this.material = this.font.material.clone();
        this.material.uniforms.sampler.value.needsUpdate = true;
        this.fontColor = this.material.uniforms.color.value;
        this._setText(string);
    };

    Text.prototype = Object.create(THREE.Mesh.prototype);

    Text.prototype._setText = function(string) {
        var x, y, advanceWidth, data, verts, faces, uvs, vOffset, uvOffset, geometry, material, texture;

        geometry = new THREE.Geometry();

        if (string != undefined && string.length != 0) {
            verts = geometry.vertices;
            faces = geometry.faces;
            uvs = geometry.faceVertexUvs[0];
            vOffset = 0;
            uvOffset = 0;
            advanceWidth = 0;

            for (var i = 0; i < string.length; i++) {
                data = this.font.data.characters[string[i]];
                if (!data) {
                    advanceWidth += 40;
                    continue;
                }
                x = advanceWidth - data.leftSideBearing + data.xMin;
                y = -this.font.data.height;

                verts.push(new THREE.Vector3(x, y, 0));
                verts.push(new THREE.Vector3(x + this.font.data.width, y, 0));
                verts.push(new THREE.Vector3(x + this.font.data.width, y + this.font.data.height, 0));
                verts.push(new THREE.Vector3(x, y + this.font.data.height, 0));

                faces.push(new THREE.Face3(vOffset, vOffset + 1, vOffset + 2));
                faces.push(new THREE.Face3(vOffset, vOffset + 2, vOffset + 3));

                uvs.push([
                    new THREE.Vector2(data.uv[0][0], data.uv[0][1]),
                    new THREE.Vector2(data.uv[1][0], data.uv[1][1]),
                    new THREE.Vector2(data.uv[2][0], data.uv[2][1]),
                ]);
                uvs.push([
                    new THREE.Vector2(data.uv[0][0], data.uv[0][1]),
                    new THREE.Vector2(data.uv[2][0], data.uv[2][1]),
                    new THREE.Vector2(data.uv[3][0], data.uv[3][1]),
                ]);

                this._rightSideBearing = this.font.data.width - (data.advanceWidth + 3 + data.xMin);
                advanceWidth += data.advanceWidth + 3;

                if (data.kerning !== null && i + 1 < string.length &&
                    data.kerning[string[i + 1]] !== undefined) {
                    advanceWidth += data.kerning[string[i + 1]];
                }

                vOffset += 4;
                uvOffset += 6;
            }
        }

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        this.geometry = geometry;
    };

    Text.prototype.setTextSize = function(size) {
        var scale = size / this.font.data.height;
        this.scale.set(scale, scale, 1);
        return this;
    };

    Text.prototype.setTextColor = function(color) {
        var r = (color >> 16) / 0xff;
        var g = ((color >> 8) & 0xff) / 0xff;
        var b = (color & 0xff) / 0xff;
        this.fontColor.set(r, g, b);
        return this;
    };

    Text.prototype.getTextWidth = function() {
        var boundingBox = this.geometry.boundingBox;
        return this.scale.x * (boundingBox.max.x - boundingBox.min.x - this._rightSideBearing);
    };

    Text.prototype.getTextHeight = function() {
        var boundingBox = this.geometry.boundingBox;
        return this.scale.y * (boundingBox.max.y - boundingBox.min.y);
    };

    return Text;

});