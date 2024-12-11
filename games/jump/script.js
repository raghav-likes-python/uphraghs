// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// sounds
const wSound = document.getElementById('wSound');
const lSound = document.getElementById('lSound');

// Camera position for third-person view
camera.position.set(0, 5, 10);

// Player setup
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.y+= 10;

// Movement variables
const moveSpeed = 0.1;
const jumpHeight = 0.3;
let velocity = 0;
let isOnGround = false;
const gravity = -0.01;

// Lives and timer
let lives = 3;
let timeLeft = 60;

// Update lives display
const livesDisplay = document.getElementById('livesDisplay');
function updateLives() {
  livesDisplay.textContent = `Lives: ${lives}`;
}

// Timer display
const timerDisplay = document.getElementById('timerDisplay');
function updateTimer() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Platforms
const platforms = [];
function createPlatform(x, y, z) {
  let letters = "0123456789ABCDEF"; 
  let color = '#'; 
  for (let i = 0; i < 6; i++) 
    color += letters[(Math.floor(Math.random() * 16))]; 
  const platformGeometry = new THREE.BoxGeometry(5, 0.5, 5);
  const platformMaterial = new THREE.MeshBasicMaterial({ color });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.set(x, y, z);
  scene.add(platform);
  platforms.push(platform);
}

// Generate 20 platforms
for (let i = 0; i < 20; i++) {
  createPlatform(i * 10, 1, -i * 10);
}

// Start button functionality
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('overlay').style.display = 'none';
  startTimer();
  animate();
});

// Timer function
var timerInterval;
function startTimer() {
  timerInterval = setInterval(function () {
    timeLeft--;
    updateTimer();
    const lastPlatform = platforms[platforms.length - 1];
    const distance = lastPlatform.position.distanceTo(player.position);
  
    if (distance < 1) { 
      resetPlayer();
      clearInterval(timerInterval);
      wingameOver();
    }
    if (timeLeft <= 0 || lives <= 0) {
      resetPlayer();
      clearInterval(timerInterval);
      losegameOver();
    }
  }, 1000);
}

// Game over logic
function losegameOver() {
  resetPlayer();
  cancelAnimationFrame(animate);
  clearInterval(timerInterval);
  lSound.play();
  alert("Game Over! You Lost!");
  location.href = "../..";
}

function wingameOver() {
  resetPlayer();
  cancelAnimationFrame(animate);
  clearInterval(timerInterval);
  wSound.play();
  alert("Game Over! You Won!");
  location.href = "../..";
}

// Handle player movement and jumping
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function handleMovement() {
  if (keys['w'] || keys['arrowup']) player.position.z -= moveSpeed;
  if (keys['s'] || keys['arrowdown']) player.position.z += moveSpeed;
  if (keys['a'] || keys['arrowleft']) player.position.x -= moveSpeed;
  if (keys['d'] || keys['arrowright']) player.position.x += moveSpeed;

  if ((keys[' '] || keys['space']) && isOnGround) {
    velocity = jumpHeight;
    isOnGround = false;
  }

  // Apply gravity
  velocity += gravity;
  player.position.y += velocity;

  // Check if the player is on a platform
  let onPlatform = false;
  platforms.forEach(platform => {
    if (
      player.position.y <= platform.position.y + 1 &&
      player.position.y >= platform.position.y &&
      player.position.x > platform.position.x - 2.5 &&
      player.position.x < platform.position.x + 2.5 &&
      player.position.z > platform.position.z - 2.5 &&
      player.position.z < platform.position.z + 2.5
    ) {
      onPlatform = true;
      if (velocity < 0) {
        velocity = 0;
        isOnGround = true;
        player.position.y = platform.position.y + 1;
      }
    }
  });

  // If the player is not on any platform and falls
  if (!onPlatform) {
    isOnGround = false;
    if (player.position.y < -5) {
      lives--;
      updateLives();
      if (lives > 0) {
        resetPlayer();
      } else {
        losegameOver();
      }
    }
  }
}

// Respawn player on the first platform
function resetPlayer() {
  player.position.set(0, 3, 0);
  velocity = 0;
}

// Main game loop
function animate() {
  requestAnimationFrame(animate);
  handleMovement();
  renderer.render(scene, camera);

  // Update camera to follow the player
  camera.position.set(player.position.x, player.position.y + 4, player.position.z + 8);
  camera.lookAt(player.position);
}

