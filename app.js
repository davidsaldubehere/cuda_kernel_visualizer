// CUDA Kernel dimensions
var sceneType = "grid";
// Cube parameters
var cubeSize = 0.8;
var blockMargin = 1; // Margin between blocks
// Camera parameters
const cameraDistance = 20;
const rotateSpeed = 0.05;
let blockRotation = { x: 0, y: 0, z: 0 };

// Three.js initialization
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const blockGroup = new THREE.Group();
scene.add(blockGroup);
function setScene() {
  // Create a group to contain all cubes
  document.getElementById("threadTotal").textContent =
    "Thread total = " +
    parseInt(document.getElementById("threadsInBlockx").value) *
      parseInt(document.getElementById("threadsInBlocky").value) *
      parseInt(document.getElementById("threadsInBlockz").value) *
      parseInt(document.getElementById("blocksInGridx").value) *
      parseInt(document.getElementById("blocksInGridy").value) *
      parseInt(document.getElementById("blocksInGridz").value);

  // Get the number of blocks in each dimension

  const numBlocks = {
    x: parseInt(document.getElementById("blocksInGridx").value),
    y: parseInt(document.getElementById("blocksInGridy").value),
    z: parseInt(document.getElementById("blocksInGridz").value),
  };
  const numThreads = {
    x: parseInt(document.getElementById("threadsInBlockx").value),
    y: parseInt(document.getElementById("threadsInBlocky").value),
    z: parseInt(document.getElementById("threadsInBlockz").value),
  };

  // Create cubes representing blocks and add them to the group
  if (sceneType === "grid") {
    cubeSize = 0.8;
    blockMargin = 1; // Margin between blocks

    const blockMap = {};
    for (let i = 0; i < numBlocks.x; i++) {
      for (let j = 0; j < numBlocks.y; j++) {
        for (let k = 0; k < numBlocks.z; k++) {
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            opacity: 1,
          });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(
            i * (cubeSize + blockMargin),
            j * (cubeSize + blockMargin),
            k * (cubeSize + blockMargin)
          );
          blockGroup.add(cube);
          blockMap[`${i}-${j}-${k}`] = cube;
        }
      }
    }
  } else {
    cubeSize = 0.5;
    blockMargin = 0.6; // Margin between blocks

    // Only render the threads in one block as triangles
    const threadMap = {};
    for (let i = 0; i < numThreads.x; i++) {
      for (let j = 0; j < numThreads.y; j++) {
        for (let k = 0; k < numThreads.z; k++) {
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const material = new THREE.MeshBasicMaterial({
            color: 0x00d5ff,
            wireframe: true,
            opacity: 1,
          });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(
            i * (cubeSize + blockMargin),
            j * (cubeSize + blockMargin),
            k * (cubeSize + blockMargin)
          );
          blockGroup.add(cube);
          threadMap[`${i}-${j}-${k}`] = cube;
        }
      }
    }
    // Add a green block that encloses all of the thread cubes
    const enclosingGeometry = new THREE.BoxGeometry(
      numThreads.x * cubeSize + (numThreads.x - 1) * blockMargin + 1,
      numThreads.y * cubeSize + (numThreads.y - 1) * blockMargin + 1,
      numThreads.z * cubeSize + (numThreads.z - 1) * blockMargin + 1
    );
    const enclosingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      opacity: 1,
    });
    const enclosingCube = new THREE.Mesh(enclosingGeometry, enclosingMaterial);
    enclosingCube.position.set(
      ((numThreads.x - 1) * (cubeSize + blockMargin)) / 2,
      ((numThreads.y - 1) * (cubeSize + blockMargin)) / 2,
      ((numThreads.z - 1) * (cubeSize + blockMargin)) / 2
    );
    blockGroup.add(enclosingCube);
  }
  camera.position.z = cameraDistance;

  const axisIndicators = new THREE.AxesHelper(2);
  scene.add(axisIndicators);
  blockGroup.add(axisIndicators);
}

// Position camera

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hoveredBlock = new THREE.Vector3();

// Main render loop
function animate() {
  requestAnimationFrame(animate);
  rotateBlocks();
  renderer.render(scene, camera);
}
setScene();
animate();

// Handle arrow key events for rotation
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      blockRotation.y += rotateSpeed;
      break;
    case "ArrowRight":
      blockRotation.y -= rotateSpeed;
      break;
    case "ArrowUp":
      blockRotation.x += rotateSpeed;
      break;
    case "ArrowDown":
      blockRotation.x -= rotateSpeed;
      break;
    default:
      return;
  }
});
document.addEventListener("keyup", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      blockRotation.y = 0;
      break;
    case "ArrowRight":
      blockRotation.y = 0;
      break;
    case "ArrowUp":
      blockRotation.x = 0;
      break;
    case "ArrowDown":
      blockRotation.x = 0;
      break;
    default:
      return;
  }
});

// Rotate the block group
function rotateBlocks() {
  blockGroup.rotation.x += blockRotation.x;
  blockGroup.rotation.y += blockRotation.y;
  blockGroup.rotation.z += blockRotation.z;
}

// Event listener for mouse move
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
  // Calculate normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast from camera
  raycaster.setFromCamera(mouse, camera);

  // Intersect blocks
  const intersects = raycaster.intersectObjects(blockGroup.children);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const position = intersect.object.position;
    const blockIndex = `${Math.floor(
      position.x / (cubeSize + blockMargin)
    )}-${Math.floor(position.y / (cubeSize + blockMargin))}-${Math.floor(
      position.z / (cubeSize + blockMargin)
    )}`;
    console.log("Block index:", blockIndex);
    // You can display the block index however you want, for example:
    document.getElementById(
      "blockIndex"
    ).textContent = `Block index: ${blockIndex}`;
  } else {
    // No intersection
    document.getElementById("blockIndex").textContent = "";
  }
}

document.addEventListener("click", function (event) {
  //get the cube that was clicked
  const intersects = raycaster.intersectObjects(blockGroup.children);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    //remove all other blocks
    blockGroup.children.forEach((block) => {
      if (block !== intersect.object) {
        block.visible = !block.visible;
      }
    });
  }
});

function rerender() {
  console.log("rerendering");
  //clear the scene
  const n = blockGroup.children.length - 1;
  for (var i = n; i > -1; i--) {
    blockGroup.remove(blockGroup.children[i]);
  }
  setScene();
  //reset the scene
}
function toggleScene(type) {
  if (type === "grid") {
    sceneType = "grid";
    document.getElementById("viewType").textContent = "Grid View";
    document.getElementById("switchGrid").disabled = true;
    document.getElementById("switchBlock").disabled = false;
  } else {
    sceneType = "block";
    document.getElementById("viewType").textContent = "Block View";
    document.getElementById("switchGrid").disabled = false;
    document.getElementById("switchBlock").disabled = true;
  }
  rerender();
}
