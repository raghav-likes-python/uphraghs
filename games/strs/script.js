import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let score = 0;
let health = 100;
let timeLeft = 60;
let level = 1;

const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const timerDisplay = document.getElementById('timer');
document.getElementById('startButton').onclick = startGame;

// Sounds
const shootSound = document.getElementById('shootSound');
const collisionSound = document.getElementById('collisionSound');

let timer;
function startGame() {
  document.getElementById('overlay').style.display = 'none';
  timer = setInterval(() => {
    timerDisplay.textContent = `Time left: ${--timeLeft}s`;
    if (timeLeft <= 0) gameOver();
  }, 1000);
  animate();
}

// Player setup
const shipGeometry = new THREE.ConeGeometry(0.5, 1, 4);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ship = new THREE.Mesh(shipGeometry, shipMaterial);
ship.rotation.x = Math.PI / 2;
scene.add(ship);
camera.position.z = 5;

// Movement
const moveSpeed = 0.2;
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Bullets
const bullets = [];
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') shootBullet();
});

function shootBullet() {
  const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  bullet.position.set(ship.position.x, ship.position.y, ship.position.z - 1);
  scene.add(bullet);
  bullets.push(bullet);
  shootSound.play();
}

// Enemies (Asteroids)
const enemies = [];
const loader = new THREE.GLTFLoader();
function spawnEnemy() {
    loader.load('../../assets/strs/meteor/scene.gltf', (gltf) => {
    const enemy = gltf.scene;
    enemy.position.set((Math.random() - 0.5) * 10, ship.position.y, -10);
    enemy.scale.set(0.5, 0.5, 0.5);
    scene.add(enemy);
    enemies.push(enemy);
  });
}

// Movement and Collision Detection
function handleMovement() {
  if (keys['w'] || keys['arrowup']) ship.position.y += moveSpeed;
  if (keys['s'] || keys['arrowdown']) ship.position.y -= moveSpeed;
  if (keys['a'] || keys['arrowleft']) ship.position.x -= moveSpeed;
  if (keys['d'] || keys['arrowright']) ship.position.x += moveSpeed;
}

function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (bullet.position.distanceTo(enemy.position) < 1) {
        scene.remove(bullet, enemy);
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        updateScore();
        collisionSound.play();
      }
    });
  });
}

// Health Management
function checkPlayerCollision() {
  enemies.forEach((enemy, eIndex) => {
    if (ship.position.distanceTo(enemy.position) < 1) {
      health -= 10;
      healthDisplay.textContent = `Health: ${health}`;
      scene.remove(enemy);
      enemies.splice(eIndex, 1);
      if (health <= 0) gameOver();
    }
  });
}

function updateScore() {
  score += 10;
  scoreDisplay.textContent = `Score: ${score}`;
  if (score % 100 === 0) levelUp();
}

// Level Up
function levelUp() {
  level++;
  spawnInterval -= 100;  // Increase difficulty by reducing enemy spawn interval
}

// Main game loop
function animate() {
  requestAnimationFrame(animate);
  handleMovement();
  bullets.forEach(b => b.position.z -= 0.2);
  enemies.forEach(e => e.position.z += 0.05 + (0.01 * level));
  checkCollisions();
  checkPlayerCollision();
  renderer.render(scene, camera);
}

let spawnInterval = 1000;
setInterval(spawnEnemy, spawnInterval);

// Game over function
function gameOver() {
  cancelAnimationFrame(animate);
  clearInterval(timer);
  alert("Game Over! Your Score: " + score);
  location.reload();
}
