// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// Game State
let gameActive = false;
let currentLevel = 1;
let score = 0;
let bestLevel = 1;
let animationId = null;

// Player
const player = {
    x: 50,
    y: 50,
    size: 15,
    speed: 3,
    color: '#4CAF50'
};

// Goal
let goal = {
    x: 550,
    y: 550,
    size: 20,
    color: '#ffd700'
};

// Enemies
let enemies = [];

// Keys
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// DOM Elements
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const bestLevelEl = document.getElementById('bestLevel');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const successModal = document.getElementById('successModal');
const gameOverModal = document.getElementById('gameOverModal');
const completedLevelEl = document.getElementById('completedLevel');
const modalScoreEl = document.getElementById('modalScore');
const gameOverScoreEl = document.getElementById('gameOverScore');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const retryBtn = document.getElementById('retryBtn');
const successSound = document.getElementById('successSound');
const failSound = document.getElementById('failSound');

// Play sound effect
function playSoundEffect(sound) {
    if (window.playGameSound) {
        window.playGameSound(sound);
    } else if (window.isSoundEnabled && window.isSoundEnabled() && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Load best level
function loadBestLevel() {
    const saved = localStorage.getItem('stealthGameBestLevel');
    if (saved) {
        bestLevel = parseInt(saved);
        bestLevelEl.textContent = bestLevel;
    }
}

// Save best level
function saveBestLevel() {
    localStorage.setItem('stealthGameBestLevel', bestLevel);
    bestLevelEl.textContent = bestLevel;
}

// Generate level
function generateLevel(level) {
    enemies = [];
    
    // Reset player position
    player.x = 50;
    player.y = 50;
    
    // Place goal in bottom right area with some variation
    goal.x = 520 + Math.random() * 30;
    goal.y = 520 + Math.random() * 30;
    
    // Generate enemies based on level
    const enemyCount = Math.min(2 + level, 8);
    
    for (let i = 0; i < enemyCount; i++) {
        const enemy = {
            x: 150 + Math.random() * 300,
            y: 150 + Math.random() * 300,
            size: 12,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: 0.01 + Math.random() * 0.02,
            visionRange: 150 + level * 10,
            visionAngle: Math.PI / 3, // 60 degrees
            color: '#ff4444'
        };
        
        // Make sure enemy doesn't spawn on player or goal
        if (
            Math.abs(enemy.x - player.x) < 100 &&
            Math.abs(enemy.y - player.y) < 100
        ) {
            i--;
            continue;
        }
        
        enemies.push(enemy);
    }
}

// Draw player
function drawPlayer() {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(player.x + 2, player.y + 2, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Player circle
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Player outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Player direction indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw goal
function drawGoal() {
    // Glow effect
    const gradient = ctx.createRadialGradient(goal.x, goal.y, 0, goal.x, goal.y, goal.size * 2);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Goal circle
    ctx.fillStyle = goal.color;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Goal outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw enemy
function drawEnemy(enemy) {
    // Vision cone
    ctx.fillStyle = 'rgba(255, 68, 68, 0.15)';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y);
    ctx.arc(
        enemy.x,
        enemy.y,
        enemy.visionRange,
        enemy.angle - enemy.visionAngle / 2,
        enemy.angle + enemy.visionAngle / 2
    );
    ctx.closePath();
    ctx.fill();
    
    // Vision cone outline
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Enemy body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Eye direction
    const eyeX = enemy.x + Math.cos(enemy.angle) * enemy.size * 0.6;
    const eyeY = enemy.y + Math.sin(enemy.angle) * enemy.size * 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Check if point is in vision cone
function isInVisionCone(px, py, enemy) {
    const dx = px - enemy.x;
    const dy = py - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > enemy.visionRange) return false;
    
    const angleToPoint = Math.atan2(dy, dx);
    let angleDiff = angleToPoint - enemy.angle;
    
    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    return Math.abs(angleDiff) <= enemy.visionAngle / 2;
}

// Update game
function update() {
    if (!gameActive) return;
    
    // Move player
    if (keys.ArrowUp || keys.w) player.y = Math.max(player.size, player.y - player.speed);
    if (keys.ArrowDown || keys.s) player.y = Math.min(canvas.height - player.size, player.y + player.speed);
    if (keys.ArrowLeft || keys.a) player.x = Math.max(player.size, player.x - player.speed);
    if (keys.ArrowRight || keys.d) player.x = Math.min(canvas.width - player.size, player.x + player.speed);
    
    // Update enemies
    enemies.forEach(enemy => {
        enemy.angle += enemy.rotationSpeed;
        
        // Check if player is spotted
        if (isInVisionCone(player.x, player.y, enemy)) {
            gameOver();
        }
    });
    
    // Check if reached goal
    const dx = player.x - goal.x;
    const dy = player.y - goal.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < player.size + goal.size) {
        levelComplete();
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Draw goal
    drawGoal();
    
    // Draw enemies
    enemies.forEach(drawEnemy);
    
    // Draw player
    drawPlayer();
}

// Game loop
function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameActive = true;
    
    generateLevel(currentLevel);
    
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    
    gameLoop();
}

// Level complete
function levelComplete() {
    gameActive = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Update score
    score += currentLevel * 100;
    scoreEl.textContent = score;
    
    // Update best level
    if (currentLevel > bestLevel) {
        bestLevel = currentLevel;
        saveBestLevel();
    }
    
    playSoundEffect(successSound);
    
    // Show success modal
    if (completedLevelEl) {
        completedLevelEl.textContent = t('stealth.levelCleared').replace('{level}', currentLevel);
    }
    modalScoreEl.textContent = score;
    successModal.classList.add('show');
}

// Game over
function gameOver() {
    gameActive = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    playSoundEffect(failSound);
    
    // Show game over modal
    gameOverScoreEl.textContent = score;
    gameOverModal.classList.add('show');
}

// Next level
function nextLevel() {
    currentLevel++;
    levelEl.textContent = currentLevel;
    
    successModal.classList.remove('show');
    
    gameActive = true;
    generateLevel(currentLevel);
    gameLoop();
}

// Retry level
function retryLevel() {
    gameOverModal.classList.remove('show');
    
    gameActive = true;
    generateLevel(currentLevel);
    gameLoop();
}

// Reset game
function resetGame() {
    currentLevel = 1;
    score = 0;
    
    levelEl.textContent = currentLevel;
    scoreEl.textContent = score;
    
    gameOverModal.classList.remove('show');
    successModal.classList.remove('show');
    
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
    
    generateLevel(currentLevel);
    draw();
}

// Key event handlers
function handleKeyDown(e) {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
nextLevelBtn.addEventListener('click', nextLevel);
retryBtn.addEventListener('click', retryLevel);

// Close modals when clicking outside
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('show');
    }
});

gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        gameOverModal.classList.remove('show');
    }
});

// Initialize
loadBestLevel();
generateLevel(currentLevel);
draw();
