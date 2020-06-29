/* variables */
const SIZE = 18, // number of blocks per row and column
  BLOCKSIZE = 40,
  CANVAS = document.getElementById("canvas"),
  CTX = CANVAS.getContext('2d'),
  BACKGROUND_COLOR = "#00af00";

CANVAS.width = BLOCKSIZE * (SIZE + 1);
CANVAS.height = BLOCKSIZE * (SIZE + 1);
CTX.fillStyle = BACKGROUND_COLOR;
CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

let walls = [],
  enemies = [],
  bombs = [],
  powerUps = [],
  gameOn = true,
  seconds = 0,
  score = 0;

/* functions */
minMaxRandom = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

randomHundred = function() {
  return Math.floor(Math.random() * 100);
}

clearCase = function(x, y) {
  for (var i = 0; i < bombs.length; i++) {
    if (x == bombs[i].x && y == bombs[i].y) {
      bombs[i].drawBlock();
      return;
    }
  }
  for (var i = 0; i < powerUps.length; i++) {
    if (x == powerUps[i].x && y == powerUps[i].y) {
      powerUps[i].drawBlock();
      return;
    }
  }
  CTX.fillStyle = BACKGROUND_COLOR;
  CTX.fillRect(x * BLOCKSIZE, y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
}

youWin = function() {
  setTimeout(function(){
    new YouWin(score);
  }, 30);
}

gameOver = function() {
  setTimeout(function(){
    new GameOver(score);
  }, 30);
}

/* classes */
class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color;
  }
  drawBlock = function() {
    CTX.fillStyle = this.color;
    CTX.fillRect(this.x * BLOCKSIZE, this.y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
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
    bombs.push(new Bomb(this.x, this.y, this.power, function() { that.activeBombs--; }));
    this.activeBombs++;
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
    if (px >= SIZE + 1) return;
    if (py >= SIZE + 1) return;

    for (let i = 0; i < walls.length; i++) {
      if (px == walls[i].x && py == walls[i].y) return;
    }

    for (let i = 0; i < bombs.length; i++) {
      if (px == bombs[i].x && py == bombs[i].y) return;
    }

    for (var i = 0; i < powerUps.length; i++) {
      if (px == powerUps[i].x && py == powerUps[i].y) {
        if (powerUps[i].powLevel >= 1) {
          this.power++;
          document.getElementById("fire").innerHTML = this.power;
        }
        else {
          this.maxBombs++;
          document.getElementById("bombUp").innerHTML = this.maxBombs;
        }
        clearCase(powerUps[i].x, powerUps[i].y);
        powerUps.splice(powerUps.indexOf(powerUps[i]), 1);
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      if (px == enemies[i].x && py == enemies[i].y) { // game over
        gameOn = false;
        gameOver(score);
        clearCase(px, py);
        // clearInterval(loopEnemyMove);
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
    if (bx > SIZE) return true;
    if (by > SIZE) return true;

    new ExplodeEnemies(bx, by);
    new ExplodeWalls(bx, by);

    // decrease power up and the maximum number of bombs
    if (player.power > 1) {
      player.power--;
      document.getElementById("fire").innerHTML = this.power;
    }
    if (player.maxBombs > 1) {
      player.maxBombs--;
      document.getElementById("bombUp").innerHTML = this.maxBombs;
    }
  }
}

class Fire extends Block {
  constructor(x, y, powerLevel) {
    super(x, y);
    this.color = "blue";
    this.drawBlock();
    this.powLevel = powerLevel;
  }
}

class BombUp extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = "lightblue";
    this.drawBlock();
  }
}

class ExplodeWalls extends Block {
  constructor(x, y) {
    super(x, y);
    let randGen = randomHundred();
    for (let i = 0; i < walls.length; i++) {
      if (x == walls[i].x && y == walls[i].y && walls[i].isDestructible()) {
        if (randGen >= 90) powerUps.push(new Fire(walls[i].x, walls[i].y, minMaxRandom(2, 5)));
        else if (randGen <= 10) powerUps.push(new BombUp(walls[i].x, walls[i].y));
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
      gameOn = false;
      gameOver(score);
      clearCase(player.x, player.y);
    }
    for (let i = 0; i < enemies.length; i++) {
      if (this.x == enemies[i].x && this.y == enemies[i].y) {
        clearCase(enemies[i].x, enemies[i].y);
        enemies.splice(enemies.indexOf(enemies[i]), 1);
        score++;
        document.getElementById("score").innerHTML = score;
        if (enemies.length == 0) {
          youWin(score);
        }
      }
    }
  }
}

class GameOver extends Block {
  constructor(score) {
    super(0, 0);
    this.score = score;
    this.element = document.createElement("div");
    this.element.setAttribute("class", "game-over");
    this.element.innerHTML = "<h1>Game Over</h1><button type=\"button\" onclick=\"document.location.reload(true);\">Wanna try again ?</button><p>Score: " + this.score + "</p>";
    document.body.appendChild(this.element);
  }
}

class YouWin extends Block {
  constructor(score) {
    super(0, 0);
    this.score = score;
    this.element = document.createElement("div");
    this.element.setAttribute("class", "game-over");
    this.element.innerHTML = "<h1>YOU WIN !</h1><button type=\"button\" onclick=\"document.location.reload(true);\">Wanna try again ?</button><p>Score: " + this.score + "</p>";
    document.body.appendChild(this.element);
  }
}

// game timer
timeCount = function() {
  if (gameOn) {
    seconds++;
    if (seconds < 10) {
      document.getElementById("time").innerHTML = "00:0" + seconds;
    } else {
      document.getElementById("time").innerHTML = "00:" + seconds;
    }
  } else {
    clearInterval(loopTimeCount);
  }
}
let loopTimeCount = setInterval(timeCount, 1000);

// generate walls
for (let wx = 0; wx < SIZE; wx++) {
  for (let wy = 0; wy < SIZE; wy++) {
    if (wx % 2 == 1 && wy % 2 == 1) {
      walls.push(new Wall(wx, wy, false));
    }
  }
}

let count = 0;
while (count < 100) {

  let rwx = minMaxRandom(0, SIZE),
    rwy = minMaxRandom(0, SIZE),
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
  else if (rwx == SIZE && rwy == 0) continue;
  else if (rwx == (SIZE - 1) && rwy == 0) continue;
  else if (rwx == SIZE && rwy == 1) continue;
  else if (rwx == 0 && rwy == SIZE) continue;
  else if (rwx == 1 && rwy == SIZE) continue;
  else if (rwx == 0 && rwy == (SIZE - 1)) continue;
  else if (rwx == SIZE && rwy == SIZE) continue;
  else if (rwx == (SIZE - 1) && rwy == SIZE) continue;
  else if (rwx == SIZE && rwy == (SIZE - 1)) continue;
  walls.push(new Wall(rwx, rwy, true));
  count++;
}

// generate enemies
count = 0;
while (count < 5) {

  let rex = minMaxRandom(5, SIZE),
    rey = minMaxRandom(5, SIZE),
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

// move enemies randomly
enemyRandomMove = function() {
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
      if (ex >= SIZE + 1) continue;
      if (ey >= SIZE + 1) continue;

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

      for (let i = 0; i < powerUps.length; i++) {
        if (ex == powerUps[i].x && ey == powerUps[i].y) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      }

      if (ex == player.x && ey == player.y) { // game over
        stop = true;
        gameOn = false;
        gameOver(score);
        clearCase(player.x, player.y);
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
enemyRandomMove();
