var scene, camera, renderer, loader;
var geometry, material, mesh, animation;


function init() {

    var data = {
        models: {
            //goblin: 'assets/goblin.json',
            human: 'assets/human_fas4d.js',
            goblin: 'assets/goblin_fas4.js'
        },
        modelTextures: {
            goblin: 'assets/goblin.png',
            human: 'assets/human.png'
        }

    };

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 1.5;
    camera.position.z = 5;

    loader = new THREE.JSONLoader();
    loader.load("assets/human_fas4d.js", function(geometry, materials) {


        console.dir(materials);
        //material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        material = new THREE.MeshFaceMaterial(materials);
        material.skinning = true;

        mesh = new THREE.SkinnedMesh(geometry, material, false);


        animation = new THREE.Animation(mesh, geometry.animations[0]);
        animation.play();
        animation.update(0);

        scene.add(mesh);

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

}

function animate() {

    requestAnimationFrame(animate);

    if (mesh) {

        mesh.rotation.y += 0.02;

    }

    THREE.AnimationHandler.update(0.1);

    renderer.render(scene, camera);

}

document.addEventListener('DOMContentLoaded', function() {
    init();
    animate();


});