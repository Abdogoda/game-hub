// Game State
let gameState = 'idle'; // idle, waiting, ready, go
let attempts = [];
let maxAttempts = 5;
let startTime = null;
let waitTimeout = null;
let bestTime = null;

// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// DOM Elements
const gameScreen = document.getElementById('gameScreen');
const instruction = document.getElementById('instruction');
const startBtn = document.getElementById('startBtn');
const currentEl = document.getElementById('current');
const averageEl = document.getElementById('average');
const bestTimeEl = document.getElementById('bestTime');
const attemptsEl = document.getElementById('attempts');
const attemptsListEl = document.getElementById('attemptsList');
const leaderboardList = document.getElementById('leaderboardList');
const gameOverModal = document.getElementById('gameOverModal');
const finalAverageEl = document.getElementById('finalAverage');
const finalBestEl = document.getElementById('finalBest');
const finalWorstEl = document.getElementById('finalWorst');
const recordMessageEl = document.getElementById('recordMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const clickSound = document.getElementById('clickSound');
const tooEarlySound = document.getElementById('tooEarlySound');

// Play sound helper using SoundManager
function playSound(soundName) {
    if (window.SoundManager && window.isSoundEnabled && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
    }
}

// Load best time from localStorage
function loadBestTime() {
    const saved = localStorage.getItem('reactionTimeBest');
    if (saved) {
        bestTime = parseInt(saved);
        bestTimeEl.textContent = bestTime + 'ms';
    }
}

// Save best time
function saveBestTime() {
    if (bestTime !== null) {
        localStorage.setItem('reactionTimeBest', bestTime);
        bestTimeEl.textContent = bestTime + 'ms';
    }
}

// Update stats display
function updateStats() {
    attemptsEl.textContent = `${attempts.length}/${maxAttempts}`;
    
    if (attempts.length > 0) {
        const current = attempts[attempts.length - 1];
        currentEl.textContent = current + 'ms';
        
        const average = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
        averageEl.textContent = average + 'ms';
        
        const sessionBest = Math.min(...attempts);
        if (bestTime === null || sessionBest < bestTime) {
            bestTime = sessionBest;
            saveBestTime();
        }
    }
}

// Update attempts list
function updateAttemptsList() {
    attemptsListEl.innerHTML = '';
    
    if (attempts.length === 0) {
        attemptsListEl.innerHTML = `<p style="color: var(--text-color); opacity: 0.7;">${t('reactionTime.noAttemptsYet')}</p>`;
        return;
    }
    
    const sessionBest = Math.min(...attempts);
    
    attempts.forEach((time, index) => {
        const item = document.createElement('div');
        item.className = 'attempt-item';
        
        const timeClass = time === sessionBest ? 'best' : '';
        const medal = time === sessionBest ? ' 🏆' : '';
        
        item.innerHTML = `
            <span class="attempt-number">Attempt ${index + 1}</span>
            <span class="attempt-time ${timeClass}">${time}ms${medal}</span>
        `;
        
        attemptsListEl.appendChild(item);
    });
}

// Start test
function startTest() {
    if (attempts.length === 0) {
        playSound('raceStart');
    }
    
    gameState = 'waiting';
    instruction.style.display = 'none';
    gameScreen.className = 'game-screen ready';
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = t('reactionTime.waitForGreen');
    gameScreen.appendChild(message);
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    waitTimeout = setTimeout(() => {
        if (gameState === 'waiting') {
            showGreen();
        }
    }, delay);
}

// Show green screen
function showGreen() {
    gameState = 'go';
    gameScreen.className = 'game-screen go';
    
    const message = gameScreen.querySelector('.message');
    if (message) {
        message.textContent = t('reactionTime.clickNow');
    }
    
    startTime = Date.now();
}

// Handle screen click
function handleClick() {
    if (gameState === 'idle') {
        return;
    }
    
    if (gameState === 'waiting' || gameState === 'ready') {
        // Clicked too early
        clearTimeout(waitTimeout);
        gameState = 'idle';
        
        gameScreen.className = 'game-screen too-early';
        const message = gameScreen.querySelector('.message');
        if (message) {
            message.textContent = t('reactionTime.tooEarlyEmoji');
        }
        
        playSound('wrong');
        
        setTimeout(() => {
            resetScreen();
        }, 1500);
        return;
    }
    
    if (gameState === 'go') {
        // Record reaction time
        const reactionTime = Date.now() - startTime;
        attempts.push(reactionTime);
        
        playSound('clickFast');
        
        gameState = 'idle';
        
        // Show result
        gameScreen.className = 'game-screen waiting';
        const message = gameScreen.querySelector('.message');
        if (message) {
            message.textContent = t('reactionTime.msResult').replace('{time}', reactionTime);
            message.style.color = '#4CAF50';
        }
        
        updateStats();
        updateAttemptsList();
        
        // Check if test is complete
        if (attempts.length >= maxAttempts) {
            setTimeout(() => {
                showResults();
            }, 1500);
        } else {
            setTimeout(() => {
                resetScreen();
            }, 1500);
        }
    }
}

// Reset screen for next attempt
function resetScreen() {
    gameState = 'idle';
    gameScreen.className = 'game-screen waiting';
    
    const message = gameScreen.querySelector('.message');
    if (message) {
        message.remove();
    }
    
    instruction.style.display = 'block';
    startBtn.textContent = attempts.length > 0 ? 'Next Attempt' : 'Start Test';
}

// Show results modal
function showResults() {
    const average = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
    const best = Math.min(...attempts);
    const worst = Math.max(...attempts);
    
    finalAverageEl.textContent = average + 'ms';
    finalBestEl.textContent = best + 'ms';
    finalWorstEl.textContent = worst + 'ms';
    
    // Save to leaderboard
    saveToLeaderboard(average, best);
    
    // Check if new best
    const globalLeaderboard = getLeaderboard();
    const rank = globalLeaderboard.findIndex(entry => entry.best === best && entry.average === average) + 1;
    
    if (rank > 0 && rank <= 5) {
        recordMessageEl.textContent = t('reactionTime.rankedMessage').replace('{rank}', rank);
    } else if (best === bestTime) {
        recordMessageEl.textContent = t('reactionTime.newPersonalBest');
    } else {
        recordMessageEl.textContent = t('reactionTime.keepPracticing');
    }
    
    gameOverModal.classList.add('show');
}

// Save to leaderboard
function saveToLeaderboard(average, best) {
    const leaderboard = getLeaderboard();
    
    leaderboard.push({
        average,
        best,
        date: Date.now()
    });
    
    // Sort by best time (ascending)
    leaderboard.sort((a, b) => a.best - b.best);
    
    // Keep only top 10
    const top10 = leaderboard.slice(0, 10);
    
    localStorage.setItem('reactionTimeLeaderboard', JSON.stringify(top10));
    
    updateLeaderboard();
}

// Get leaderboard
function getLeaderboard() {
    const saved = localStorage.getItem('reactionTimeLeaderboard');
    return saved ? JSON.parse(saved) : [];
}

// Update leaderboard display
function updateLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = `<p style="color: var(--text-color); opacity: 0.7;">${t('reactionTime.noRecordsYet')}</p>`;
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        
        item.innerHTML = `
            <span class="leaderboard-rank">${medal}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-time">${entry.best}ms</span>
                <span style="color: var(--text-color); opacity: 0.8;">Avg: ${entry.average}ms</span>
            </div>
        `;
        
        leaderboardList.appendChild(item);
    });
}

// Close modal
function closeModal() {
    gameOverModal.classList.remove('show');
}

// Reset game
function resetGame() {
    attempts = [];
    currentEl.textContent = '-';
    averageEl.textContent = '-';
    attemptsEl.textContent = '0/5';
    
    updateAttemptsList();
    closeModal();
    resetScreen();
}

// Event Listeners
startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startTest();
});

gameScreen.addEventListener('click', handleClick);

playAgainBtn.addEventListener('click', () => {
    resetGame();
});

// Close modal when clicking outside
gameOverModal.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        closeModal();
    }
});

// Initialize
loadBestTime();
updateLeaderboard();
updateAttemptsList();
