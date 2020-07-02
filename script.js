/* variables */
const GRID_SIZE = 18, // number of blocks per row and column
  BLOCK_SIZE = 40,
  CANVAS = document.getElementById("canvas"),
  CTX = CANVAS.getContext('2d'),
  BACKGROUND_COLOR = "#00af00",
  CYCLE_LOOP = [0, 1, 0, 2],
  FACING_DOWN = 0,
  FACING_UP = 3,
  FACING_LEFT = 2,
  FACING_RIGHT = 1;

CANVAS.width = BLOCK_SIZE * (GRID_SIZE + 1);
CANVAS.height = BLOCK_SIZE * (GRID_SIZE + 1);
CTX.fillStyle = BACKGROUND_COLOR;
CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

let walls = [],
  enemies = [],
  bombs = [],
  powerUps = [],
  gameOn = true,
  score = 0,
  // seconds = 0,
  // minutes = 0;
  animationTime = 60,
  loopIndex = 0,
  x = 0,
  y = 0,
  currentDirection = FACING_DOWN,
  playerSprite = new Image();

/* functions */
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
  CTX.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

minMaxRandom = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

randomHundred = function() {
  return Math.floor(Math.random() * 100);
}

scoreHandler = function(points) {
  score += points;
  document.getElementById("score").innerHTML = score;
}

youWin = function() {
  setTimeout(function() {
    new YouWin(score);
  }, 50);
}

gameOver = function() {
  if (!gameOn) {
    setTimeout(function() {
      new GameOver(score);
    }, 50);
  }
}

drawFrame = function(img, frameX, frameY, canvasX, canvasY) {
  CTX.drawImage(img, frameX * BLOCK_SIZE, frameY * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, canvasX, canvasY, BLOCK_SIZE, BLOCK_SIZE);
}

// images
megaman = function() {
  playerSprite.onload = setInterval(function() {
    player.drawPlayer();
  }, animationTime);
  playerSprite.src = "img/megaman.png";
  return playerSprite;
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
    CTX.fillRect(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
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
    this.image = megaman();
    // this.color = "#ffd700";
    // this.drawBlock();
    let that = this;
    document.onkeydown = function(event) {
      that.keyPressed(event);
    };
    this.power = 1;
    this.maxBombs = 1;
    this.activeBombs = 0;
  }
  drawPlayer = function() {
    CTX.fillStyle = this.color;
    drawFrame(this.image, CYCLE_LOOP[loopIndex], currentDirection, this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
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
      py = this.y,
      hasMoved = false;

    switch (keycode) {

      case 37: // left
        px--;
        currentDirection = FACING_LEFT;
        hasMoved = true;
        break;

      case 38: // up
        py--;
        currentDirection = FACING_UP;
        hasMoved = true;
        break;

      case 39: // right
        px++;
        currentDirection = FACING_RIGHT;
        hasMoved = true;
        break;

      case 40: // bottom
        py++;
        currentDirection = FACING_DOWN;
        hasMoved = true;
        break;

      case 32: // spacebar
        this.dropDaBomb();

      default:
        return;
    }

    if (!hasMoved) {
      currentLoopIndex = 0;
      currentDirection = FACING_DOWN;
    }

    if (hasMoved) {
      loopIndex++;
      if (loopIndex >= CYCLE_LOOP.length) loopIndex = 0;
    }

    // check border collision
    if (px < 0) return;
    if (py < 0) return;
    if (px >= GRID_SIZE + 1) return;
    if (py >= GRID_SIZE + 1) return;

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
          scoreHandler(10);
        }
        else {
          this.maxBombs++;
          document.getElementById("bombUp").innerHTML = this.maxBombs;
          scoreHandler(10);
        }
        clearCase(powerUps[i].x, powerUps[i].y);
        powerUps.splice(powerUps.indexOf(powerUps[i]), 1);
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      if (px == enemies[i].x && py == enemies[i].y) {
        gameOn = false;
        gameOver(score);
        clearCase(px, py);
      }
    }

    clearCase(this.x, this.y);
    this.x = px;
    this.y = py;
    // this.drawBlock();
    this.drawPlayer();
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
    if (bx > GRID_SIZE) return true;
    if (by > GRID_SIZE) return true;

    new ExplodeEnemies(bx, by);
    new ExplodeWalls(bx, by);

    // decrease power up and the maximum number of bombs
    if (player.power > 1) {
      player.power--;
      document.getElementById("fire").innerHTML = player.power;
      scoreHandler(25);
    }
    if (player.maxBombs > 1) {
      player.maxBombs--;
      document.getElementById("bombUp").innerHTML = player.maxBombs;
      scoreHandler(15);
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
        scoreHandler(2);
      }
    }
  }
}

class ExplodeEnemies extends Block {
  constructor(x, y) {
    super(x, y);
    if (this.x == player.x && this.y == player.y) {
      gameOn = false;
      scoreHandler(-5);
      gameOver(score);
      clearCase(player.x, player.y);
    }
    for (let i = 0; i < enemies.length; i++) {
      if (this.x == enemies[i].x && this.y == enemies[i].y) {
        clearCase(enemies[i].x, enemies[i].y);
        enemies.splice(enemies.indexOf(enemies[i]), 1);
        scoreHandler(10);
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
    this.time;
    this.element = document.createElement("div");
    this.element.setAttribute("class", "game-over");
    this.element.innerHTML = "<h1>game over!</h1><form method=\"post\" action=\"save_score.php\"><input type=\"hidden\" name=\"score\" value=\"" + this.score + "\"><input type=\"text\" name=\"nickname\" value=\"\"><button type=\"submit\" name=\"save\">save and quit</button></form><button type=\"button\" onclick=\"document.location.reload(true);\">Wanna try again ?</button><p>score: " + this.score + "</p><p>time: " + this.time + "</p>";
    document.body.appendChild(this.element);
  }
}

class YouWin extends Block {
  constructor(score) {
    super(0, 0);
    this.score = score;
    this.time;
    this.element = document.createElement("div");
    this.element.setAttribute("class", "game-won");
    this.element.innerHTML = "<h1>you win!</h1><form method=\"post\" action=\"save_score.php\"><input type=\"hidden\" name=\"score\" value=\"" + this.score + "\"><input type=\"text\" name=\"nickname\" value=\"\"><button type=\"submit\" name=\"save\">save and quit</button></form><button type=\"button\" onclick=\"document.location.reload(true);\">Wanna try again ?</button><p>score: " + this.score + "</p><p>time: " + this.time + "</p>";
    document.body.appendChild(this.element);
  }
}

// generate walls
for (let wx = 0; wx < GRID_SIZE; wx++) {
  for (let wy = 0; wy < GRID_SIZE; wy++) {
    if (wx % 2 == 1 && wy % 2 == 1) {
      walls.push(new Wall(wx, wy, false));
    }
  }
}

let count = 0;
while (count < 100) {

  let rwx = minMaxRandom(0, GRID_SIZE),
    rwy = minMaxRandom(0, GRID_SIZE),
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
  else if (rwx == GRID_SIZE && rwy == 0) continue;
  else if (rwx == (GRID_SIZE - 1) && rwy == 0) continue;
  else if (rwx == GRID_SIZE && rwy == 1) continue;
  else if (rwx == 0 && rwy == GRID_SIZE) continue;
  else if (rwx == 1 && rwy == GRID_SIZE) continue;
  else if (rwx == 0 && rwy == (GRID_SIZE - 1)) continue;
  else if (rwx == GRID_SIZE && rwy == GRID_SIZE) continue;
  else if (rwx == (GRID_SIZE - 1) && rwy == GRID_SIZE) continue;
  else if (rwx == GRID_SIZE && rwy == (GRID_SIZE - 1)) continue;
  walls.push(new Wall(rwx, rwy, true));
  count++;
}

// generate enemies
count = 0;
while (count < 5) {

  let rex = minMaxRandom(5, GRID_SIZE),
    rey = minMaxRandom(5, GRID_SIZE),
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
      if (ex >= GRID_SIZE + 1) continue;
      if (ey >= GRID_SIZE + 1) continue;

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

      if (ex == player.x && ey == player.y) {
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
