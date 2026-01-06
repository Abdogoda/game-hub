// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 600;
canvas.height = 500;

// Game State
let gameActive = false;
let score = 0;
let highScore = 0;
let animationId = null;

// DOM Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const recordMessageEl = document.getElementById('recordMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const modalTitle = document.getElementById('modalTitle');
const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');

// Player Object
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -12,
    grounded: false,
    jumpCount: 0,
    maxJumps: 3,
    color: '#FF6B6B'
};

// Platforms Array
let platforms = [];
const platformWidth = 80;
const platformHeight = 15;
const platformSpeed = 2;

// Load high score
function loadHighScore() {
    const saved = localStorage.getItem('platformJumperHighScore');
    if (saved) {
        highScore = parseInt(saved);
        highScoreEl.textContent = highScore;
    }
}

// Save high score
function saveHighScore() {
    localStorage.setItem('platformJumperHighScore', highScore);
    highScoreEl.textContent = highScore;
}

// Play sound effect
function playSoundEffect(sound) {
    if (window.playGameSound) {
        window.playGameSound(sound);
    } else if (window.isSoundEnabled && window.isSoundEnabled() && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Create initial platforms
function createInitialPlatforms() {
    platforms = [];
    
    // Ground platform
    platforms.push({
        x: 0,
        y: canvas.height - 50,
        width: canvas.width,
        height: 20,
        scored: false
    });
    
    // Starting platforms
    for (let i = 1; i < 5; i++) {
        platforms.push({
            x: i * 150,
            y: canvas.height - 100 - Math.random() * 150,
            width: platformWidth,
            height: platformHeight,
            scored: false
        });
    }
}

// Generate new platform
function generatePlatform() {
    const lastPlatform = platforms[platforms.length - 1];
    const minY = 100;
    const maxY = canvas.height - 100;
    const minGap = 100;
    const maxGap = 200;
    
    const newX = lastPlatform.x + minGap + Math.random() * (maxGap - minGap);
    const newY = minY + Math.random() * (maxY - minY);
    
    platforms.push({
        x: newX,
        y: newY,
        width: platformWidth,
        height: platformHeight,
        scored: false
    });
}

// Draw player
function drawPlayer() {
    // Body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 22, player.y + 10, 8, 8);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 12, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 24, player.y + 12, 4, 4);
    
    // Mouth
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 12, player.y + 25, 16, 3);
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
        
        // Platform
        const gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
    });
}

// Update player
function updatePlayer() {
    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // Reset grounded
    player.grounded = false;
    
    // Check platform collision
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10 &&
            player.velocityY > 0) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.jumpCount = 0;
            
            // Score when landing on new platform
            if (!platform.scored && platform !== platforms[0]) {
                platform.scored = true;
                score++;
                scoreEl.textContent = score;
                animateScore();
            }
        }
    });
    
    // Check if player fell off screen
    if (player.y > canvas.height) {
        endGame();
    }
}

// Update platforms
function updatePlatforms() {
    // Move platforms left
    platforms.forEach(platform => {
        platform.x -= platformSpeed;
    });
    
    // Remove platforms that are off screen
    platforms = platforms.filter(platform => platform.x + platform.width > -100);
    
    // Generate new platforms
    if (platforms[platforms.length - 1].x < canvas.width) {
        generatePlatform();
    }
}

// Jump
function jump() {
    if (gameActive && player.jumpCount < player.maxJumps) {
        player.velocityY = player.jumpPower;
        player.grounded = false;
        player.jumpCount++;
        playSoundEffect(jumpSound);
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

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 80, 40, 0, Math.PI * 2);
    ctx.arc(160, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(400, 120, 25, 0, Math.PI * 2);
    ctx.arc(425, 120, 35, 0, Math.PI * 2);
    ctx.arc(450, 120, 25, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    if (!gameActive) return;
    
    // Clear canvas
    drawBackground();
    
    // Update
    updatePlayer();
    updatePlatforms();
    
    // Draw
    drawPlatforms();
    drawPlayer();
    
    // Continue loop
    animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameActive = true;
    score = 0;
    scoreEl.textContent = score;
    
    // Reset player
    player.x = 100;
    player.y = 300;
    player.velocityY = 0;
    player.grounded = false;
    player.jumpCount = 0;
    
    // Create platforms
    createInitialPlatforms();
    
    // Hide start button, show restart
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    
    // Start game loop
    gameLoop();
}

// End game
function endGame() {
    gameActive = false;
    
    // Cancel animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Check high score
    const isNewRecord = score > highScore;
    if (isNewRecord) {
        highScore = score;
        saveHighScore();
    }
    
    // Play game over sound
    playSoundEffect(gameOverSound);
    
    // Show game over modal
    showGameOverModal(isNewRecord);
}

// Show game over modal
function showGameOverModal(isNewRecord) {
    finalScoreEl.textContent = score;
    
    if (isNewRecord && score > 0) {
        modalTitle.textContent = '🎉 New Record! 🎉';
        recordMessageEl.textContent = '⭐ You set a new high score! ⭐';
    } else {
        modalTitle.textContent = 'Game Over!';
        recordMessageEl.textContent = score > 0 ? `High Score: ${highScore}` : 'Try again!';
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
    drawBackground();
    
    // Reset player to starting position
    player.x = 100;
    player.y = 300;
    player.velocityY = 0;
    player.jumpCount = 0;
    
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

// Jump controls
canvas.addEventListener('click', jump);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Close modal when clicking outside
gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        closeModal();
    }
});

// Initialize
loadHighScore();
drawBackground();

// Draw initial player
player.y = canvas.height - 90;
drawPlayer();

// Draw initial platforms
createInitialPlatforms();
drawPlatforms();
