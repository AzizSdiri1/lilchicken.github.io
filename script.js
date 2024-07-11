const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;


const playerImg = new Image();
playerImg.src = 'player.png';
const playerImg2 = new Image();
playerImg2.src = 'player2.png';
const platformImg = new Image();
platformImg.src = 'platform.png';
const enemyImg = new Image();
enemyImg.src = 'enemy.png';
const enemyImg2 = new Image();
enemyImg2.src = 'enemy2.png';
class Square {
    constructor(x, y, width, height, dy, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dy = dy;
        this.squareImg = new Image();
        this.squareImg.src = color;
    }

    draw() {
        ctx.drawImage(this.squareImg, this.x, this.y, this.width, this.height);
    }

    update() {
        if (moving) {
            this.y += this.dy / 8;
        }
    }
}
class Bush {
    constructor(x, y, width, height, dy, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dy = dy;
        this.bushImg = new Image();
        this.bushImg.src = image;
    }

    draw() {
        ctx.drawImage(this.bushImg, this.x, this.y, this.width, this.height);
    }

    update() {
        if (moving) {
            this.y += this.dy;
        }
    }
}

const gravity = 0.3;
const jump = -10;
let score = 0;
let highScore = 0;
let timer = 0;
let current = true;
let moving = false;
let starting = false;
let ending = true;

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    color: 'blue',
    onPlatform: false
};

let platforms = [];
const platformCount = 6;
let enemies = [];
let bushes = [
    new Bush(0, canvas.height - 100, 100, 100, 0.4, 'bush.png'),
    new Bush(canvas.width - 100, canvas.height - 100, 100, 100, 0.4, 'bush2.png')
];
let squares = [
    new Square(canvas.width / 2, 50, 100, 100, 0.4, 'square.png')
];

const keys = {};


class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.touched = false;
    }

    draw() {
        ctx.drawImage(platformImg, this.x, this.y, this.width, this.height);
    }
}


class Enemy {
    constructor(x, y, width, height, color, dy) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.dy = dy;
    }

    draw() {
        timer++;
        if (timer > 25) {
            current = !current;
            timer = 0;
        }
        ctx.drawImage(current ? enemyImg : enemyImg2, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.dy;
    }
}



function createPlatforms() {
    let spacing = canvas.height / platformCount;
    for (let i = 0; i < platformCount; i++) {
        let p = new Platform(Math.random() * (canvas.width - 100), spacing * i, 100, 15, 'green');
        platforms.push(p);
    }
}

function createEnemies() {
    for (let i = 0; i < 2; i++) {
        let x = Math.random() * (canvas.width - 50);
        let y = Math.random() * -canvas.height;
        let dy = Math.random() * 2 + 1;
        let enemy = new Enemy(x, y, 40, 80, 'red', dy);
        enemies.push(enemy);
    }
}

function resetGame() {
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height / 2 - 25;
    player.dx = 0;
    player.dy = 0;
    moving = false;
    platforms = [];
    squares[0].y = 50;
    bushes[0].y = canvas.height - 100;
    bushes[1].y = canvas.height - 100;
    let newPlatform = new Platform(0, canvas.height-30 , canvas.width, 100, 'yellow');
    platforms.push(newPlatform);
    enemies = [];
    createEnemies();
    createPlatforms();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.x += player.dx;
    player.dx *= 0.9;

    player.y += player.dy;
    player.dy += gravity;

    if (player.y > canvas.height) {
        if (score > highScore) {
            highScore = score;
        }
        score = 0;
        reset();
    }

    if (player.x > canvas.width) player.x = -player.width;
    else if (player.x + player.width < 0) player.x = canvas.width;

    squares.forEach(square => {
        square.update();
        square.draw();
    });

    platforms.forEach((platform, index) => {
        platform.draw();
        if (moving) platform.y += 0.4;

        if (player.dy > 0 &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            player.dy = 0;
            player.onPlatform = true;
            if (!platform.touched) score++;
            platform.touched = true;
        }

        if (platform.y > canvas.height) {
            platforms.splice(index, 1);
            let newPlatform = new Platform(Math.random() * (canvas.width - 100), 0, 100, 15, 'green');
            platforms.push(newPlatform);
        }
    });

    enemies.forEach((enemy, i) => {
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            let x = Math.random() * (canvas.width - 50);
            let y = Math.random() * -canvas.height;
            let dy = Math.random() * 2 + 1;
            let newenemy = new Enemy(x, y, 40, 80, 'red', dy);
            enemies.push(newenemy);
        }
    });

    bushes.forEach(bush => {
        bush.update();
        bush.draw();
    });

    drawPlayer();
    drawScore();
    checkCollisions();

    requestAnimationFrame(update);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawScore() {
    document.getElementById('nom').textContent = `Name : ${name}`;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('highScore').textContent = `High Score: ${highScore}`;
}

function checkCollisions() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            if (score > highScore) {
                highScore = score;
            }
            score = 0;
            reset();
        }
    });
}

function jumping() {
    if (player.onPlatform) {
        player.dy = jump;
        player.onPlatform = false;
    }
    moving = true;
}

function moveLeft() {
    if (player.dx > -5) {
        player.dx -= 1;
    }
}

function moveRight() {
    if (player.dx < 5) {
        player.dx += 1;
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'ArrowLeft') {
        playerImg.src = 'player2.png';
    } else if (e.code === 'ArrowRight') {
        playerImg.src = 'player.png';
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function handleMovement() {
    if (keys['ArrowLeft']) moveLeft();
    if (keys['ArrowRight']) moveRight();
    if (keys['Space']) jumping();
}

function start() {
    name = document.getElementById('name').value;
    document.getElementById('startScreen').style.display = 'none';
    update();
}

function reset() {
    ending = false;
    starting = false;
    document.getElementById('deathscreen').style.display = 'flex';
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        if (!starting) {
            starting = true;
            if (ending) {
                start();
            } else {
                document.getElementById('deathscreen').style.display = 'none';
                resetGame();
            }
        }
    }
});

createPlatforms();
createEnemies();
resetGame()
setInterval(handleMovement, 1000 / 60);
