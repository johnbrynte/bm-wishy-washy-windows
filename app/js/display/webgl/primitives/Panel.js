/**
 * A 2-dimensional panel.
 */
define([
    'lib/three'
], function(
    THREE
) {

    var Panel = function(AssMan, image, width, height, borderWidth, borderHeight) {
        THREE.Mesh.call(this);

        var geometry = new THREE.PlaneGeometry(1, 1);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, -0.5, 0));
        var texture = new THREE.Texture(image);
        texture.magFilter = THREE.NearestFilter;
        var material = new THREE.ShaderMaterial({
            uniforms: {
                sampler: {
                    type: 't',
                    value: texture
                },
                size: {
                    type: 'v2',
                    value: new THREE.Vector2(width, height)
                },
                imageSize: {
                    type: 'v4',
                    value: new THREE.Vector4(image.width, image.height, borderWidth ? borderWidth : 0, borderHeight ? borderHeight : 0)
                }
            },
            vertexShader: AssMan.shaders.v_panel,
            fragmentShader: AssMan.shaders.f_panel,
            transparent: true
        });
        texture.needsUpdate = true;

        this.geometry = geometry;
        this.material = material;

        this.setSize(width, height);
    };

    Panel.prototype = Object.create(THREE.Mesh.prototype);

    Panel.prototype.setSize = function(width, height) {
        this.scale.set(width, height, 1);
        this.material.uniforms.size.value.x = width;
        this.material.uniforms.size.value.y = height;
    };

    Panel.prototype.setImage = function(image, borderWidth, borderHeight) {
        this.material.uniforms.sampler.value.image = image;
        this.material.uniforms.imageSize.value.x = image.width;
        this.material.uniforms.imageSize.value.y = image.height;
        if (typeof borderWidth != 'undefined') {
            this.material.uniforms.imageSize.value.z = borderWidth;
        }
        if (typeof borderheight != 'undefined') {
            this.material.uniforms.imageSize.value.w = borderheight;
        }
        this.material.needsUpdate = true;
    }

    return Panel;

});