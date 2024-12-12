// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sounds
const wSound = document.getElementById('wSound');
const lSound = document.getElementById('lSound');

// Camera position for third-person view
camera.position.set(0, 5, 10);

// Player setup
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.set(0, 3, 0);

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
const platformSize = { width: 5, height: 0.5, depth: 5 };
const minDistance = 8; 
const maxDistance = 10; 
const maxYDifference = 2.5; // Maximum y-difference
const minYPosition = 1; // Minimum y-position to avoid falling
let platformCount = 0; // To keep track of platform count

function createPlatform(x, y, z) {
  let letters = "0123456789ABCDEF"; 
  let color = '#'; 
  for (let i = 0; i < 6; i++) 
    color += letters[Math.floor(Math.random() * 16)];
  const platformGeometry = new THREE.BoxGeometry(platformSize.width, platformSize.height, platformSize.depth);
  const platformMaterial = new THREE.MeshBasicMaterial({ color });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.set(x, y, z);
  scene.add(platform);
  platforms.push(platform);
}

// Initial platform
createPlatform(0, 1, 0);
platformCount++;

// Generate next platform dynamically
function spawnNextPlatform() {
  if (platformCount >= 20) return; // Stop spawning after the 20th platform

  const lastPlatform = platforms[platforms.length - 1];

  // Random distances ensuring challenging yet jumpable platforms
  const xOffset = Math.random() * (maxDistance - minDistance) + minDistance; // Min to Max range
  const yOffset = (Math.random() - 0.5) * maxYDifference * 2; // Up or down within maxYDifference
  const zDeviation = (Math.random() - 0.5) * maxDistance * 2; // Allows placement left or right

  // Ensure y doesn't go too low
  const nextY = Math.max(lastPlatform.position.y + yOffset, minYPosition);

  const nextX = lastPlatform.position.x + xOffset;
  const nextZ = lastPlatform.position.z + zDeviation; // Allow left/right movement

  createPlatform(nextX, nextY, nextZ);
  platformCount++;
}

// Start button functionality
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('overlay').style.display = 'none';
  startTimer();
  animate();
});

// Timer function
let timerInterval;
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0 || lives <= 0) {
      clearInterval(timerInterval);
      loseGameOver();
    }
  }, 1000);
}

// Game over logic
function loseGameOver() {
  resetPlayer();
  cancelAnimationFrame(animate);
  clearInterval(timerInterval);
  lSound.play();
  alert("Game Over! You Lost!");
  location.href = "../..";
}

function winGameOver() {
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
  platforms.forEach((platform, index) => {
    if (
      player.position.y <= platform.position.y + 1 &&
      player.position.y >= platform.position.y &&
      player.position.x > platform.position.x - platformSize.width / 2 &&
      player.position.x < platform.position.x + platformSize.width / 2 &&
      player.position.z > platform.position.z - platformSize.depth / 2 &&
      player.position.z < platform.position.z + platformSize.depth / 2
    ) {
      onPlatform = true;
      if (velocity < 0) {
        velocity = 0;
        isOnGround = true;
        player.position.y = platform.position.y + 1;

        // Spawn the next platform when player lands on the current platform
        if (index === platforms.length - 1) {
          spawnNextPlatform();
        }

        // Check if the player is on the last platform
        if (platformCount === 20 && index === platforms.length - 1) {
          winGameOver();
        }
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
        loseGameOver();
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
