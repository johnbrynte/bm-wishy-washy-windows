define([
    'lib/three'
], function(
    THREE
) {

    var Cube = function(image, size, singleFace) {
        THREE.Mesh.call(this);

        var geometry = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
        var uv = {};
        if (singleFace) {
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 2; j++) {
                    uv[i * 10 + j] = new THREE.Vector2(i, j);
                }
            }
            for (var i = 0; i < 12; i += 2) {
                geometry.faceVertexUvs[0][i] = [uv[01], uv[00], uv[11]];
                geometry.faceVertexUvs[0][i + 1] = [uv[00], uv[10], uv[11]];
            }
        } else {
            var step = 1 / 4;
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                    uv[10 * i + j] = new THREE.Vector2(i * step, j * step);
                }
            }
            // left
            geometry.faceVertexUvs[0][0] = [uv[23], uv[22], uv[33]];
            geometry.faceVertexUvs[0][1] = [uv[22], uv[32], uv[33]];
            // right
            geometry.faceVertexUvs[0][2] = [uv[03], uv[02], uv[13]];
            geometry.faceVertexUvs[0][3] = [uv[02], uv[12], uv[13]];
            // top
            geometry.faceVertexUvs[0][4] = [uv[14], uv[13], uv[24]];
            geometry.faceVertexUvs[0][5] = [uv[13], uv[23], uv[24]];
            // bottom
            geometry.faceVertexUvs[0][6] = [uv[12], uv[11], uv[22]];
            geometry.faceVertexUvs[0][7] = [uv[11], uv[21], uv[22]];
            // back
            geometry.faceVertexUvs[0][8] = [uv[13], uv[12], uv[23]];
            geometry.faceVertexUvs[0][9] = [uv[12], uv[22], uv[23]];
            // front
            geometry.faceVertexUvs[0][10] = [uv[33], uv[32], uv[43]];
            geometry.faceVertexUvs[0][11] = [uv[32], uv[42], uv[43]];
        }
        var texture = new THREE.Texture(image);
        texture.magFilter = THREE.NearestFilter;
        var material = new THREE.MeshPhongMaterial({
            map: texture
        });
        material.map.needsUpdate = true;

        this.geometry = geometry;
        this.material = material;

        this.castShadow = false;
        this.receiveShadow = false;
    };

    Cube.prototype = Object.create(THREE.Mesh.prototype);

    return Cube;
});