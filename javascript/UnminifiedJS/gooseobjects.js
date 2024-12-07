import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm'

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const canvas = document.querySelector('canvas');
    const overlayElements = document.querySelectorAll('.gooselogo img, header, .navWrapper a, .navWrapper nav, iframe, a, li');
  
    if (canvas) {
        let isDragging = false;
  
        function setPointerEvents(state) {
            overlayElements.forEach((element) => {
                element.style.pointerEvents = state ? 'auto' : 'none';  // Temporarily turns off pointer events on other elements while dragging
            });
        }
  
        canvas.addEventListener('mousedown', (event) => {
            isDragging = true;   // Once the user clicks inside the canvas, consider it as dragging state
            setPointerEvents(false);  // Disables clicking on other elements while the user is interacting with objects
        });
  
        canvas.addEventListener('mouseup', (event) => {
            isDragging = false;  // When the mouse is released, dragging stops
            setPointerEvents(true);  // Re-enables interactions with other elements
        });
  
        canvas.addEventListener('mousemove', (event) => {
            if (isDragging) {
              // If needed, you could handle stuff here while dragging the mouse, but currently unused
            }
        });
    } else {
        console.error("WHERE THE CANVAS AT BRO"); // Just a fun console error if the canvas isn't found
    }
  }, 1);

  document.querySelector('.home-button').addEventListener('click', () => {
    const homeSection = document.querySelector('#topoftheworld');
    homeSection.scrollIntoView({ behavior: 'smooth' });  // Smoothly scrolls back to the top section if that button is clicked
  });
});

// ---------------------------------------------------------------------------------
// Below we set up the 3D environment, including the THREE.js scene and the physics world via Cannon-es.js

const scene = new THREE.Scene(); // This is the main 3D scene
const world = new CANNON.World(); // This sets up the physics environment
world.gravity.set(0, 0, 0);  // Gravity is turned off so objects don't fall down

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 60; // The camera is placed a bit away so we can see the objects

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement); // This attaches the 3D canvas to the page

// Calculate some measurements to know how large the visible area is
const aspect = window.innerWidth / window.innerHeight;
const fov = camera.fov;
const frustumHeight = 2 * Math.tan((fov * Math.PI) / 180 / 2) * camera.position.z;
const frustumWidth = frustumHeight * aspect;

// Create invisible "walls" on the edges of the view so objects don't wander off screen
const wallThickness = 1;

const leftWall = new CANNON.Body({
  mass: 0,   // mass=0 means it's static, it won't move
  shape: new CANNON.Box(new CANNON.Vec3(wallThickness, frustumHeight / 2, 100))
});
leftWall.position.set(-frustumWidth / 2 - wallThickness, 0, 0);
world.addBody(leftWall);

const rightWall = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(wallThickness, frustumHeight / 2, 100))
});
rightWall.position.set(frustumWidth / 2 + wallThickness, 0, 0);
world.addBody(rightWall);

const topWall = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, wallThickness, 100))
});
topWall.position.set(0, frustumHeight / 2 + wallThickness, 0);
world.addBody(topWall);

const bottomWall = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, wallThickness, 100))
});
bottomWall.position.set(0, -frustumHeight / 2 - wallThickness, 0);
world.addBody(bottomWall);


// Handles window resizing so the 3D scene always fits the screen
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumHeight = 2 * Math.tan((fov * Math.PI) / 180 / 2) * camera.position.z;
  const frustumWidth = frustumHeight * aspect;

  // Reposition the walls accordingly when the window size changes
  leftWall.position.set(-frustumWidth / 2 - wallThickness, 0, 0);
  rightWall.position.set(frustumWidth / 2 + wallThickness, 0, 0);
  topWall.position.set(0, frustumHeight / 2 + wallThickness, 0);
  bottomWall.position.set(0, -frustumHeight / 2 - wallThickness, 0);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  onWindowResize();
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Adds some light so we can see the objects properly
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

// Raycaster and mouse handle interactions, like clicking and dragging objects
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
const mouse = new THREE.Vector2();

// These are the objects that should be loaded into the scene
const modelFilenames = [
  'public/conecprsd.glb',
  'public/gameboycprsd.glb',
  'public/glassescprsd.glb',
  'public/hatcprsd.glb',
  'public/maccprsd.glb',
  'public/malletcprsd.glb',
  'public/paintbrushcprsd.glb',
  'public/pipecprsd.glb',
  'public/potcprsd.glb',
  'public/vasecprsd.glb',
  'public/vhscprsd.glb',
];

const models = [];
let savedModelPositions = {};

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

// This loads saved positions for the loaded models if they exist, or just give them random spots
fetch('javascript/modelPositions.json')
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to load model positions.');
  })
  .then((data) => {
    savedModelPositions = data;
    loadModels(); // Loads the models into the scene now that we have their positions
  })
  .catch((error) => {
    console.error('Error loading saved model positions:', error);
    loadModels(); // If loading fails, this still loads the models but with default random positions
  });

function loadModels() {
  modelFilenames.forEach((filename) => {
    loader.load(
      filename,
      function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        models.push(model);

        // This part sets up a physics body for each model so they can interact and be pushed around
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);

        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        const body = new CANNON.Body({
          mass: 1,
          linearDamping: 0.5,
          angularDamping: 0.5,
          position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
          shape: shape,
        });
        
        // This ensures objects only move around in a flat plane and rotate in one axis
        body.linearFactor.set(1, 1, 0);
        body.angularFactor.set(0, 0, 1);

        world.addBody(body);
        model.body = body;

        // If there's saved positions, place the models there; otherwise give them a random spot
        if (savedModelPositions[filename]) {
          const pos = savedModelPositions[filename].position;
          model.position.set(pos.x, pos.y, pos.z);
          model.body.position.set(pos.x, pos.y, pos.z);
        } else {
          model.position.set(Math.random() * 8 - 5, Math.random() * 4, 0);
          model.body.position.set(model.position.x, model.position.y, 0);
        }

        // Give each model a random rotation so they don't all look the same
        const randomX = Math.random() * Math.PI * 2;
        const randomY = Math.random() * Math.PI * 2;
        const randomZ = Math.random() * Math.PI * 2;
        model.rotation.set(randomX, randomY, randomZ);
        model.body.quaternion.setFromEuler(randomX, randomY, randomZ);
      },
      undefined,
      function (error) {
        console.error(`Error loading ${filename}:`, error);
      }
    );
  });
}

// Variables for handling mouse interactions, like clicking and dragging an object
let isDragging = false;
let selectedModel = null;
let dragPlane = new THREE.Plane();
let intersection = new THREE.Vector3();
let localClickPoint = new THREE.Vector3();
let modelWorldPosition = new THREE.Vector3();
let modelWorldQuaternion = new THREE.Quaternion();

// This adds event listeners to handle when the user clicks and drags on the objects
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);

function onMouseDown(event) {
  if (event.button === 0) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {
      // If we hit an object, we start the dragging process
      isDragging = true;
      intersection.copy(intersects[0].point);
      selectedModel = intersects[0].object;
      while (!models.includes(selectedModel)) {
        selectedModel = selectedModel.parent;  // Ensure it gets the root model if we clicked a nested part
      }

      selectedModel.body.type = CANNON.Body.KINEMATIC; // Switch to kinematic so the user can freely move it without physics messing it up
      selectedModel.body.updateMassProperties();
      selectedModel.worldToLocal(localClickPoint.copy(intersection));

      camera.getWorldDirection(dragPlane.normal);
      dragPlane.normal.negate();
      dragPlane.setFromNormalAndCoplanarPoint(dragPlane.normal, intersection);

      renderer.domElement.style.cursor = 'grabbing'; // Cursor changes to show dragging state
    }
  }
}

function onMouseUp(event) {
  if (event.button === 0 && selectedModel) {
    // When the user lets go of the mouse, let the model be dynamic again so it can interact with physics naturally
    isDragging = false;
    selectedModel.body.type = CANNON.Body.DYNAMIC;
    selectedModel.body.updateMassProperties();
    selectedModel = null;
    renderer.domElement.style.cursor = 'auto';
  }
}

function onMouseMove(event) {
  if (isDragging && selectedModel) {
    // While dragging, check where the mouse is and reposition/rotate the selected model accordingly
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      selectedModel.getWorldPosition(modelWorldPosition);
      selectedModel.getWorldQuaternion(modelWorldQuaternion);

      const clickedPointWorld = localClickPoint.clone().applyMatrix4(selectedModel.matrixWorld);
      const currentDir = clickedPointWorld.clone().sub(modelWorldPosition).normalize();
      const targetDir = intersection.clone().sub(modelWorldPosition).normalize();

      const rotationQuat = new THREE.Quaternion().setFromUnitVectors(
        currentDir,
        targetDir
      );
      selectedModel.quaternion.premultiply(rotationQuat);
      selectedModel.updateMatrixWorld(true);

      const newClickedPointWorld = localClickPoint.clone().applyMatrix4(selectedModel.matrixWorld);
      const offset = intersection.clone().sub(newClickedPointWorld);
      selectedModel.position.add(offset);
      selectedModel.updateMatrixWorld(true);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60); // Updates the physics world at 60 FPS

  models.forEach((model) => {
    if (model.body) {
      if (isDragging && selectedModel === model) {
        // If the person is dragging, the physics body follows the model's position directly
        model.body.position.copy(model.position);
        model.body.quaternion.copy(model.quaternion);
        model.body.velocity.set(0, 0, 0);
        model.body.angularVelocity.set(0, 0, 0);
      } else {
        // Otherwise, the model follows wherever the physics body moved due to collisions and interactions
        model.position.copy(model.body.position);
        model.quaternion.copy(model.body.quaternion);
      }
    }
  });

  renderer.render(scene, camera);  // Finally, render the scene so we can see the updated objects
}

animate(); // Starts the animation loop that keeps everything updated and visible
