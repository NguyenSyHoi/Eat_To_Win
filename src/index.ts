import { CharacterControls, CONTROLLER_BODY_RADIUS } from "./characterControls";
import { KeyDisplay } from "./utils";
import { ColliderSet, RigidBody, World } from "@dimforge/rapier3d";
import * as THREE from "three";
import { AmbientLight, BoxBufferGeometry, MeshPhongMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {Scene3D} from 'enable3d';


// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
let followCam = new THREE.Object3D();
camera.lookAt(scene.position);
followCam.position.copy(camera.position);
scene.add(followCam);
followCam.parent = camera;
camera.position.set(0, 6, 3);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// ORBIT CAMERA CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enablePan = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 20;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent camera below ground
orbitControls.minPolarAngle = Math.PI / 4; // prevent top down view
orbitControls.update();

const dLight = new THREE.DirectionalLight("white", 0.6);
dLight.position.x = 20;
dLight.position.y = 30;
dLight.castShadow = true;
dLight.shadow.mapSize.width = 4096;
dLight.shadow.mapSize.height = 4096;
const d = 35;
dLight.shadow.camera.left = -d;
dLight.shadow.camera.right = d;
dLight.shadow.camera.top = d;
dLight.shadow.camera.bottom = -d;
scene.add(dLight);

const aLight = new THREE.AmbientLight("white", 0.8);
scene.add(aLight);

// ANIMATE
document.body.appendChild(renderer.domElement);

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

function loadTexture(path: string): THREE.Texture {
  const texture = new THREE.TextureLoader().load(path);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = 10;
  texture.repeat.y = 10;
  return texture;
}

// MODEL WITH ANIMATIONS
var characterControls: CharacterControls;

import("@dimforge/rapier3d").then((RAPIER) => {
  function body(
    scene: THREE.Scene,
    world: World,
    bodyType: "dynamic" | "static" | "kinematicPositionBased",
    colliderType: "cube" | "sphere" | "cylinder" | "cone",
    dimension: any,
    translation: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    color: string
  ) {
    // : { rigid: RigidBody; mesh: THREE.Mesh }
    let bodyDesc;

    if (bodyType === 'dynamic') {
      bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    } else if (bodyType === 'kinematicPositionBased') {
      bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
    } else if (bodyType === 'static') {
      bodyDesc = RAPIER.RigidBodyDesc.fixed();
      bodyDesc.setCanSleep(false);
    }

    if (translation) {
      bodyDesc.setTranslation(translation.x, translation.y, translation.z);
    }
    if (rotation) {
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotation.x, rotation.y, rotation.z, 'XYZ')
      );
      bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }

    let rigidBody = world.createRigidBody(bodyDesc);

  //   // let collider;
  //   // if (colliderType === 'cube') {
  //   //   collider = RAPIER.ColliderDesc.cuboid(
  //   //     dimension.hx,
  //   //     dimension.hy,
  //   //     dimension.hz
  //   //   );
  //   // } else if (colliderType === 'sphere') {
  //   //   collider = RAPIER.ColliderDesc.ball(dimension.radius);
  //   // } else if (colliderType === 'cylinder') {
  //   //   collider = RAPIER.ColliderDesc.cylinder(dimension.hh, dimension.radius);
  //   // } else if (colliderType === 'cone') {
  //   //   collider = RAPIER.ColliderDesc.cone(dimension.hh, dimension.radius);
  //   //   // cone center of mass is at bottom
  //   //   collider.centerOfMass = { x: 0, y: 0, z: 0 };
  //   // }
  //   // world.createCollider(collider, rigidBody);

  //   // let bufferGeometry;
  //   // if (colliderType === 'cube') {
  //   //   bufferGeometry = new BoxBufferGeometry(
  //   //     dimension.hx * 2,
  //   //     dimension.hy * 2,
  //   //     dimension.hz * 2
  //   //   );
  //   // } else if (colliderType === 'sphere') {
  //   //   bufferGeometry = new THREE.SphereBufferGeometry(dimension.radius, 32, 32);
  //   // } else if (colliderType === 'cylinder') {
  //   //   bufferGeometry = new THREE.CylinderBufferGeometry(
  //   //     dimension.radius,
  //   //     dimension.radius,
  //   //     dimension.hh * 2,
  //   //     32,
  //   //     32
  //   //   );
  //   // } else if (colliderType === 'cone') {
  //   //   bufferGeometry = new THREE.ConeBufferGeometry(
  //   //     dimension.radius,
  //   //     dimension.hh * 2,
  //   //     32,
  //   //     32
  //   //   );
  //   // }

  //   // const threeMesh = new THREE.Mesh(
  //   //   bufferGeometry,
  //   //   new MeshPhongMaterial({ color: color })
  //   // );
  //   // threeMesh.castShadow = true;
  //   // threeMesh.receiveShadow = true;
  //   // scene.add(threeMesh);

  //   // return { rigid: rigidBody, mesh: threeMesh };
  }

  function generateTerrain(
    nsubdivs: number,
    scale: { x: number; y: number; z: number }
  ) {
    let heights: number[] = [];
    // three plane
    let threeFloor = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(scale.x, scale.z, nsubdivs, nsubdivs),
      new THREE.MeshStandardMaterial({
        map: loadTexture("/textures/grass/Grass_005_BaseColor.jpg"),
        normalMap: loadTexture("/textures/grass/Grass_005_Normal.jpg"),
        aoMap: loadTexture("/textures/grass/Grass_005_AmbientOcclusion.jpg"),
        roughnessMap: loadTexture("/textures/grass/Grass_005_Roughness.jpg"),
        roughness: 0.6,
      })
    );
    threeFloor.rotateX(-Math.PI / 2);
    threeFloor.receiveShadow = true;
    threeFloor.castShadow = true;
    scene.add(threeFloor);

    // add height data to plane
    const vertices = threeFloor.geometry.attributes.position.array;
    const dx = scale.x / nsubdivs;
    const dy = scale.z / nsubdivs;
    // store height data in map column-row map
    const columsRows = new Map();
    for (let i = 0; i < vertices.length; i += 3) {
      // translate into colum / row indices
      let row = Math.floor(Math.abs((vertices as any)[i] + scale.x / 2) / dx);
      let column = Math.floor(
        Math.abs((vertices as any)[i + 1] - scale.z / 2) / dy
      );
      // generate height for this column & row
      const randomHeight = 0;
      (vertices as any)[i + 2] = scale.y * randomHeight;
      // store height
      if (!columsRows.get(column)) {
        columsRows.set(column, new Map());
      }
      columsRows.get(column).set(row, randomHeight);
    }
    threeFloor.geometry.computeVertexNormals();

    // store height data into column-major-order matrix array
    for (let i = 0; i <= nsubdivs; ++i) {
      for (let j = 0; j <= nsubdivs; ++j) {
        heights.push(columsRows.get(j).get(i));
      }
    }

    let groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    let groundBody = world.createRigidBody(groundBodyDesc);
    let groundCollider = RAPIER.ColliderDesc.heightfield(
      nsubdivs,
      nsubdivs,
      new Float32Array(heights),
      scale
    );
    world.createCollider(groundCollider, groundBody);

    //Add Maze
    new GLTFLoader().load("models/map.glb", function (gltf) {
      let maze = gltf.scene;
      maze.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
      });
      maze.position.set(0, 0.2, -15);
      scene.add(maze);

      // RIGID BODY
      let bodyDesc = RAPIER.RigidBodyDesc.fixed();
    let rigidBody = world.createRigidBody(bodyDesc);
    // let groundCollider = RAPIER.ColliderDesc.heightfield(
    //   20,
    //   20,
    //   new Float32Array(20),
    //   scale
    // );
    let collider = RAPIER.ColliderDesc.ball(1).setSensor(false);

    world.createCollider(collider, rigidBody);
    //   let bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    //   let rigidBody = world.createRigidBody(bodyDesc);
    //   let dynamicCollider = RAPIER.ColliderDesc.ball(CONTROLLER_BODY_RADIUS);
    //   world.createCollider(dynamicCollider, rigidBody);
    });
    // threeFloor.add(this.maze);
  }

  // Use the RAPIER module here.
  let gravity = { x: 0.0, y: -100, z: 0.0 };
  let world = new RAPIER.World(gravity);

  // Bodys
  const bodys: { rigid: RigidBody; mesh: THREE.Mesh }[] = [];

  // Create Ground.
  let nsubdivs = 2;
  let scale = new RAPIER.Vector3(40.0, 0.0, 70.0);
  generateTerrain(nsubdivs, scale);

  // const staticB = body(scene, world, 'static', 'cube',
  //     { hx: 10, hy: 0.8, hz: 10 }, { x: scale.x / 2, y: 2.5, z: 0 },
  //     { x: 0, y: 0, z:  0.3 }, 'pink');
  // bodys.push(staticB);

  // const cubeBody = body(scene, world, 'dynamic', 'cube',
  //     { hx: 0.5, hy: 0.5, hz: 0.5 }, { x: 0, y: 15, z: 0 },
  //     { x: 0, y: 0.4, z: 0.7 }, 'orange');
  // bodys.push(cubeBody);

  // const sphereBody = body(scene, world, 'dynamic', 'sphere',
  //     { radius: 0.7 }, { x: 4, y: 15, z: 2 },
  //     { x: 0, y: 1, z: 0 }, 'blue');
  // bodys.push(sphereBody);

  // const sphereBody2 = body(scene, world, 'dynamic', 'sphere',
  //     { radius: 0.7 }, { x: 0, y: 15, z: 0 },
  //     { x: 0, y: 1, z: 0 }, 'red');
  // bodys.push(sphereBody2);

  // const cylinderBody = body(scene, world, 'dynamic', 'cylinder',
  //     { hh: 1.0, radius: 0.7 }, { x: -7, y: 15, z: 8 },
  //     { x: 0, y: 1, z: 0 }, 'green');
  // bodys.push(cylinderBody);

  // const coneBody = body(scene, world, 'dynamic', 'cone',
  //     { hh: 1.0, radius: 1 }, { x: 7, y: 15, z: -8 },
  //     { x: 0, y: 1, z: 0 }, 'purple');
  // bodys.push(coneBody);

  // character controller
  new GLTFLoader().load("models/Soldier.glb", function (gltf) {
    let player = gltf.scene;
    player.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(player);
    player.position.set(0, -2, 0);
    player.position.y -= 2;

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(player);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map();
    gltfAnimations
      .filter((a) => a.name != "TPose")
      .forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a));
      });

    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      -1,
      1,
      1
    );
    let rigidBody = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(CONTROLLER_BODY_RADIUS);
    world.createCollider(dynamicCollider, rigidBody);

    characterControls = new CharacterControls(
      player,
      mixer,
      animationsMap,
      orbitControls,
      camera,
      "Idle",
      new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }),
      rigidBody
    );
  });

  // Cube1
  new GLTFLoader().load("models/cube.glb", function (gltf) {
    const cube1 = gltf.scene;
    cube1.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(cube1);
    cube1.position.set(4, 0.6, -10);
    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.fixed();
    let rigidBody = world.createRigidBody(bodyDesc);
    let fixedCollider = RAPIER.ColliderDesc.cuboid(4,4,4).setSensor(false);
    world.createCollider(fixedCollider, rigidBody);
  });

  //Cube2
  new GLTFLoader().load("models/cube.glb", function (gltf) {
    const cube2 = gltf.scene;
    cube2.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    cube2.position.set(-5, 0.6, -13);
    scene.add(cube2);
    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.fixed();
    let rigidBody = world.createRigidBody(bodyDesc);
    let fixedCollider = RAPIER.ColliderDesc.cuboid(4,4,4);
    world.createCollider(fixedCollider, rigidBody);
  });

  //Cube3
  new GLTFLoader().load("models/cube.glb", function (gltf) {
    const cube3 = gltf.scene;
    cube3.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(cube3);
    cube3.position.set(7, 0.6, -14);
    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.fixed();
    let rigidBody = world.createRigidBody(bodyDesc);
    let fixedCollider = RAPIER.ColliderDesc.cuboid(4,4,4);
    world.createCollider(fixedCollider, rigidBody);
  });

  //Cube4
  new GLTFLoader().load("models/cube.glb", function (gltf) {
    const cube4 = gltf.scene;
    cube4.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(cube4);
    cube4.position.set(4, 0.6, -17);
    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.fixed();
    let rigidBody = world.createRigidBody(bodyDesc);
    let fixedCollider = RAPIER.ColliderDesc.cuboid(4,4,4);
    world.createCollider(fixedCollider, rigidBody);
  });

  const clock = new THREE.Clock();
  // Game loop.
  let gameLoop = () => {
    let deltaTime = clock.getDelta();
    if (characterControls){
      characterControls.update(world, deltaTime, keysPressed);}

    // Step the simulation forward.
    world.step();
    // update 3d world with physical world
    // bodys.forEach((body) => {
    //   let position = body.rigid.translation();
    //   let rotation = body.rigid.rotation();

    //   body.mesh.position.x = position.x;
    //   body.mesh.position.y = position.y;
    //   body.mesh.position.z = position.z;

    //   body.mesh.setRotationFromQuaternion(
    //     new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    //   );
    // });

    orbitControls.update();
    renderer.render(scene, camera);
    setTimeout(gameLoop, 16);
  };

  gameLoop();
});

const keysPressed: any = {};
const keyDisplayQueue = new KeyDisplay();
document.addEventListener(
  "keydown",
  (event) => {
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    }
    keysPressed[event.key.toLowerCase()] = true;
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    keyDisplayQueue.up(event.key);
    keysPressed[event.key.toLowerCase()] = false;
  },
  false
);
