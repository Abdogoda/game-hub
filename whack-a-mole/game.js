// Game State
let score = 0;
let timeLeft = 30;
let highScore = 0;
let gameActive = false;
let moleTimer = null;
let countdownTimer = null;
let currentMole = null;

// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// Play sound helper using SoundManager
function playSound(soundName) {
    if (window.SoundManager && window.isSoundEnabled && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
    }
}

// DOM Elements
const scoreEl = document.getElementById('score');
const timeLeftEl = document.getElementById('timeLeft');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameBoard = document.getElementById('gameBoard');
const holes = document.querySelectorAll('.hole');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const recordMessageEl = document.getElementById('recordMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('whackAMoleHighScore');
    if (saved) {
        highScore = parseInt(saved);
        highScoreEl.textContent = highScore;
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('whackAMoleHighScore', highScore);
    highScoreEl.textContent = highScore;
}

// Get random hole
function getRandomHole() {
    const availableHoles = Array.from(holes).filter(hole => !hole.classList.contains('active'));
    if (availableHoles.length === 0) return null;
    return availableHoles[Math.floor(Math.random() * availableHoles.length)];
}

// Get random time for mole appearance
function getRandomTime(min, max) {
    return Math.random() * (max - min) + min;
}

// Show mole
function showMole() {
    if (!gameActive) return;

    // Hide previous mole if any
    if (currentMole) {
        currentMole.classList.remove('active');
    }

    // Get random hole
    const hole = getRandomHole();
    if (!hole) return;

    // Show mole
    hole.classList.add('active');
    currentMole = hole;
    
    // Play mole appearing sound
    playSound('boing');

    // Hide mole after random time
    const showTime = getRandomTime(400, 900);
    moleTimer = setTimeout(() => {
        if (hole.classList.contains('active') && !hole.classList.contains('whacked')) {
            hole.classList.remove('active');
            currentMole = null;
            showMole(); // Show next mole
        }
    }, showTime);
}

// Whack mole
function whackMole(e) {
    if (!gameActive) return;
    
    const hole = e.currentTarget;
    
    if (hole.classList.contains('active') && !hole.classList.contains('whacked')) {
        // Mark as whacked
        hole.classList.add('whacked');
        
        // Update score
        score++;
        scoreEl.textContent = score;
        
        // Animate score
        animateScore();
        
        // Show score popup
        showScorePopup(hole, '+1');
        
        // Play hit sound
        playSound('hit');
        
        // Remove active and whacked classes
        setTimeout(() => {
            hole.classList.remove('active', 'whacked');
            currentMole = null;
            
            // Show next mole
            if (gameActive) {
                showMole();
            }
        }, 300);
        
        // Clear the hide timer
        clearTimeout(moleTimer);
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

// Show score popup
function showScorePopup(hole, text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    
    const rect = hole.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = rect.left + rect.width / 2 + 'px';
    popup.style.top = rect.top + 'px';
    popup.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// Start countdown
function startCountdown() {
    countdownTimer = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;
        
        // Beep sound for last 5 seconds
        if (timeLeft <= 5 && timeLeft > 0) {
            playSound('beep');
        }
        
        // Warning when time is low
        if (timeLeft <= 10) {
            timeLeftEl.classList.add('warning');
        }
        
        // Game over
        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

// Start game
function startGame() {
    // Reset state
    score = 0;
    timeLeft = 30;
    gameActive = true;
    
    // Play start sound
    playSound('raceStart');
    
    // Update UI
    scoreEl.textContent = score;
    timeLeftEl.textContent = timeLeft;
    timeLeftEl.classList.remove('warning');
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    
    // Start countdown
    startCountdown();
    
    // Show first mole
    showMole();
}

// End game
function endGame() {
    gameActive = false;
    
    // Clear timers
    clearTimeout(moleTimer);
    clearInterval(countdownTimer);
    
    // Hide any active moles
    holes.forEach(hole => {
        hole.classList.remove('active', 'whacked');
    });
    
    // Update high score
    const isNewRecord = score > highScore;
    if (isNewRecord) {
        highScore = score;
        saveHighScore();
    }
    
    // Show game over modal
    showGameOverModal(isNewRecord);
    
    // Show restart button
    restartBtn.style.display = 'inline-block';
}

// Show game over modal
function showGameOverModal(isNewRecord) {
    finalScoreEl.textContent = score;
    
    if (isNewRecord && score > 0) {
        modalTitle.textContent = t('whackAMole.newRecord');
        recordMessageEl.textContent = t('whackAMole.newRecordMessage');
        playSound('successFanfare');
    } else {
        modalTitle.textContent = t('whackAMole.gameOver');
        recordMessageEl.textContent = score > 0 ? `${t('whackAMole.highScoreLabel')} ${highScore}` : t('whackAMole.tryAgain');
        playSound('fail');
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
    timeLeft = 30;
    timeLeftEl.textContent = timeLeft;
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

holes.forEach(hole => {
    hole.addEventListener('click', whackMole);
});

// Close modal when clicking outside
gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        closeModal();
    }
});

// Initialize
loadHighScore();
