import { Game } from "../lib/game.js";
import { updateInput, isActionJustPressed } from "../lib/input.js";
import { lerp } from "../lib/math.js";
import { Emitter, Particle } from "../lib/particle2.js"
import { AudioStream } from "../lib/audio.js";
import { RectangleCollisionShape2D, checkCollision } from "../lib/physics.js";

Game.createWindow(320, 180, 2);
Game.addLayer("main", 1, false);
Game.addLayer("particle", 2);
Game.addLayer("fx", 3);

let layers = Game.layers;

let urls = {
    start1: "./src/assets/sprites/start1.png",
    start2: "./src/assets/sprites/start2.png",
    over1: "./src/assets/sprites/over1.png",
    over2: "./src/assets/sprites/over2.png",
    over3: "./src/assets/sprites/over3.png",
    bg: "./src/assets/sprites/background.png",

    token1: "./src/assets/sprites/token1.png",
    token2: "./src/assets/sprites/token2.png",
    token3: "./src/assets/sprites/token3.png",
    arrow1: "./src/assets/sprites/arrow1.png",
    arrow2: "./src/assets/sprites/arrow2.png",

    p1: "./src/assets/sprites/particle1.png",
};

// Import image files to be used as textures in game;
await Game.preloadAll(urls)

let textures = Game.textures;

let sfxDrop = new AudioStream("./src/assets/sounds/drop.wav");
let sfxLand = new AudioStream("./src/assets/sounds/land.wav");
let sfxConnect = new AudioStream("./src/assets/sounds/connect.wav");


class Token {
    constructor(id, tokenTexture, arrowTexture) {
        this.id = id;
        this.tokenTexture = tokenTexture;
        this.arrowTexture = arrowTexture;

        this.x;
        this.y = 8;
        // target will be used for drop animation;
        this.targetY;

        this.animPlaying = false;
        this.animProgress = 0;
        this.animSpeed = 2;
    }
    update(deltaTime) {
        if (this.animPlaying) {
            this.animProgress += deltaTime * this.animSpeed;
            this.y = lerp(8, this.targetY, this.animProgress, "easeInCubic");
    
            // Animation finished, reset properties, update board and play sfx;
            if (this.animProgress >= 1) {
                sfxLand.play(1);

                this.animPlaying = false;
                this.animProgress = 0;
                this.y = 8;
                board[this.row][this.col] = this.id;

                // Check if 4 connected and start connect animation;
                let connected = areFourConnected(this.id);
                if (connected) {
                    sfxConnect.play(1);

                    connectAnimPlaying = true;
                    animBoardPositions = connected;
                    winner = this.id;
                } else {
                    nextTurn()
                };
            }
            return;
        }

        // Get current column being hovered
        for (let col = 0; col < boardWidth; col++) {
            let x = boardXTable[col];
            if (Game.mousePos.x >= x && Game.mousePos.x <= x + 16) {
                this.x = x;

                if (isActionJustPressed("leftClick")) {
                    this.placeToken(col);
                    return;
                }
            }
        }

    }

    placeToken(col) {
        // Check Column from bottom to top to find empty spot;
        let row = boardHeight - 1;
        while (row >= 0) {
            if (board[row][col] === 0) {
                sfxDrop.play(1);
                this.targetY = boardYTable[row];
                this.animPlaying = true;
                this.row = row;
                this.col = col;
                break;
            }
            row--;
        }
    }

    draw(ctx) {
        if (this.animPlaying) {
            ctx.drawImage(this.tokenTexture, this.x, this.y);
            return;
        }
        ctx.drawImage(this.arrowTexture, this.x + 5, 8);
    }
}

let board = [];
let boardWidth = 7;
let boardHeight = 6;
// Table is used for an easy way of getting the correct x and y based on the board row and col;
let boardXTable = [92, 112, 132, 152, 172, 192, 212];
let boardYTable = [30, 50, 70, 90, 110, 130];

let player1 = new Token(1, textures.token1, textures.arrow1);
let player2 = new Token(2, textures.token2, textures.arrow2);
let currentPlaying = 1;
let winner = 0;

let connectAnimPlaying = false;
let animationTimer = 0;
let animBoardPositions = [];

let particles = [];
let emitter = new Emitter();

for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
    
}

let particleConfig = {
    texture: textures.p1,
    maxFrames: 1,
    frameWidth: 10,
    frameHeight: 10,
    
    direction: { x: -1, y: 1 },
    velocity: 20,
    gravity: 0,
    spread: 90,
    
    scale: 0.8,
    randomScale: true,
    
    angle: 90,
    angularVelocity: 100,
    randomAngle: true,
    
    lifetime: 12,

    emissionShape: { x: Game.width, y: 10 },
    oneshot: false,
    explosive: false,
    maxParticles: 20,
}


function init() {
    board = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ]

    currentPlaying = 1;

    emitter.start();
}
function nextTurn() {
    currentPlaying = currentPlaying === 1 ? 2 : 1;
}
function areFourConnected(id) {
    // If connect happens, return list with row and col of each token to be animated;

    // Horizontal Check
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth - 3; col++) {
            if (
                board[row][col] === id &&
                board[row][col + 1] === id &&
                board[row][col + 2] === id &&
                board[row][col + 3] === id
            ) {
                return [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]];
            }
        }
    }
    // Vertical Check
    for (let col = 0; col < boardWidth; col++) {
        for (let row = 0; row < boardHeight - 3; row++) {
            if (
                board[row][col] === id &&
                board[row + 1][col] === id &&
                board[row + 2][col] === id &&
                board[row + 3][col] === id
            ) {
                return [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]];
            }
        }
    }
    // Diagonal Check (Ascending)
    for (let col = 3; col < boardWidth; col++) {
        for (let row = 0; row < boardHeight - 3; row++) {
            if (
                board[row][col] === id &&
                board[row + 1][col - 1] === id &&
                board[row + 2][col - 2] === id &&
                board[row + 3][col - 3] === id
            ) {
                return [[row,col],
                        [row + 1,col - 1],
                        [row + 2,col - 2],
                        [row + 3,col - 3]];
            }
        }
    }
    // Diagonal Check (Descending)
    for (let col = 3; col < boardWidth; col++) {
        for (let row = 3; row < boardHeight; row++) {
            if (
                board[row][col] === id &&
                board[row - 1][col - 1] === id &&
                board[row - 2][col - 2] === id &&
                board[row - 3][col - 3] === id
            ) {
                return [[row,col],
                        [row - 1,col - 1],
                        [row - 2,col - 2],
                        [row - 3,col - 3]];
            }
        }
    }
    return false;
}
function isBoardFull() {
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth; col++) {
            if (board[row][col] === 0) {
                return false;
            }
        }
    }
    return true;
}
function update(deltaTime) {
    emitter.update(deltaTime, Game.width, 0, particleConfig, particles);

    // Winner 3 is draw;
    if (isBoardFull()) {
        winner = 3;
        Game.setGameState("gameover");
    }

    // Stop updating tokens while connect animation is playing;
    if (connectAnimPlaying) {
        animateConnected(deltaTime);
        return;
    }

    if (currentPlaying === 1) {
        player1.update(deltaTime);

    } else if (currentPlaying === 2) {
        player2.update(deltaTime);
    }

}

function animateConnected(deltaTime) {
    animationTimer += deltaTime;

    layers.fx.clearRect(0, 0, Game.width, Game.height);

    const animationSteps = [
        ["show", 0.2],
        ["hide", 0.4],
        ["show", 0.6],
        ["hide", 0.8],
        ["show", 1.0],
        ["end", 1.2],
    ];

    for (const [action, time] of animationSteps) {
        if (animationTimer < time) {
            if (action === "show") {
                drawConnectedAnim();
            }
            if (action === "end") {
                connectAnimPlaying = false;
                animationTimer = 0;
                Game.setGameState("gameover");
            }
            break;
        }
    }
}
function drawConnectedAnim() {
    for (const [row, col] of animBoardPositions) {
        let x = boardXTable[col];
        let y = boardYTable[row];

        layers.fx.drawImage(textures.token3, x, y);
    }
}
function draw() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.main.drawImage(textures.bg, 0, 0);

    layers.particle.clearRect(0, 0, Game.width, Game.height);
    emitter.draw(layers.main);

    // Draw token objects;
    if (currentPlaying === 1) {
        player1.draw(layers.main);

    } else if (currentPlaying === 2) {
        player2.draw(layers.main);
    }

    // Draw board;
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth; col++) {
            if (board[row][col] === 1) {
                layers.main.drawImage(textures.token1, boardXTable[col], boardYTable[row]);
            } else if (board[row][col] === 2) {
                layers.main.drawImage(textures.token2, boardXTable[col], boardYTable[row]);
            }
        }
    }
}


function drawStart() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.fx.clearRect(0, 0, Game.width, Game.height);

    let startButtomCollider = new RectangleCollisionShape2D(125, 97, 65, 20);

    if (checkCollision(Game.mousePos, startButtomCollider)) {
        if ((isActionJustPressed("start") || isActionJustPressed("leftClick")) && Game.state === "start") {
            Game.setGameState("run");
            init();
        }
        layers.main.drawImage(textures.start2, 0, 0);
    } else {
        layers.main.drawImage(textures.start1, 0, 0);
    }
};
function drawGameOver() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.fx.clearRect(0, 0, Game.width, Game.height);

    if (winner === 1) {
        layers.main.drawImage(textures.over1, 0, 0);
    } else if (winner === 2) {
        layers.main.drawImage(textures.over2, 0, 0);
    } else {
        layers.main.drawImage(textures.over3, 0, 0);
    }
};


// Gameloop
let prevTime = performance.now();
function gameLoop() {
    let currentTime = performance.now();
    let deltaTime = (currentTime - prevTime) / 1000;
    prevTime = currentTime;

    updateInput();

    if (Game.state === "start") { drawStart(); }
    else if (Game.state === "gameover") { drawGameOver(); }
    else if (Game.state === "run") { 
        update(deltaTime);
        draw();
    }

    // Handle States
    
    if ((isActionJustPressed("restart") || isActionJustPressed("leftClick")) && Game.state === "gameover") {
        Game.setGameState("start"); 
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
