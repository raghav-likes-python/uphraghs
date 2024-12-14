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
const wSound = document.getElementById('wSound');
const lSound = document.getElementById('lSound');

var timer;
// Hide tutorial and start game
function startGame() {
  document.getElementById('overlay').style.display = 'none';
  timer = setInterval(function() {
    timerDisplay.textContent = `Time left: ${--timeLeft}s`;
    if(timeLeft <= 0) {
      gameOver();
    }
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

const moveSpeed = 0.2;
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);


const bullets = [];
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') shootBullet();
});

function shootBullet() {
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  bullet.position.set(ship.position.x, ship.position.y, ship.position.z - 1);
  scene.add(bullet);
  bullets.push(bullet);
  shootSound.currentTime = 0;
  shootSound.play();
}


const enemies = [];
function spawnEnemy() {
  const enemyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
  enemy.position.set((Math.random() - 0.5) * 10, ship.position.y, -10);  // Spawn at player's Y
  scene.add(enemy);
  enemies.push(enemy);

  // loader.load('../../assets/strs/meteor/scene.gltf', function (gltf) {
  //   const enemy = gltf.scene;
  //   enemy.position.set((Math.random() - 0.5) * 10, ship.position.y, -10);  // Spawn at player's Y
  //   scene.add(enemy);
  //   enemies.push(enemy);
  // });
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
      if (bullet.position.distanceTo(enemy.position) < 0.5) {
        scene.remove(bullet, enemy);
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        updateScore();
        collisionSound.currentTime = 0;
        collisionSound.play(); 
      }
    });
  });
}

// Health Management
function checkPlayerCollision() {
  enemies.forEach((enemy, eIndex) => {
    if (ship.position.distanceTo(enemy.position) < 0.5) {
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

function wait2Seconds(callback) {
    setTimeout(callback, 2000); // 3000ms = 3 seconds
}

function gameOver() {
    cancelAnimationFrame(animate);
    clearInterval(timer);

    if (score >= 500) {
        wSound.play();
        alert("You Won! Game over!");
    } else {
        lSound.play();
        alert("You Lost! Game over!");
    }
     wait2Seconds(() => {
    // Initialize localStorage leaderboard arrays if not already initialized
    if (!localStorage.getItem("blnp_lb_s") || !localStorage.getItem("blnp_lb_n")) {
        localStorage.setItem("blnp_lb_s", "0,0,0,0,0");
        localStorage.setItem("blnp_lb_n", "Nobody,Nobody,Nobody,Nobody,Nobody");
    }

    // Fetch existing leaderboard data
    let scores = localStorage.getItem("blnp_lb_s").split(",").map(Number);
    let names = localStorage.getItem("blnp_lb_n").split(",");

    // Insert the new score in the correct position
    for (let i = 0; i < scores.length; i++) {
        if (score > scores[i]) {
            scores.splice(i, 0, score);
            names.splice(i, 0, playerName);
            break;
        }
    }

    scores = scores.slice(0, 5);
    names = names.slice(0, 5);

    localStorage.setItem("blnp_lb_s", scores.join(","));
    localStorage.setItem("blnp_lb_n", names.join(","));

    location.href = "../..";
})}

function fetchTopScores() {
    const head = document.getElementById("head");
    const list = document.getElementById("list");
    let _lb_n = ['Nobody', 'Nobody', 'Nobody', 'Nobody', 'Nobody'];
    let _lb_s = [0, 0, 0, 0, 0];

    // Fetch leaderboard data from localStorage
    if (localStorage.getItem("blnp_lb_s") && localStorage.getItem("blnp_lb_n")) {
        _lb_s = localStorage.blnp_lb_s.split(",");
        _lb_n = localStorage.blnp_lb_n.split(",");
    }

    // Update leaderboard display
    list.innerHTML = `
        <li>${_lb_n[0]}: ${Number(_lb_s[0])}</li>
        <li>${_lb_n[1]}: ${Number(_lb_s[1])}</li>
        <li>${_lb_n[2]}: ${Number(_lb_s[2])}</li>
        <li>${_lb_n[3]}: ${Number(_lb_s[3])}</li>
        <li>${_lb_n[4]}: ${Number(_lb_s[4])}</li>`
    ;
}
