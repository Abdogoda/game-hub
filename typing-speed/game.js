// Word Lists by Difficulty
const wordLists = {
    easy: ['cat', 'dog', 'sun', 'run', 'hat', 'car', 'pen', 'cup', 'box', 'bat', 'fan', 'bag', 'map', 'key', 'top', 'bed', 'bus', 'fox', 'red', 'hot', 'pot', 'wet', 'net', 'leg', 'arm'],
    medium: ['table', 'chair', 'phone', 'water', 'music', 'light', 'happy', 'dream', 'beach', 'stone', 'plant', 'glass', 'tower', 'cloud', 'river', 'ocean', 'winter', 'summer', 'spring', 'autumn', 'forest', 'garden', 'window', 'bridge', 'coffee'],
    hard: ['computer', 'keyboard', 'elephant', 'beautiful', 'important', 'amazing', 'generation', 'fantastic', 'wonderful', 'adventure', 'dictionary', 'photograph', 'technology', 'psychology', 'philosophy', 'restaurant', 'university', 'comfortable', 'strawberry', 'basketball', 'understand', 'experience', 'government', 'temperature', 'mathematics']
};

// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// Game State
let gameActive = false;
let score = 0;
let timeLeft = 60;
let currentWord = '';
let correctWords = 0;
let totalWords = 0;
let startTime = null;
let timerInterval = null;

// DOM Elements
const wordDisplay = document.getElementById('wordDisplay');
const wordInput = document.getElementById('wordInput');
const wpmEl = document.getElementById('wpm');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const accuracyEl = document.getElementById('accuracy');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficultySelect');
const gameOverModal = document.getElementById('gameOverModal');
const finalWPMEl = document.getElementById('finalWPM');
const finalScoreEl = document.getElementById('finalScore');
const finalAccuracyEl = document.getElementById('finalAccuracy');
const recordMessageEl = document.getElementById('recordMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const leaderboardList = document.getElementById('leaderboardList');
const correctSound = document.getElementById('correctSound');
const gameOverSound = document.getElementById('gameOverSound');

// Play sound helper using SoundManager
function playSound(soundName) {
    if (window.SoundManager && window.isSoundEnabled && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
    }
}


// Get random word based on difficulty
function getRandomWord() {
    const difficulty = difficultySelect.value;
    const words = wordLists[difficulty];
    return words[Math.floor(Math.random() * words.length)];
}

// Display new word
function displayNewWord() {
    currentWord = getRandomWord();
    wordDisplay.textContent = currentWord;
    wordInput.value = '';
    wordInput.classList.remove('error');
}

// Calculate WPM
function calculateWPM() {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wpm = Math.round(correctWords / timeElapsed);
    return isNaN(wpm) || !isFinite(wpm) ? 0 : wpm;
}

// Calculate accuracy
function calculateAccuracy() {
    if (totalWords === 0) return 100;
    return Math.round((correctWords / totalWords) * 100);
}

// Update stats
function updateStats() {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy + '%';
}

// Check word
function checkWord() {
    const typedWord = wordInput.value.trim();
    
    if (typedWord === '') return;
    
    totalWords++;
    
    if (typedWord === currentWord) {
        correctWords++;
        score += currentWord.length;
        scoreEl.textContent = score;
        
        // Animate correct
        wordDisplay.classList.add('correct');
        playSound('ding');
        
        setTimeout(() => {
            wordDisplay.classList.remove('correct');
        }, 300);
        
        // Display new word
        displayNewWord();
    } else {
        // Show error animation
        wordInput.classList.add('error');
        setTimeout(() => {
            wordInput.classList.remove('error');
        }, 300);
    }
    
    updateStats();
}

// Start countdown timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timeEl.style.color = '#ff4444';
        }
        
        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

// Start game
function startGame() {
    gameActive = true;
    score = 0;
    correctWords = 0;
    totalWords = 0;
    timeLeft = 60;
    
    // Play start sound
    playSound('raceStart');
    startTime = Date.now();
    
    // Reset UI
    scoreEl.textContent = score;
    wpmEl.textContent = 0;
    timeEl.textContent = timeLeft;
    accuracyEl.textContent = '100%';
    timeEl.style.color = '#ffd700';
    
    // Disable difficulty selector
    difficultySelect.disabled = true;
    
    // Show/hide buttons
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    
    // Enable input and focus
    wordInput.disabled = false;
    wordInput.focus();
    
    // Display first word
    displayNewWord();
    
    // Start timer
    startTimer();
}

// End game
function endGame() {
    gameActive = false;
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Disable input
    wordInput.disabled = true;
    
    // Re-enable difficulty selector
    difficultySelect.disabled = false;
    
    // Calculate final stats
    const finalWPM = calculateWPM();
    const finalAccuracy = calculateAccuracy();
    
    // Save to leaderboard
    saveScore(finalWPM, score, finalAccuracy, difficultySelect.value);
    
    // Play game over sound
    playSound('fail');
    
    // Show game over modal
    showGameOverModal(finalWPM, score, finalAccuracy);
}

// Show game over modal
function showGameOverModal(wpm, finalScore, accuracy) {
    finalWPMEl.textContent = wpm;
    finalScoreEl.textContent = finalScore;
    finalAccuracyEl.textContent = accuracy + '%';
    
    const leaderboard = getLeaderboard();
    const difficulty = difficultySelect.value;
    const currentDifficultyScores = leaderboard.filter(s => s.difficulty === difficulty);
    const rank = currentDifficultyScores.findIndex(s => s.wpm === wpm && s.score === finalScore) + 1;
    
    if (rank > 0 && rank <= 5) {
        recordMessageEl.textContent = t('typingSpeed.rankedMessage').replace('{rank}', rank).replace('{difficulty}', difficulty);
    } else {
        recordMessageEl.textContent = wpm > 0 ? t('typingSpeed.keepPracticing') : t('typingSpeed.tryAgain');
    }
    
    gameOverModal.classList.add('show');
}

// Close modal
function closeModal() {
    gameOverModal.classList.remove('show');
}

// Reset game
function resetGame() {
    gameActive = false;
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset stats
    timeLeft = 60;
    timeEl.textContent = timeLeft;
    timeEl.style.color = '#ffd700';
    
    // Disable input
    wordInput.disabled = true;
    
    // Re-enable difficulty selector
    difficultySelect.disabled = false;
    
    closeModal();
    
    wordDisplay.textContent = t('typingSpeed.clickStart');
    wordInput.value = '';
    
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
}

// Save score to leaderboard
function saveScore(wpm, score, accuracy, difficulty) {
    const leaderboard = getLeaderboard();
    
    leaderboard.push({
        wpm,
        score,
        accuracy,
        difficulty,
        date: Date.now()
    });
    
    // Sort by WPM (descending)
    leaderboard.sort((a, b) => b.wpm - a.wpm);
    
    // Keep only top 10
    const top10 = leaderboard.slice(0, 10);
    
    localStorage.setItem('typingSpeedLeaderboard', JSON.stringify(top10));
    
    updateLeaderboard();
}

// Get leaderboard
function getLeaderboard() {
    const saved = localStorage.getItem('typingSpeedLeaderboard');
    return saved ? JSON.parse(saved) : [];
}

// Update leaderboard display
function updateLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = `<p style="color: var(--text-color); opacity: 0.7;">${t('typingSpeed.noScoresYet')}</p>`;
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        
        item.innerHTML = `
            <span class="leaderboard-rank">${medal}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-difficulty">${entry.difficulty}</span>
                <span class="leaderboard-wpm">${entry.wpm} WPM</span>
                <span style="color: var(--text-color); opacity: 0.8;">Score: ${entry.score}</span>
                <span style="color: var(--text-color); opacity: 0.8;">${entry.accuracy}%</span>
            </div>
        `;
        
        leaderboardList.appendChild(item);
    });
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    closeModal();
    startGame();
});

wordInput.addEventListener('input', () => {
    if (gameActive) {
        checkWord();
    }
});

wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameActive) {
        checkWord();
    }
});

// Close modal when clicking outside
gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        closeModal();
    }
});

// Initialize
updateLeaderboard();
