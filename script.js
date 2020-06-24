/* variables */
const size = 18, // number of blocks per row and column
  blockSize = 40,
  canvas = document.getElementById("canvas"),
  ctx = canvas.getContext('2d'),
  backgroundColor = "#00af00";

canvas.width = blockSize * (size + 1);
canvas.height = blockSize * (size + 1);
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

let walls = [],
  enemies = [],
  bombs = [],
  score = 0;
  console.log("score: ", score);

/* functions */
function clearCase(x, y) {
  for (var i = 0; i < bombs.length; i++) {
    if (x == bombs[i].x && y == bombs[i].y) {
      bombs[i].drawBlock();
      console.log("bomb: ", bombs[i]);
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
    this.color = destructible ? "darkgrey" : "brown"; // conditional (ternary) operator, shortcut for if statement
    this.drawBlock();
    this.destructible = destructible;
  }
  isDestructible = function() {
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
    this.power = 1;
    this.maxBombs = 1;
    this.activeBombs = 0;
  }
  dropDaBomb = function() {
    if (this.maxBombs <= this.activeBombs) return;
    let that = this;
    // walls[this.x][this.y] =
    bombs.push(new Bomb(this.x, this.y, this.power, function() { that.activeBombs--; }));
    this.activeBombs++;
    console.log("active bombs: ", this.activeBombs);
  }
  keyPressed = function(event) {

    let keycode = event.keyCode,
      px = this.x,
      py = this.y;

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
    if (px >= size + 1) return;
    if (py >= size + 1) return;

    for (let i = 0; i < walls.length; i++) {
      if (px == walls[i].x && py == walls[i].y) return;
    }

    for (let i = 0; i < bombs.length; i++) {
      if (px == bombs[i].x && py == bombs[i].y) return;
    }

    for (let i = 0; i < enemies.length; i++) {
      if (px == enemies[i].x && py == enemies[i].y) { // game over
        alert("game over!");
        clearInterval(loopEnemyMove);
      }
    }

    clearCase(this.x, this.y);
    this.x = px;
    this.y = py;
    this.drawBlock();
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
  constructor(x, y, power, delayedBoom) {
    super(x, y);
    this.color = "pink";
    this.drawBlock();
    this.power = power;
    this.delayedBoom = delayedBoom;
    let that = this;
    setTimeout(function() { that.triggerBomb(); }, 3000);
  }
  triggerBomb = function() {

    // check explosion's position
    for (let i = 1; i <= this.power; i++) { // left
      let bx = this.x - i,
      by = this.y;
      if (this.checkBoom(bx, by)) break;
    }
    for (let i = 1; i <= this.power; i++) { // right
      let bx = this.x + i,
      by = this.y;
      if (this.checkBoom(bx, by)) break;
    }
    for (let i = 1; i <= this.power; i++) { // up
      let bx = this.x,
      by = this.y - i;
      if (this.checkBoom(bx, by)) break;
    }
    for (let i = 1; i <= this.power; i++) { // down
      let bx = this.x,
      by = this.y + i;
      if (this.checkBoom(bx, by)) break;
    }

    bombs.splice(bombs.indexOf(this), 1);
    this.delayedBoom();
    clearCase(this.x, this.y);
  }
  checkBoom = function(bx, by) {
    // check if bomb explodes outside the board game
    if (bx < 0) return true;
    if (by < 0) return true;
    if (bx > size) return true;
    if (by > size) return true;

    new ExplodeEnemies(bx, by);
    new ExplodeWalls(bx, by);
  }
}

class ExplodeWalls extends Block {
  constructor(x, y) {
    super(x, y);
    for (let i = 0; i < walls.length; i++) {
      if (x == walls[i].x && y == walls[i].y && walls[i].isDestructible()) {
        clearCase(walls[i].x, walls[i].y);
        walls.splice(walls.indexOf(walls[i]), 1);
      }
    }
  }
}

class ExplodeEnemies extends Block {
  constructor(x, y) {
    super(x, y);
    if (this.x == player.x && this.y == player.y) {
      alert("game over!");
      clearInterval(loopEnemyMove);
    }
    for (let i = 0; i < enemies.length; i++) {
      if (this.x == enemies[i].x && this.y == enemies[i].y) {
        clearCase(enemies[i].x, enemies[i].y);
        enemies.splice(enemies.indexOf(enemies[i]), 1);
        score++;
        console.log("score: ", score);
        if (enemies.length == 0) {
          alert("YOU WIN!");
        }
      }
    }
  }
}

// generate walls
for (let wx = 0; wx < size; wx++) {
  for (let wy = 0; wy < size; wy++) {
    if (wx % 2 == 1 && wy % 2 == 1) {
      walls.push(new Wall(wx, wy, false));
    }
  }
}

let count = 0;
while (count < 100) {

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

  // keep board game borders empty
  if (rwx == 0 && rwy == 0) continue;
  else if (rwx == 1 && rwy == 0) continue;
  else if (rwx == 0 && rwy == 1) continue;
  else if (rwx == size && rwy == 0) continue;
  else if (rwx == (size - 1) && rwy == 0) continue;
  else if (rwx == size && rwy == 1) continue;
  else if (rwx == 0 && rwy == size) continue;
  else if (rwx == 1 && rwy == size) continue;
  else if (rwx == 0 && rwy == (size - 1)) continue;
  else if (rwx == size && rwy == size) continue;
  else if (rwx == (size - 1) && rwy == size) continue;
  else if (rwx == size && rwy == (size - 1)) continue;
  walls.push(new Wall(rwx, rwy, true));
  count++;
}

// generate enemies
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
console.log("enemies: ", enemies.length);

// move enemies randomly
function enemyRandomMove() {
  let stop = false;

  for (let i = 0; i < enemies.length; i++) {

    let fail = 0,
      found = false;

    while (fail < 10) { // let enemies move

      fail++;
      let ex = enemies[i].x,
        ey = enemies[i].y;

      switch (minMaxRandom(0, 4)) {

        case 0: // left
          ex--;
          break;

        case 1: // up
          ey--;
          break;

        case 2: // right
          ex++;
          break;

        case 3: // bottom
          ey++;
          break;

        default:
          continue;
      }
      // check border collision
      if (ex < 0) continue;
      if (ey < 0) continue;
      if (ex >= size + 1) continue;
      if (ey >= size + 1) continue;

      found = false;
      for (let i = 0; i < walls.length; i++) {
        if (ex == walls[i].x && ey == walls[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }

      for (let i = 0; i < enemies.length; i++) {
        if (ex == enemies[i].x && ey == enemies[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }

      for (let i = 0; i < bombs.length; i++) {
        if (ex == bombs[i].x && ey == bombs[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }

      if (ex == player.x && ey == player.y) { // game over
        stop = true;
        alert("game over!");
      }

      clearCase(enemies[i].x, enemies[i].y);
      enemies[i].x = ex;
      enemies[i].y = ey;
      enemies[i].drawBlock();
      break;
    }
  }
  if (!stop) {
    let loopEnemyMove = setTimeout(enemyRandomMove, 1000);
  }
}
// call function
enemyRandomMove();
