const MAX_BALLOONS = 20;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const balloons = [];
let score = 0;

let timeLeft = 60; 
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const totalPlayersElement = document.getElementById('total_players');

const popSound = document.getElementById('popSound');
const wSound = document.getElementById('wSound');
const lSound = document.getElementById('lSound');

const tutorial = document.getElementById('tutorial');
const playerInfo = document.getElementById('player-info');
const startButton = document.getElementById('start_button');
const startGameButton = document.getElementById('start_game');
const leaderboard = document.getElementById('leaderboard');
const playerNameInput = document.getElementById('player_name');
let playerName = localStorage.plrName;

let timerInterval;
let gameStarted = false;

const colors = ['green', 'yellow', 'blue', 'red'];
const weights = [0.3, 0.3, 0.3, 0.1];

function getRandomColor() {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) return colors[i];
    }
}


function createBalloon() {
    if (balloons.length >= 20) return; 

    let validPosition = false;
    let position;

    while (!validPosition) {
        position = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 5,
            z: -5
        };

        validPosition = balloons.every(balloon => {
            return Math.hypot(
                balloon.position.x - position.x,
                balloon.position.y - position.y
            ) > 1.5;
        });
    }

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const color = getRandomColor();
    const material = new THREE.MeshStandardMaterial({ color });
    const balloon = new THREE.Mesh(geometry, material);

    balloon.position.set(position.x, position.y, position.z);
    balloon.speed = Math.random() * 0.02 + 0.01;
    balloon.isBad = color === 'red';

    scene.add(balloon);
    balloons.push(balloon);
}

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

camera.position.z = 5;

document.addEventListener('mousedown', onMouseDown, false);

function onMouseDown(event) {
    if (!gameStarted) return; 

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(balloons);
    if (intersects.length > 0) {
        const poppedBalloon = intersects[0].object;
        scene.remove(poppedBalloon);
        balloons.splice(balloons.indexOf(poppedBalloon), 1);

        popSound.play();

        if (poppedBalloon.isBad) {
            score--;
        } else {
            score++;
        }

        scoreElement.textContent = score;

        createBalloon();
    }
}

// function $alert(_title,_text,_button) {
//     title.innerHTML = _title ? _title : "Alert!";
//     text.innerHTML = _text;
//     button.innerHTML = _button ? _button : "Okay!";

//     wrap.style.display = "block";
// }

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeElement.textContent = timeLeft;
    } else {
        endGame();
    }
}

function wait3Seconds(callback) {
    setTimeout(callback, 3000); // 3000ms = 3 seconds
}

function endGame() {
    cancelAnimationFrame(animate);
    clearInterval(timerInterval);
    clearInterval(createInterval);

    if (score >= 100) {
        wSound.play();
        alert("You Won! Game over!");
    } else {
        lSound.play();
        alert("You Lost! Game over!");
    }
     wait3Seconds(() => {
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
}}

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
        <li>${_lb_n[4]}: ${Number(_lb_s[4])}</li>
    `;
}

function startGame() {
    gameStarted = true;
    tutorial.style.display = "none";
    playerInfo.style.display = "none";
    createBalloon();
    requestAnimationFrame(animate);
    createInterval = setInterval(createBalloon, 1000); 
    timerInterval = setInterval(updateTimer, 1000);
}

function animate() {
    if (!gameStarted) return;

    requestAnimationFrame(animate);

    balloons.forEach(balloon => {
        balloon.position.y += balloon.speed;
        if (balloon.position.y > 5) {
            balloon.position.y = -5; 
        }
    });

    renderer.render(scene, camera);
}

startButton.addEventListener('click', () => {startGame();});

// why is this even here (looks like ai generated residue)
// startGameButton.addEventListener('click', () => {
//     startGame();
// });

function fetchTotalPlayers() {
    // fetch('/get_total_players')
    //     .then(response => response.json())
    //     .then(data => {
    //         totalPlayersElement.textContent = data.total_players;
    //     });
    totalPlayersElement.innerHTML = Number(localStorage.blnp_cnt); 
}

setInterval(createBalloon, 3000);
