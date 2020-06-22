/* variables */
const size = 18,
  blockSize = 40,
  canvas = document.getElementById("canvas"),
  ctx = canvas.getContext('2d');
  backgroundColor = "#00af00";

canvas.width = blockSize * (size + 1);
canvas.height = blockSize * (size + 1);
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

let walls = [],
enemies = [],
bombs = [];

function clearCase(x, y) {
  for (var i = 0; i < bombs.length; i++) {
    if (x == bombs[i].x && y == bombs[i].y) {
      bombs[i].drawBlock();
      return;
    }
  }
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
}
function minMaxRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/* classes */
class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color;
  }
  drawBlock = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * blockSize, this.y * blockSize, blockSize, blockSize);
  }
}

class Wall extends Block {
  constructor(x, y, destructible = false) {
    super(x, y);
    this.color = destructible ? "darkgrey" : "brown";
    this.destructible = destructible;
    this.drawBlock();
  }
  areYouDestructible = function() {
    return this.destructible;
  }
}

class Player extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "#ffd700";
    this.drawBlock();
    let that = this;
    document.onkeydown = function(event) {
      that.keyPressed(event);
    };
    // puissanceBomb = 1;
    // nombre de bombes max;
    // noombre de bombes posées;
  }
  keyPressed = function(event) {
    let keycode = event.keyCode;
    let px = this.x;
    let py = this.y;
    switch (keycode) {

      case 37: // left
        px--;
        break;

      case 38: // up
        py--;
        break;

      case 39: // right
        px++;
        break;

      case 40: // bottom
        py++;
        break;

      case 32: // spacebar
        this.dropDaBomb();

      default:
        return;
    }
    // check border collision
    if (px < 0) return;
    if (py < 0) return;
    if (px >= size+1) return;
    if (py >= size+1) return;

    for (let i = 0; i < walls.length; i++) {
      if (px == walls[i].x && py == walls[i].y) return;
    }
    for (let i = 0; i < enemies.length; i++) {
        if (px == enemies[i].x && py == enemies[i].y) {
        alert("game over!");
        clearInterval(loopEnemyMove);
      }
    }
    clearCase(this.x, this.y);
    this.x = px;
    this.y = py;
    this.drawBlock();
  }
  dropDaBomb = function() {
    bombs.push(new Bomb(this.x, this.y));
    // fonction anonyme
  }
}
let player = new Player(0, 0);

class Enemy extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "red";
    this.drawBlock();
  }
}

class Bomb extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "darkpink";
    this.drawBlock();
    let that = this;
    setTimeout(function() { that.boom() }, 3000);
    // puissaceBomb
  }
  boom = function() {
    // for (var i = 0; i <= puissanceBomb; i++) {
    //
    // }
    // boucle explosion gauche
    // explosion droite
    // etc...
    bombs.splice(bombs.indexOf(this), 1);
    clearCase(this.x, this.y);
  }
}

for (let wx = 0; wx < size; wx++) {
  for (let wy = 0; wy < size; wy++) {
    if (wx % 2 == 1 && wy % 2 == 1) {
      walls.push(new Wall(wx, wy, false));
    }
  }
}
let count = 0;
while (count < 150) {
  let rwx = minMaxRandom(0, size),
  rwy = minMaxRandom(0, size),
  found = false;

  for (let i = 0; i < walls.length; i++) {
    if (rwx == walls[i].x && rwy == walls[i].y) {
      found = true;
      break;
    }
  }
  if (found) {
    continue;
  }
  if (rwx == 0 && rwy == 0) continue;
  else if (rwx == 1 && rwy == 0) continue;
  else if (rwx == 0 && rwy == 1) continue;
  else if (rwx == size && rwy == 0) continue;
  else if (rwx == (size - 1) && rwy == 0) continue;
  else if (rwx == size && rwy == 1) continue;
  else if (rwx == 0 && rwy == size ) continue;
  else if (rwx == 1 && rwy == size ) continue;
  else if (rwx == 0 && rwy == (size - 1) ) continue;
  else if (rwx == size && rwy == size) continue;
  else if (rwx == (size - 1) && rwy == size) continue;
  else if (rwx == size && rwy == (size - 1) ) continue;
  walls.push(new Wall(rwx, rwy, true));
  count++;
}

count = 0;
while (count < 5) {
  let rex = minMaxRandom(5, size),
  rey = minMaxRandom(5, size),
  found = false;

  for (let i = 0; i < walls.length; i++) {
    if (rex == walls[i].x && rey == walls[i].y) {
      found = true;
      break;
    }
  }
  if (found) {
    continue;
  }

  found = false;

  for (let i = 0; i < enemies.length; i++) {
    if (rex == enemies[i].x && rey == enemies[i].y) {
      found = true;
      break;
    }
  }
  if (found) {
    continue;
  }
  enemies.push(new Enemy(rex, rey));
  count++;
}

/* functions */
function enemyRandomMove() {
  let stop = false;
  for (let i = 0; i < enemies.length; i++) {
    let fail = 0,
    found = false;

    while (fail < 10) {
      fail++;
      let px = enemies[i].x;
      let py = enemies[i].y;
      switch (minMaxRandom(0, 4)) {

        case 0: // left
          px--;
          break;

        case 1: // up
          py--;
          break;

        case 2: // right
          px++;
          break;

        case 3: // bottom
          py++;
          break;

        default:
          continue;
      }
      // check border collision
      if (px < 0) continue;
      if (py < 0) continue;
      if (px >= size+1) continue;
      if (py >= size+1) continue;

      found = false;
      for (let i = 0; i < walls.length; i++) {
        if (px == walls[i].x && py == walls[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }
      for (let i = 0; i < enemies.length; i++) {
        if (px == enemies[i].x && py == enemies[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }
      if (px == player.x && py == player.y) {
        stop = true;
        alert("game over!");
      }

      clearCase(enemies[i].x, enemies[i].y);
      enemies[i].x = px;
      enemies[i].y = py;
      enemies[i].drawBlock();
      break;
    }
  }
  if (!stop) {
    let loopEnemyMove = setTimeout(enemyRandomMove, 1000);
  }
}
enemyRandomMove();
