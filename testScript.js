/* variables */
const width = 720,
  height = 640,
  ratio = window.devicePixelRatio,
  canvas = document.getElementById("canvas"),
  ctx = canvas.getContext('2d')

canvas.width = width * ratio;
canvas.height = height * ratio;

const blockSize = 40,
  widthInBlocks = width / blockSize,
  heightInBlocks = height / blockSize,
  step = 10;

/* classes */
class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.color;
  }
  drawBlock = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
  destroyBlock = function() {
    ctx.clearRect(this.x, this.y, this.size, this.size);
  }
}

class Wall extends Block {
  constructor(x, y, color, destructible = false) {
    super(x, y);
    this.color = color;
    this.destructible = destructible;
  }
  areYouDestructible = function() {
    return this.destructible;
  }
}
let walls = [];
for (let wx = 0; wx < widthInBlocks; wx++) {
  for (let wy = 0; wy < heightInBlocks; wy++) {
    if (wx % 2 == 1 && wy % 2 == 1 && wx > 0 && wy > 0) {
      console.log(wx, wy);
      walls.push(new Wall(wx * blockSize, wy * blockSize, "grey", true));
    } else {
      // walls.push(new Wall(wx + blockSize, wy + blockSize, "brown", false));
    }
  }
}

class Player extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "#ffd700";
  }
}
let player = new Player(0, 0);

class Enemy extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "#5f0000";
  }
}
let enemies = [];
for (let i = 0; i < 5; i++) {
  enemies.push(new Enemy(minMaxRandom(10, canvas.width - blockSize), minMaxRandom(10, canvas.height - blockSize)));
}

class Bomb extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "#af0000";
  }
}

/* functions */
function minMaxRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function hundredRandom() {
  return Math.floor(Math.random() * 100);
}

function keyPressed(event) {
  let keycode = event.keyCode;
  switch (keycode) {

    case 37: // left
      if (player.x > 0) player.x -= step;
      break;

    case 38: // up
      if (player.y > 0) player.y -= step;
      break;

    case 39: // right
      if (player.x < canvas.width - player.size) player.x += step;
      break;

    case 40: // bottom
      if (player.y < canvas.height - player.size) player.y += step;
      break;

    case 32: // spacebar
      dropDaBomb(player.x, player.y);

    default:
      return;
  }
  // check collisions
  for (let i = 0; i < enemies.length; i++) {
      if (player.x < enemies[i].x + enemies[i].size && player.x + player.size > enemies[i].x && player.y < enemies[i].y + enemies[i].size && player.y + player.size > enemies[i].y) {
      alert("game over!");
      clearInterval(animation);
    }
  }
  for (let i = 0; i < walls.length; i++) {
    if (player.x < walls[i].x + walls[i].size && player.x + player.size > walls[i].x && player.y < walls[i].y + walls[i].size && player.y + player.size > walls[i].y) return;
  }
}

function dropDaBomb(x, y) {
  let bomb = new Bomb(x, y);
  bomb.drawBlock();
  setTimeout(boom, 3000);
}

function boom() {
  bomb.destroyBlock();
}

function randomMove() {
  for (let i = 0; i < enemies.length; i++) {
    switch (Math.floor(Math.random() * 4)) {
      case 0: // left
        if (enemies[i].x > 0) enemies[i].x -= step;
        break;

      case 1: // right
        if (enemies[i].x < canvas.width - enemies[i].size) enemies[i].x += step;
        break;

      case 2: // up
        if (enemies[i].y > 0) enemies[i].y -= step;
        break;

      case 3: // down
        if (enemies[i].y < canvas.height - enemies[i].size) enemies[i].y += step;
        break;

      default:
        return;
    }
  }
  for (let i = 0; i < walls.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j].x < walls[i].x + walls[i].size && enemies[j].x + enemies[j].size > walls[i].x && enemies[j].y < walls[i].y + walls[i].size && enemies[j].y + enemies[j].size > walls[i].y && !(walls[i].destructible) || enemies[j].x < walls[i].x + walls[i].size && enemies[j].x + enemies[j].size > walls[i].x && enemies[j].y < walls[i].y + walls[i].size && enemies[j].y + enemies[j].size > walls[i].y && walls[i].destructible) console.log("collision");
    }
  }
}

function renderCanvas() {
  ctx.fillStyle = "#00af00";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
  renderCanvas();
  for (let i = 0; i < walls.length; i++) {
    walls[i].drawBlock();
  }
  player.drawBlock();
  for (let j = 0; j < enemies.length; j++) {
    enemies[j].drawBlock();
  }
}
// animation
let animation = setInterval(animate, 30);
setInterval(function() {
  setTimeout(randomMove, 1000);
}, 1000);

/* event listeners */
document.onkeydown = function(event) {
  keyPressed(event);
}
