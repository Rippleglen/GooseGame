import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
import {DRACOLoader} from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm'

const scene = new THREE.Scene();

// Create the physics world
const world = new CANNON.World();
world.gravity.set(0, 0, 0);  // No gravity as we're simulating a free 2D movement

const camera = new THREE.PerspectiveCamera(
  45, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
camera.position.z = 60;
// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild(renderer.domElement);


// Get the aspect ratio and frustum height
const aspect = window.innerWidth / window.innerHeight;
const fov = camera.fov;
const frustumHeight = 2 * Math.tan((fov * Math.PI) / 180 / 2) * camera.position.z;
const frustumWidth = frustumHeight * aspect;

// Create left and right bounding box walls
const wallThickness = 1;  // Thickness of the wall

const leftWall = new CANNON.Body({
  mass: 0,  // Static, no mass
  shape: new CANNON.Box(new CANNON.Vec3(wallThickness, frustumHeight / 2, 100)),  // Tall wall
});
leftWall.position.set(-frustumWidth / 2 - wallThickness, 0, 0);  // Left edge
world.addBody(leftWall);

const rightWall = new CANNON.Body({
  mass: 0,  // Static, no mass
  shape: new CANNON.Box(new CANNON.Vec3(wallThickness, frustumHeight / 2, 100)),  // Tall wall
});
rightWall.position.set(frustumWidth / 2 + wallThickness, 0, 0);  // Right edge
world.addBody(rightWall);

// Create top and bottom bounding box walls
const topWall = new CANNON.Body({
  mass: 0,  // Static, no mass
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, wallThickness, 100)),  // Wide wall
});
topWall.position.set(0, frustumHeight / 2 + wallThickness, 0);  // Top edge
world.addBody(topWall);

const bottomWall = new CANNON.Body({
  mass: 0,  // Static, no mass
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, wallThickness, 100)),  // Wide wall
});
bottomWall.position.set(0, -frustumHeight / 2 - wallThickness, 0);  // Bottom edge
world.addBody(bottomWall);

// Front wall (closer to the camera)
const frontWall = new CANNON.Body({
  mass: 0,  // Static wall
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, frustumHeight / 2, wallThickness)),
});
frontWall.position.set(0, 0, 3.8);  // Place the wall close to the camera
world.addBody(frontWall);

// Back wall (further away from the camera)
const backWall = new CANNON.Body({
  mass: 0,  // Static wall
  shape: new CANNON.Box(new CANNON.Vec3(frustumWidth / 2, frustumHeight / 2, wallThickness)),
});
backWall.position.set(0, 0, -3.8);  // Place the wall far behind the objects
world.addBody(backWall);



window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumHeight = 2 * Math.tan((fov * Math.PI) / 180 / 2) * camera.position.z;
  const frustumWidth = frustumHeight * aspect;

  // Update the positions of the walls
  leftWall.position.set(-frustumWidth / 2 - wallThickness, 0, 0);
  rightWall.position.set(frustumWidth / 2 + wallThickness, 0, 0);
  topWall.position.set(0, frustumHeight / 2 + wallThickness, 0);
  bottomWall.position.set(0, -frustumHeight / 2 - wallThickness, 0);
  frontWall.position.set(0, 0, 5);
  backWall.position.set(0, 0, -4.3);

  // Also resize the renderer
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

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

// Raycaster and mouse vector for interaction
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1; // Adjust threshold as needed
const mouse = new THREE.Vector2();

// Array of model filenames
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

// Array to store loaded models
const models = [];

// Object to store saved positions
let savedModelPositions = {};

// Check if saved positions exist in localStorage

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.4.1/' );
loader.setDRACOLoader( dracoLoader );

// Load saved positions from JSON file

fetch('javascript/modelPositions.json')
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to load model positions.');
  })
  .then((data) => {
    savedModelPositions = data; // Store the loaded positions

    // Load models after positions are fetched
    modelFilenames.forEach((filename, index) => {
      loader.load(
        filename,
        function (gltf) {
          const model = gltf.scene;
          scene.add(model);
          models.push(model);

          // Create a bounding box for the model
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);

          // Create a physics body for the model
          const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
          const body = new CANNON.Body({
            mass: 1, // Adjust mass for how heavy the object should feel
            linearDamping: 0.99, // Damping to prevent objects from moving indefinitely
            angularDamping: 0.99, // Damping to smooth out rotation
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
            shape: shape,
          });

          world.addBody(body);
          model.body = body;

          // Set position
          if (savedModelPositions[filename]) {
            const pos = savedModelPositions[filename].position;
            model.position.set(pos.x, pos.y, pos.z);
            model.body.position.set(pos.x, pos.y, pos.z);
          } else {
            model.position.set(Math.random() * 8 - 5, Math.random() * 4, 0); // Ensure z=0
            model.body.position.set(model.position.x, model.position.y, 0);
          }

          // Set random rotation
          const randomX = Math.random() * Math.PI * 2; // Random rotation around x-axis
          const randomY = Math.random() * Math.PI * 2; // Random rotation around y-axis
          const randomZ = Math.random() * Math.PI * 2; // Random rotation around z-axis
          model.rotation.set(randomX, randomY, randomZ);

          // Sync physics body rotation with the model
          model.body.quaternion.setFromEuler(randomX, randomY, randomZ);
        },
        undefined,
        function (error) {
          console.error(`An error occurred while loading ${filename}:`, error);
        }
      );
    });
  })
  .catch((error) => {
    console.error('Error loading saved model positions:', error);

    // If positions fail to load, still load models with default random positioning and rotation
    modelFilenames.forEach((filename, index) => {
      loader.load(
        filename,
        function (gltf) {
          const model = gltf.scene;
          scene.add(model);
          models.push(model);

          // Create a bounding box for the model
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);

          // Create a physics body for the model
          const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
          const body = new CANNON.Body({
            mass: 1,
            linearDamping: 0.99,
            angularDamping: 0.99,
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
            shape: shape,
          });

          world.addBody(body);
          model.body = body;

          // Default random positioning
          model.position.set(Math.random() * 8 - 5, Math.random() * 4, 0); // Ensure z=0
          model.body.position.set(model.position.x, model.position.y, 0);

          // Set random rotation
          const randomX = Math.random() * Math.PI * 2;
          const randomY = Math.random() * Math.PI * 2;
          const randomZ = Math.random() * Math.PI * 2;
          model.rotation.set(randomX, randomY, randomZ);

          // Sync physics body rotation with the model
          model.body.quaternion.setFromEuler(randomX, randomY, randomZ);
        },
        undefined,
        function (error) {
          console.error(`An error occurred while loading ${filename}:`, error);
        }
      );
    });
  });





// Variables for interaction
let isDragging = false;
let selectedModel = null;
let dragPlane = new THREE.Plane();
let intersection = new THREE.Vector3();
let localClickPoint = new THREE.Vector3();
let modelWorldPosition = new THREE.Vector3();
let modelWorldQuaternion = new THREE.Quaternion();

// Event listeners for mouse actions
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);

function onMouseDown(event) {
  if (event.button === 0) {
    // Update mouse position
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Raycast to find intersected models
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {
      isDragging = true;

      // The point where the user clicked on the model
      intersection.copy(intersects[0].point);

      // The model that was clicked
      selectedModel = intersects[0].object;

      // Traverse up to the parent model if necessary
      while (!models.includes(selectedModel)) {
        selectedModel = selectedModel.parent;
      }

      // Set the selected model's body to kinematic so it can push objects without being affected by them
      selectedModel.body.type = CANNON.Body.KINEMATIC;
      selectedModel.body.updateMassProperties();

      // Store the local position of the clicked point in the model's local space
      selectedModel.worldToLocal(localClickPoint.copy(intersection));

      // Create a plane perpendicular to the camera's viewing direction passing through the intersection point
      camera.getWorldDirection(dragPlane.normal);
      dragPlane.normal.negate();
      dragPlane.setFromNormalAndCoplanarPoint(dragPlane.normal, intersection);

      // Change cursor to grabbing hand
      renderer.domElement.style.cursor = 'grabbing';
    }
  }
}


function onMouseUp(event) {
  if (event.button === 0 && selectedModel) {
    isDragging = false;

    // Reset the selected model's body to dynamic to allow physics to act on it again
    selectedModel.body.type = CANNON.Body.DYNAMIC;
    selectedModel.body.updateMassProperties();

    selectedModel = null;

    // Reset cursor
    renderer.domElement.style.cursor = 'auto';
  }
}


// Mouse move event
function onMouseMove(event) {
  if (isDragging && selectedModel) {
    // Normalize mouse coordinates (-1 to +1)
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Find the intersection point with the drag plane
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      // Get the model's world position and quaternion
      selectedModel.getWorldPosition(modelWorldPosition);
      selectedModel.getWorldQuaternion(modelWorldQuaternion);

      // Calculate the vector from the model's position to the local click point in world space
      const clickedPointWorld = localClickPoint
        .clone()
        .applyMatrix4(selectedModel.matrixWorld);
      const currentDir = clickedPointWorld
        .clone()
        .sub(modelWorldPosition)
        .normalize();

      // Calculate the vector from the model's position to the intersection point
      const targetDir = intersection.clone().sub(modelWorldPosition).normalize();

      // Calculate the rotation quaternion needed to rotate currentDir to targetDir
      const rotationQuat = new THREE.Quaternion().setFromUnitVectors(
        currentDir,
        targetDir
      );

      // Apply the rotation to the model
      selectedModel.quaternion.premultiply(rotationQuat);

      // Update the model's matrixWorld after rotation
      selectedModel.updateMatrixWorld(true);

      // Recompute the clicked point in world space after rotation
      const newClickedPointWorld = localClickPoint
        .clone()
        .applyMatrix4(selectedModel.matrixWorld);

      // Compute the offset between the new clicked point and the intersection point
      const offset = intersection.clone().sub(newClickedPointWorld);

      // Update the model's position to keep the clicked point under the cursor
      selectedModel.position.add(offset);

      // Update the model's matrixWorld after position change
      selectedModel.updateMatrixWorld(true);
    }
  }
}

function saveModelPositions() {
  const positions = {};

  // Collect positions and rotations of models
  models.forEach((model, index) => {
    const filename = modelFilenames[index];

    positions[filename] = {
      position: {
        x: model.position.x,
        y: model.position.y,
        z: model.position.z,
      },
      rotation: {
        _x: model.rotation._x,
        _y: model.rotation._y,
        _z: model.rotation._z,
        _order: model.rotation._order,
      },
    };
  });

  // Log the data to the console for debugging
  console.log('Model positions:', JSON.stringify(positions, null, 2));

  // Send the data to the server
  fetch('https://backend.andreasrp.com/save-model-positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(positions),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log('Server response:', data);
    })
    .catch((error) => {
      console.error('Error sending model positions to the server:', error);
    });
}



// Expose the save function to the global scope
window.saveModelPositions = saveModelPositions;



function animate() {
  requestAnimationFrame(animate);

  // Step the physics simulation
  world.step(1 / 60);

  // Sync the Cannon.js bodies with their respective models
  models.forEach((model) => {
    if (model.body) {
      if (isDragging && selectedModel === model) {
        // While dragging, the kinematic body moves with the Three.js model
        model.body.position.copy(model.position);
        model.body.quaternion.copy(model.quaternion);  // Sync rotation

        // Make sure velocity remains zero
        model.body.velocity.set(0, 0, 0);
        model.body.angularVelocity.set(0, 0, 0);
      } else {
        // When not dragging, sync the model with the body
        model.position.copy(model.body.position);
        model.quaternion.copy(model.body.quaternion);
      }
    }
  });

  // Render the scene
  renderer.render(scene, camera);
}

animate();
