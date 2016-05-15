define([
    'lib/three'
], function(
    THREE
) {

    var MeshCube = function(image, size) {
        THREE.Mesh.call(this);

        var geometry = new THREE.CubeGeometry(size, size, size);

        var images = [];
        for (var i = 0; i < 6; i++) {
            images.push(image);
        }

        var texture = new THREE.CubeTexture(images);

        var material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0xffffff,
            ambient: 0xffffff,
            side: THREE.DoubleSide
        });

        geometry.doubleSided = true;
        geometry.receiveShadow = true;

        this.geometry = geometry;
        this.material = material;

        this.overdraw = true;
    };

    MeshCube.prototype = Object.create(THREE.Mesh.prototype);

    return MeshCube;
});