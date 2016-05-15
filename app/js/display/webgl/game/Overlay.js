define([
    'lib/three',
    'display/AssetManager'
], function(
    THREE,
    AssMan
) {
    /**
     * Wrapper for overlays
     * @param {[type]} camera [description]
     * @param {[type]} scene  [description]
     * @param {[type]} near Distance from camera near plane
     */
    var Overlay = function(camera, scene, near) {
        this.camera = camera;
        this.scene = scene;
        this.overlays = {};
        this.count = 0;
        this.nextIndex = 0;
        this.near = near;
    };

    /**
     * Recalculate the position and scale of an overlay
     * @param  {[type]} overlay [description]
     * @return {[type]}         [description]
     */
    Overlay.prototype.recalculate = function(overlay) {
        var t, dx, dy;
        // calculate overlay scaling
        t = Math.tan((this.camera.fov / 2) * Math.PI / 180);
        dx = 2 * overlay.near * this.camera.aspect * t / AssMan.width;
        dy = 2 * overlay.near * t / AssMan.height;
        // scale the pane and position it correctly
        overlay.source.scale.set(dx, dy, 1);
        overlay.source.position.set(dx * overlay.x, -dy * overlay.y, 0);
    };

    /**
     * Add a new overlay
     * @param {[type]} source [description]
     * @param {[type]} x      [description]
     * @param {[type]} y      [description]
     * @param {[type]} width  [description]
     * @param {[type]} height [description]
     */
    Overlay.prototype.add = function(source, x, y, width, height) {
        var d, overlay, index;

        overlay = {
            overlay: new THREE.Object3D(),
            source: source,
            x: x,
            y: y,
            width: width,
            height: height,
            near: 0
        };
        index = this.nextIndex;
        this.overlays[index] = overlay;
        this.nextIndex++;
        this.count++;

        // recalculate overlay positions
        d = this.near / this.count;
        for (var i = 0; i < this.count; i++) {
            overlay.near = this.camera.near + this.near - d * i;
            this.recalculate(overlay);
        }

        overlay.overlay.add(source);
        this.scene.add(overlay.overlay);

        this.update();

        return index;
    };

    /**
     * Remove an overlay
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    Overlay.prototype.remove = function(index) {
        if (index in this.overlays) {
            this.scene.remove(this.overlays[index].overlay);
            delete this.overlays[index];
            this.count--;
        }
    };

    /**
     * Update all overlays relative to the camera
     * @return {[type]} [description]
     */
    Overlay.prototype.update = function() {
        var v, overlay;
        for (var i in this.overlays) {
            overlay = this.overlays[i];
            v = THREE.Utils.cameraLookDir(this.camera);
            v.multiplyScalar(overlay.near);
            v.add(this.camera.position);
            overlay.overlay.rotation.copy(this.camera.rotation);
            overlay.overlay.position.copy(v);
            if (overlay.source.update) {
                overlay.source.update();
            }
        }
    };

    return Overlay;
});