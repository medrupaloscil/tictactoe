const video = document.querySelector('.input_video');
const waiting = document.querySelector('.waiting');
const game = document.querySelector('.game');
const computerScore = document.querySelector('.computer-score');
const computer = document.querySelector('.computer-play');
const playerScore = document.querySelector('.player-score');
const player = document.querySelector('.player-play');
const img = document.createElement("img");
const computerImg = document.createElement("img");
player.appendChild(img);

const signs = ['rock', 'scissors', 'paper'];

let cs = 0; // computer score
let ps = 0; // player score
let time = 5;
let last = -1;
let loaded = false;
let firstSign = false;

function getDistance(pos1, pos2) {
  return ((pos2.x * 100 - pos1.x * 100)^2 + (pos2.y * 100 - pos1.y * 100)^2 + (pos2.z * 100 - pos1.z * 100)^2) / 2.
}

function getComputer() {
  time--;
  if (time >= 0) {
    computerImg.remove();
    computer.innerText = time + 1;
  } else if (time === -1) {
    computer.innerText = '';
    const computerSign = Math.floor(Math.random() * 3);
    computerImg.src = `./img/${signs[computerSign]}.png`;
    computer.appendChild(computerImg);
    switch (computerSign) {
      case 0:
        if (last === 1) cs++;
        if (last === 2) ps++;
        break;
      case 1:
        if (last === 0) ps++;
        if (last === 2) cs++;
        break;
      case 2:
        if (last === 0) cs++;
        if (last === 1) ps++;
        break;
      default:
        break;
    }
    playerScore.innerText = ps;
    computerScore.innerText = cs;
  } else if (time == -2) {
    time = 5;
  }
}

function onResults(results) {
  if (!loaded) {
    waiting.remove();
    game.style.display = 'block';
    loaded = true;
  }
  let newSign = -1;
  if (results.multiHandLandmarks && results.multiHandedness) {
    const hand = results.multiHandLandmarks[0];
    const dists = [8, 12, 16, 20].map((e) => {
      return Math.abs(getDistance(hand[0], hand[e]));
    })
    if (dists[2] < 10 && dists[3] < 10) {
      if (dists[0] < 10 && dists[1] < 10) newSign = 0;
      else if (dists[0] > 15 && dists[1] > 15) newSign = 1;
    } else {
      if (dists.filter((e) => e > 15).length === 4) newSign = 2;
    }
    if (newSign !== -1 && newSign !== last) {
      if (!firstSign) {
        firstSign = true;
        setInterval(getComputer, 1000);
      }
      last = newSign;
      img.src = `./img/${signs[last]}.png`;
    }
  }
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});
hands.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({image: video});
  },
  width: 1280,
  height: 720
});
camera.start();