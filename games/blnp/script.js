const MAX_BALLOONS = 20;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const balloons = [];
let score = 0;

let timeLeft = 10; 
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const totalPlayersElement = document.getElementById('total_players');

const popSound = document.getElementById('popSound');

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

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeElement.textContent = timeLeft;
    } else {
        clearInterval(timerInterval);
        endGame();
    }
}

function endGame() {
    alert(`Game Over! Your score: ${score}`);

    // fetch('/submit_score', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name: playerName, score: score })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log(data);
    //     fetchTopScores(); 
    // });
    //_[5] = score;
    // _ = _.sort.splice(1).reverse().toString(); // man am i so smart
    // localStorage.blnp_lb-s != _

    localStorage.blnp_cnt++; // my new backend very cool

    const curLbN = localStorage.blnp_lb_n.split(",");
    const curLbS = localStorage.blnp_lb_s.split(",");
    for(i=0;i<5;i++) {
        if(curLbS[i] < score) {
            curLbS[i] = score;
            curLbN[i] = playerName;
            i = 5;
        }
    }
    localStorage.blnp_lb_n = curLbN;
    localStorage.blnp_lb_s = curLbS;
    // if this failed i was ready to kill myself
    location.reload();
}

function fetchTopScores() {
    // fetch('/get_top_scores')
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Top 5 Scores:', data);

    //         let scoresList = document.getElementById('top-scores');
    //         scoresList.innerHTML = ''; 
    //         data.forEach((scoreData, index) => {
    //             let scoreItem = document.createElement('li');
    //             scoreItem.textContent = `${index + 1}. ${scoreData.name}: ${scoreData.score}`;
    //             scoresList.appendChild(scoreItem);
    //         });
    //     });
    const _ = localStorage.blnp_lb_n.split(",");
    const __ = localStorage.blnp_lb_s.split(",");
    leaderboard.innerHTML = `
    <li>${_[0]}: ${__[0]}</li>
    <li>${_[1]}: ${__[1]}</li>
    <li>${_[2]}: ${__[2]}</li>
    <li>${_[3]}: ${__[3]}</li>
    <li>${_[4]}: ${__[4]}</li>
    `; // could be optimized but im lazy
}

window.onload = function() {
    fetchTotalPlayers();
    fetchTopScores();
};


function startGame() {
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }
    gameStarted = true;
    tutorial.style.display = "none";
    playerInfo.style.display = "none";
    createBalloon();
    animate();
    setInterval(createBalloon, 1000); 
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
