
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ---------------------------------
// CONFIGURACIÓN PRINCIPAL
// ---------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x080808, 0.035);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.7, 8);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

document.body.appendChild(renderer.domElement);

// ---------------------------------
// LUCES DEL HOSPITAL
// ---------------------------------

const ambient = new THREE.AmbientLight(0x303040, 0.35);
scene.add(ambient);

const ceilingLight = new THREE.PointLight(0x9aaacc, 20, 13);
ceilingLight.position.set(0, 3.5, 0);
ceilingLight.castShadow = true;
scene.add(ceilingLight);

// Linterna del protagonista
const flashlight = new THREE.SpotLight(
  0xddeeff,
  100,
  25,
  Math.PI / 7,
  0.45,
  1.5
);

flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -1);
flashlight.castShadow = true;

camera.add(flashlight);
camera.add(flashlight.target);
scene.add(camera);

let flashlightOn = true;
let battery = 100;

// ---------------------------------
// MATERIALES
// ---------------------------------

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x303034,
  roughness: 0.9
});

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x48464a,
  roughness: 0.95
});

const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x080808,
  roughness: 1
});

// ---------------------------------
// FUNCIONES PARA CREAR OBJETOS
// ---------------------------------

function createBox(name, x, y, z, width, height, depth, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const object = new THREE.Mesh(geometry, material);

  object.name = name;
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;

  scene.add(object);
  return object;
}

// ---------------------------------
// HABITACIÓN PRINCIPAL
// ---------------------------------

createBox("floor", 0, -0.15, 0, 30, 0.3, 30, floorMaterial);

createBox("leftWall", -15, 2, 0, 0.5, 4, 30, wallMaterial);
createBox("rightWall", 15, 2, 0, 0.5, 4, 30, wallMaterial);
createBox("frontWall", 0, 2, 15, 30, 4, 0.5, wallMaterial);

// Pared del fondo con una puerta central
createBox("backLeft", -8.5, 2, -15, 13, 4, 0.5, wallMaterial);
createBox("backRight", 8.5, 2, -15, 13, 4, 0.5, wallMaterial);
createBox("backTop", 0, 3.65, -15, 4, 0.7, 0.5, wallMaterial);

// Techo oscuro
createBox("ceiling", 0, 4.2, 0, 30, 0.3, 30, darkMaterial);

// ---------------------------------
// ESCRITORIO DE RECEPCIÓN
// ---------------------------------

const deskMaterial = new THREE.MeshStandardMaterial({
  color: 0x252323,
  roughness: 0.8
});

createBox("desk", 0, 0.7, -3, 7, 1.4, 1.8, deskMaterial);

// ---------------------------------
// PUERTA BLOQUEADA
// ---------------------------------

const doorMaterial = new THREE.MeshStandardMaterial({
  color: 0x171717,
  roughness: 0.8
});

const door = createBox(
  "exitDoor",
  0, 1.7, -14.65,
  3.8, 3.4, 0.25,
  doorMaterial
);

const doorLight = new THREE.PointLight(0x880000, 3, 5);
doorLight.position.set(0, 2.5, -13.5);
scene.add(doorLight);

// ---------------------------------
// DOCUMENTO Y TARJETA
// ---------------------------------

const paperMaterial = new THREE.MeshStandardMaterial({
  color: 0xd5d0bb,
  roughness: 1,
  side: THREE.DoubleSide
});

const note = new THREE.Mesh(
  new THREE.PlaneGeometry(0.8, 0.55),
  paperMaterial
);

note.position.set(-1.5, 1.43, -3);
note.rotation.x = -Math.PI / 2;
scene.add(note);

const card = new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 0.04, 0.22),
  new THREE.MeshStandardMaterial({
    color: 0x880000,
    emissive: 0x330000
  })
);

card.position.set(1.5, 1.45, -3);
scene.add(card);

let noteCollected = false;
let keyCollected = false;
let doorOpen = false;

// ---------------------------------
// CREAR PATIENT 1
// ---------------------------------

const patient = new THREE.Group();

const patientMaterial = new THREE.MeshStandardMaterial({
  color: 0x090909,
  roughness: 1
});

const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0x77716d,
  roughness: 1
});

const eyeMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 3
});

// Cuerpo
const body = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.5, 1.6, 8),
  patientMaterial
);
body.position.y = 1.1;
patient.add(body);

// Cabeza
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.38, 12, 12),
  skinMaterial
);
head.position.y = 2.15;
patient.add(head);

// Ojos
const eye1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.065, 8, 8),
  eyeMaterial
);
eye1.position.set(-0.14, 2.2, -0.32);
patient.add(eye1);

const eye2 = eye1.clone();
eye2.position.x = 0.14;
patient.add(eye2);

// Brazos largos
const armGeometry = new THREE.CylinderGeometry(0.09, 0.13, 1.2, 8);

const arm1 = new THREE.Mesh(armGeometry, patientMaterial);
arm1.position.set(-0.48, 1.15, 0);
arm1.rotation.z = -0.2;
patient.add(arm1);

const arm2 = arm1.clone();
arm2.position.x = 0.48;
arm2.rotation.z = 0.2;
patient.add(arm2);

// Piernas
const legGeometry = new THREE.CylinderGeometry(0.12, 0.16, 1, 8);

const leg1 = new THREE.Mesh(legGeometry, patientMaterial);
leg1.position.set(-0.18, 0.25, 0);
patient.add(leg1);

const leg2 = leg1.clone();
leg2.position.x = 0.18;
patient.add(leg2);

patient.position.set(0, 0, -9);
scene.add(patient);

let patientActive = false;
let patientSpeed = 1.1;

// ---------------------------------
// OBJETOS DEL ESCENARIO
// ---------------------------------

// Camilla abandonada
createBox(
  "oldBed",
  -9, 0.6, -5,
  3, 0.4, 5,
  deskMaterial
);

// Armario donde el jugador podrá imaginar
// futuras mecánicas de escondite
createBox(
  "locker",
  11, 1.5, -7,
  2, 3, 1.5,
  doorMaterial
);

// Luces adicionales
const flickerLights = [];

for (let i = 0; i < 4; i++) {
  const light = new THREE.PointLight(0x8a9bb5, 12, 9);
  light.position.set(
    i % 2 === 0 ? -10 : 10,
    3.3,
    -10 + i * 6
  );

  scene.add(light);
  flickerLights.push(light);
}

// ---------------------------------
// CONTROLES
// ---------------------------------

const keys = {};

let yaw = 0;
let pitch = 0;

const startScreen = document.getElementById("startScreen");
const noteScreen = document.getElementById("noteScreen");
const endScreen = document.getElementById("endScreen");

const message = document.getElementById("message");
const objective = document.getElementById("objective");
const inventory = document.getElementById("inventory");
const batteryText = document.getElementById("battery");

let gameStarted = false;

document.getElementById("startButton").addEventListener("click", () => {
  gameStarted = true;
  renderer.domElement.requestPointerLock();
  startScreen.classList.add("hidden");
});

document.getElementById("closeNote").addEventListener("click", () => {
  noteScreen.classList.add("hidden");
  renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  if (!document.pointerLockElement && gameStarted) {
    message.textContent = "Juego pausado. Haz clic en la pantalla para continuar.";
  } else {
    message.textContent = "";
  }
});

renderer.domElement.addEventListener("click", () => {
  if (
    gameStarted &&
    !document.pointerLockElement &&
    noteScreen.classList.contains("hidden") &&
    endScreen.classList.contains("hidden")
  ) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener("mousemove", (event) => {
  if (!document.pointerLockElement) return;

  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;

  pitch = THREE.MathUtils.clamp(
    pitch,
    -Math.PI / 2.2,
    Math.PI / 2.2
  );

  camera.rotation.set(pitch, yaw, 0, "YXZ");
});

document.addEventListener("keydown", (event) => {
  keys[event.code] = true;

  if (event.code === "KeyF" && gameStarted) {
    flashlightOn = !flashlightOn;
    flashlight.visible = flashlightOn;
  }

  if (event.code === "KeyE" && gameStarted) {
    interact();
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

// ---------------------------------
// INTERACCIONES
// ---------------------------------

function horizontalDistance(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.z - b.z) ** 2
  );
}

function interact() {
  const playerPosition = camera.position;

  if (
    !noteCollected &&
    horizontalDistance(playerPosition, note.position) < 4
  ) {
    noteCollected = true;
    note.visible = false;
    noteScreen.classList.remove("hidden");

    objective.textContent = "OBJETIVO: Encuentra una tarjeta de acceso";
    message.textContent = "Has encontrado un documento.";
    return;
  }

  if (
    !keyCollected &&
    horizontalDistance(playerPosition, card.position) < 4
  ) {
    keyCollected = true;
    card.visible = false;

    inventory.textContent = "Inventario: tarjeta de acceso";
    objective.textContent = "OBJETIVO: Abre la puerta del fondo";
    message.textContent = "Has recogido la tarjeta.";

    patientActive = true;
    return;
  }

  if (
    horizontalDistance(playerPosition, door.position) < 4
  ) {
    if (keyCollected) {
      doorOpen = true;
      door.visible = false;
      endScreen.classList.remove("hidden");

      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else {
      message.textContent = "PUERTA BLOQUEADA: necesitas una tarjeta.";
    }
  }
}

// ---------------------------------
// MOVIMIENTO DEL JUGADOR
// ---------------------------------

const clock = new THREE.Clock();

function movePlayer(delta) {
  if (!document.pointerLockElement) return;

  const speed = keys["ShiftLeft"] ? 6 : 3.5;

  const forward = new THREE.Vector3(
    Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw),
    0,
    Math.sin(yaw)
  );

  const movement = new THREE.Vector3();

  if (keys["KeyW"]) movement.add(forward);
  if (keys["KeyS"]) movement.sub(forward);
  if (keys["KeyD"]) movement.add(right);
  if (keys["KeyA"]) movement.sub(right);

  if (movement.length() > 0) {
    movement.normalize().multiplyScalar(speed * delta);

    const nextX = camera.position.x + movement.x;
    const nextZ = camera.position.z + movement.z;

    // Límites del hospital
    if (Math.abs(nextX) < 14) {
      camera.position.x = nextX;
    }

    if (nextZ > -13.5 && nextZ < 14) {
      camera.position.z = nextZ;
    }

    // Evitar atravesar el escritorio
    if (
      camera.position.x > -3.8 &&
      camera.position.x < 3.8 &&
      camera.position.z > -4.2 &&
      camera.position.z < -1.8
    ) {
      camera.position.x -= movement.x;
      camera.position.z -= movement.z;
    }
  }
}

// ---------------------------------
// INTELIGENCIA BÁSICA DE PATIENT 1
// ---------------------------------

function updatePatient(delta, elapsed) {
  if (!patientActive) {
    patient.rotation.y = Math.sin(elapsed * 0.7) * 0.08;
    return;
  }

  const distance = horizontalDistance(
    patient.position,
    camera.position
  );

  if (distance > 1.5) {
    const direction = new THREE.Vector3(
      camera.position.x - patient.position.x,
      0,
      camera.position.z - patient.position.z
    ).normalize();

    patient.position.addScaledVector(
      direction,
      patientSpeed * delta
    );

    patient.rotation.y = Math.atan2(
      direction.x,
      direction.z
    );
  } else {
    message.textContent = "PATIENT 1 TE HA ENCONTRADO...";
    objective.textContent = "HAS SIDO ATRAPADO";
  }

  // Movimiento inquietante de la cabeza
  head.rotation.z = Math.sin(elapsed * 3) * 0.12;
}

// ---------------------------------
// LINTERNAS Y AMBIENTE
// ---------------------------------

function updateLighting(delta, elapsed) {
  if (flashlightOn && battery > 0) {
    battery -= delta * 0.25;

    if (battery <= 0) {
      battery = 0;
      flashlightOn = false;
      flashlight.visible = false;
      message.textContent = "BATERÍA AGOTADA";
    }
  }

  batteryText.textContent =
    "Linterna: " + Math.floor(battery) + "%";

  // Luces parpadeantes
  flickerLights.forEach((light, index) => {
    const flicker = Math.sin(
      elapsed * (3 + index) + index
    );

    light.intensity = flicker > -0.7
      ? 9 + Math.random() * 3
      : 0;
  });

  ceilingLight.intensity =
    16 + Math.sin(elapsed * 5) * 3;
}

// ---------------------------------
// BUCLE PRINCIPAL
// ---------------------------------

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  if (gameStarted && document.pointerLockElement) {
    movePlayer(delta);
  }

  updatePatient(delta, elapsed);
  updateLighting(delta, elapsed);

  renderer.render(scene, camera);
}

animate();

// ---------------------------------
// AJUSTAR PANTALLA
// ---------------------------------

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
