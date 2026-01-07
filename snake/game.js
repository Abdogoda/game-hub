// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on screen width
const isMobile = window.innerWidth <= 480;
const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
const gridSize = 20;
let tileCount = isMobile ? 15 : (isTablet ? 20 : 25);
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// Game State
let gameActive = false;
let score = 0;
let highScore = 0;
let gameLoop = null;
let gameSpeed = 150;
let baseSpeed = 150;
let speedIncrement = 0;

// DOM Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const recordMessageEl = document.getElementById('recordMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const modalTitle = document.getElementById('modalTitle');

// Play sound helper using SoundManager
function playSound(soundName) {
    if (window.SoundManager && window.isSoundEnabled && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
    }
}

// Snake Object
let snake = [
    { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }
];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// Food Object
let food = { x: 0, y: 0 };

// Speed settings
const speedValues = [200, 150, 100, 70, 50];

// Update speed display
function updateSpeedDisplay() {
    const speedIndex = parseInt(speedSlider.value) - 1;
    const speedNames = [
        t('snake.speedVerySlow'),
        t('snake.speedSlow'),
        t('snake.speedMedium'),
        t('snake.speedFast'),
        t('snake.speedVeryFast')
    ];
    speedValue.textContent = speedNames[speedIndex];
    baseSpeed = speedValues[speedIndex];
}

// Speed slider change listener
speedSlider.addEventListener('input', updateSpeedDisplay);

// Load high score
function loadHighScore() {
    const saved = localStorage.getItem('snakeGameHighScore');
    if (saved) {
        highScore = parseInt(saved);
        highScoreEl.textContent = highScore;
    }
}

// Save high score
function saveHighScore() {
    localStorage.setItem('snakeGameHighScore', highScore);
    highScoreEl.textContent = highScore;
}

// Generate random food position
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Gradient for snake body
        const gradient = ctx.createLinearGradient(
            segment.x * gridSize,
            segment.y * gridSize,
            (segment.x + 1) * gridSize,
            (segment.y + 1) * gridSize
        );
        
        if (index === 0) {
            // Head color
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#45a049');
        } else {
            // Body color
            gradient.addColorStop(0, '#8BC34A');
            gradient.addColorStop(1, '#7CB342');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = '#FFFFFF';
            const eyeSize = 4;
            const eyeOffset = 5;
            
            // Determine eye position based on direction
            if (direction.x === 1) { // Moving right
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.x === -1) { // Moving left
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.y === -1) { // Moving up
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
            } else if (direction.y === 1) { // Moving down
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });
}

// Draw food
function drawFood() {
    // Draw apple
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2 - 3,
        food.y * gridSize + gridSize / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add stem
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(food.x * gridSize + gridSize / 2, food.y * gridSize + 3);
    ctx.lineTo(food.x * gridSize + gridSize / 2 + 2, food.y * gridSize);
    ctx.stroke();
}

// Update snake
function updateSnake() {
    // Update direction
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        animateScore();
        playSound('ding');
        generateFood();
        
        // Increase speed every 3 points (reduce interval by 5ms)
        if (score % 3 === 0 && gameSpeed > 30) {
            speedIncrement += 5;
            gameSpeed = Math.max(30, baseSpeed - speedIncrement);
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Animate score
function animateScore() {
    scoreEl.style.transform = 'scale(1.3)';
    scoreEl.style.color = '#4CAF50';
    
    setTimeout(() => {
        scoreEl.style.transform = 'scale(1)';
        scoreEl.style.color = '#ffd700';
    }, 200);
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw food
    drawFood();
    
    // Draw snake
    drawSnake();
}

// Update game
function update() {
    if (!gameActive) return;
    
    updateSnake();
    draw();
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameActive) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
    }
}

// Start game
function startGame() {
    gameActive = true;
    score = 0;
    
    // Play start sound
    playSound('raceStart');
    
    // Get selected speed from slider
    const speedIndex = parseInt(speedSlider.value) - 1;
    baseSpeed = speedValues[speedIndex];
    gameSpeed = baseSpeed;
    speedIncrement = 0;
    
    scoreEl.textContent = score;
    
    // Disable speed slider during game
    speedSlider.disabled = true;
    
    // Reset snake
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // Generate food
    generateFood();
    
    // Hide start button, show restart
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    
    // Start game loop
    gameLoop = setInterval(update, gameSpeed);
}

// End game
function endGame() {
    gameActive = false;
    
    // Re-enable speed slider
    speedSlider.disabled = false;
    
    // Clear game loop
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // Check high score
    const isNewRecord = score > highScore;
    if (isNewRecord) {
        highScore = score;
        saveHighScore();
    }
    
    // Play game over sound
    playSound('buzzer');
    
    // Show game over modal
    showGameOverModal(isNewRecord);
}

// Show game over modal
function showGameOverModal(isNewRecord) {
    finalScoreEl.textContent = score;
    
    if (isNewRecord && score > 0) {
        modalTitle.textContent = t('snake.newRecord');
        recordMessageEl.textContent = t('snake.newRecordMessage');
        playSound('successFanfare');
    } else {
        modalTitle.textContent = t('snake.gameOver');
        recordMessageEl.textContent = score > 0 ? `${t('snake.highScoreLabel')} ${highScore}` : t('snake.tryAgain');
    }
    
    gameOverModal.classList.add('show');
}

// Close modal
function closeModal() {
    gameOverModal.classList.remove('show');
}

// Reset game
function resetGame() {
    closeModal();
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    // Reset snake and draw
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    drawSnake();
    
    // Show start button
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    closeModal();
    startGame();
});

document.addEventListener('keydown', handleKeyPress);

// Close modal when clicking outside
gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        closeModal();
    }
});

// Initialize
loadHighScore();
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawGrid();
drawSnake();
