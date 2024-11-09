const canvas = document.getElementById('game-board');
const nextCanvas = document.getElementById('next-tetrimino');
const ctx = canvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const BOARD = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let score = 0;
let currentTetrimino;
let nextTetrimino;
let gameOver = false;


const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];
const COLORS = ['cyan', 'purple', 'red', 'green', 'yellow', 'orange', 'blue'];


function init() {
    currentTetrimino = getRandomTetrimino();
    nextTetrimino = getRandomTetrimino();
    drawBoard();
    drawNextTetrimino();
    update();
}


function getRandomTetrimino() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[index],
        color: COLORS[index],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}


function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (BOARD[row][col]) {
                ctx.fillStyle = BOARD[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}


function drawTetrimino(tetrimino) {
    ctx.fillStyle = tetrimino.color;
    for (let row = 0; row < tetrimino.shape.length; row++) {
        for (let col = 0; col < tetrimino.shape[row].length; col++) {
            if (tetrimino.shape[row][col]) {
                ctx.fillRect(
                    (tetrimino.x + col) * BLOCK_SIZE,
                    (tetrimino.y + row) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        }
    }
}


function rotate(tetrimino) {
    const N = tetrimino.shape.length;
    const newShape = Array.from({ length: N }, () => Array(N).fill(0));
    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            newShape[col][N - 1 - row] = tetrimino.shape[row][col];
        }
    }
    tetrimino.shape = newShape;
}


function hasCollision(tetrimino, dx, dy) {
    for (let row = 0; row < tetrimino.shape.length; row++) {
        for (let col = 0; col < tetrimino.shape[row].length; col++) {
            if (
                tetrimino.shape[row][col] &&
                (BOARD[tetrimino.y + row + dy] && BOARD[tetrimino.y + row + dy][tetrimino.x + col + dx]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}


function placeTetrimino(tetrimino) {
    tetrimino.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                BOARD[tetrimino.y + i][tetrimino.x + j] = tetrimino.color;
            }
        });
    });
}

let lastFallTime = 0;        // Track last move down time
const fallingSpeed = 500;     // Speed of Tetrimino fall in milliseconds

function update(timestamp) {
    if (gameOver) return;

    // Check if enough time has passed to move the Tetrimino down
    if (timestamp - lastFallTime >= fallingSpeed) {
        moveDown();
        lastFallTime = timestamp; // Reset the last fall time
    }

    drawBoard();
    drawTetrimino(currentTetrimino);
    requestAnimationFrame(update);
}


function moveDown() {
    if (!hasCollision(currentTetrimino, 0, 1)) {
        currentTetrimino.y++;
    } else {
        placeTetrimino(currentTetrimino);
        checkLines();
        currentTetrimino = nextTetrimino;
        nextTetrimino = getRandomTetrimino();
        if (hasCollision(currentTetrimino, 0, 0)) {
            gameOver = true;
            alert('Game Over');
        }
    }
}

function checkLines() {
    let lines = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (BOARD[row].every(cell => cell !== 0)) {
            BOARD.splice(row, 1);
            BOARD.unshift(Array(COLS).fill(0));
            lines++;
        }
    }
    if (lines > 0) {
        score += lines * 10;
        scoreElement.innerText = score;
    }
}


function drawNextTetrimino() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextTetrimino.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                nextCtx.fillStyle = nextTetrimino.color;
                nextCtx.fillRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}


document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && !hasCollision(currentTetrimino, -1, 0)) currentTetrimino.x--;
    if (event.key === 'ArrowRight' && !hasCollision(currentTetrimino, 1, 0)) currentTetrimino.x++;
    if (event.key === 'ArrowDown') moveDown();
    if (event.key === 'ArrowUp') rotate(currentTetrimino);
});

init();
