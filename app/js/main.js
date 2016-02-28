(function() {
  'use strict';

var scene, camera, renderer;
var mesh;
var manager, vrEffect, vrControls;
var cameraDolly;

init();
loadScene();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000033, 1, 100);

  // Create a group around the camera for moving around. If you want to move
  // the camera update the position of the cameraDolly to allow for VR Headsets
  // that track position.
  cameraDolly = new THREE.Group();
  cameraDolly.position.set(0, 15, 50);
  scene.add(cameraDolly);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  cameraDolly.add(camera);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = true;
  renderer.setClearColor(0x000033);

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);

  vrControls = new THREE.VRControls(camera);
  vrEffect = new THREE.VREffect(renderer);
  onWindowResize();

  manager = new WebVRManager(renderer, vrEffect, {
    hideButton: false
  });
}

function loadScene() {
  var loader = new THREE.SEA3D({
    autoPlay : true, // Auto play animations
    container : scene // Container to add models
  });
  loader.onComplete = function() {
    console.log('mascot mesh loaded');

    mesh = loader.getMesh('Mascot');
    mesh.scale.x = 0.005;
    mesh.scale.y = 0.005;
    mesh.scale.z = 0.005;

    mesh.rotation.y = 2;
    mesh.position.x = 50;

    console.log(mesh);

    startRenderLoop();
  };

  loader.load('./models/mascot.tjs.sea');
}

function onWindowResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  vrEffect.setSize(width, height);
}
window.addEventListener('resize', onWindowResize, false);

function startRenderLoop() {
  var oldTimestamp = 0;
  function animate(timestamp) {
    // Calculate time since last frame in seconds
    var timestampDelta = 
      (oldTimestamp !== 0) ? (timestamp - oldTimestamp) / 1000.0 : 0.0;
    oldTimestamp = timestamp;

    // Update Animations
    if (THREE.SEA3D && THREE.SEA3D.AnimationHandler) {
      THREE.SEA3D.AnimationHandler.update(timestampDelta);
    }
    if (THREE.AnimationHandler) {
      THREE.AnimationHandler.update(timestampDelta);
    }

    // Move the turtle
    mesh.position.x -= 1 * timestampDelta;

    // Update camera position with latest input values
    vrControls.update();

    // Render the scene using the WebVR manager
    manager.render(scene, camera, timestamp);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
}());
