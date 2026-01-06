// Game State
let playerScore = 0;
let computerScore = 0;
let rounds = 0;
let winStreak = 0;
let maxWinStreak = 0;
let moveHistory = [];
let gameStats = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0
};

// Load saved stats
function loadStats() {
    const saved = localStorage.getItem('rpsGameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
}

// Save stats
function saveStats() {
    localStorage.setItem('rpsGameStats', JSON.stringify(gameStats));
}

// Game choices
const choices = ['rock', 'paper', 'scissors'];
const emojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

// AI Strategy - Makes computer smarter
function getComputerChoice() {
    // If no history, choose randomly
    if (moveHistory.length < 3) {
        return choices[Math.floor(Math.random() * choices.length)];
    }

    // Analyze player's last 3 moves
    const lastThreeMoves = moveHistory.slice(-3);
    const moveCounts = {};
    
    lastThreeMoves.forEach(move => {
        moveCounts[move.player] = (moveCounts[move.player] || 0) + 1;
    });

    // Find player's most used move
    let mostUsedMove = null;
    let maxCount = 0;
    
    for (let move in moveCounts) {
        if (moveCounts[move] > maxCount) {
            maxCount = moveCounts[move];
            mostUsedMove = move;
        }
    }

    // 70% chance to counter player's pattern, 30% random
    if (Math.random() < 0.7 && mostUsedMove) {
        // Counter the most used move
        if (mostUsedMove === 'rock') return 'paper';
        if (mostUsedMove === 'paper') return 'scissors';
        if (mostUsedMove === 'scissors') return 'rock';
    }

    // Random choice
    return choices[Math.floor(Math.random() * choices.length)];
}

// DOM Elements
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const roundsEl = document.getElementById('rounds');
const resultText = document.getElementById('resultText');
const resultDisplay = document.getElementById('resultDisplay');
const playerChoiceEl = document.getElementById('playerChoice');
const computerChoiceEl = document.getElementById('computerChoice');
const choiceButtons = document.querySelectorAll('.choice-btn');
const resetBtn = document.getElementById('resetBtn');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

// Initialize game
function init() {
    loadStats();
    updateStatsDisplay();
    
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => playRound(btn.dataset.choice));
    });

    resetBtn.addEventListener('click', resetGame);
}

// Play a round
function playRound(playerChoice) {
    // Disable buttons during animation
    disableButtons();

    // Computer makes strategic choice
    const computerChoice = getComputerChoice();

    // Record move
    moveHistory.push({
        player: playerChoice,
        computer: computerChoice,
        round: rounds + 1
    });

    // Keep only last 10 moves
    if (moveHistory.length > 10) {
        moveHistory.shift();
    }

    // Show choices with animation
    showChoices(playerChoice, computerChoice);

    // Determine winner after animation
    setTimeout(() => {
        const result = determineWinner(playerChoice, computerChoice);
        displayResult(result, playerChoice, computerChoice);
        updateScore(result);
        enableButtons();
    }, 1000);
}

// Show player and computer choices
function showChoices(playerChoice, computerChoice) {
    playerChoiceEl.textContent = emojis[playerChoice];
    playerChoiceEl.classList.add('selected');

    // Animate computer thinking
    let counter = 0;
    const thinkingInterval = setInterval(() => {
        computerChoiceEl.textContent = emojis[choices[counter % 3]];
        counter++;
    }, 100);

    setTimeout(() => {
        clearInterval(thinkingInterval);
        computerChoiceEl.textContent = emojis[computerChoice];
        computerChoiceEl.classList.add('selected');
        
        setTimeout(() => {
            playerChoiceEl.classList.remove('selected');
            computerChoiceEl.classList.remove('selected');
        }, 500);
    }, 800);
}

// Determine the winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }

    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };

    return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
}

// Display result
function displayResult(result, playerChoice, computerChoice) {
    resultText.classList.remove('win', 'lose', 'draw');

    if (result === 'win') {
        const winReason = getWinReason(playerChoice, computerChoice);
        resultText.textContent = `🎉 You Win! ${winReason} 🎉`;
        resultText.classList.add('win');
        playSound(winSound);
    } else if (result === 'lose') {
        const loseReason = getWinReason(computerChoice, playerChoice);
        resultText.textContent = `😢 You Lose! ${loseReason}`;
        resultText.classList.add('lose');
        playSound(loseSound);
    } else {
        resultText.textContent = '🤝 It\'s a Draw!';
        resultText.classList.add('draw');
    }
}

// Get win reason
function getWinReason(winner, loser) {
    if (winner === 'rock' && loser === 'scissors') return 'Rock crushes Scissors!';
    if (winner === 'paper' && loser === 'rock') return 'Paper covers Rock!';
    if (winner === 'scissors' && loser === 'paper') return 'Scissors cuts Paper!';
    return '';
}

// Update score
function updateScore(result) {
    rounds++;
    roundsEl.textContent = rounds;
    gameStats.totalGames++;

    if (result === 'win') {
        playerScore++;
        playerScoreEl.textContent = playerScore;
        animateScore(playerScoreEl);
        
        // Track streaks
        winStreak++;
        if (winStreak > maxWinStreak) {
            maxWinStreak = winStreak;
        }
        
        gameStats.wins++;
    } else if (result === 'lose') {
        computerScore++;
        computerScoreEl.textContent = computerScore;
        animateScore(computerScoreEl);
        
        // Reset streak
        winStreak = 0;
        
        gameStats.losses++;
    } else {
        // Reset streak on draw
        winStreak = 0;
        gameStats.draws++;
    }

    // Save and update stats
    saveStats();
    updateStatsDisplay();
    
    // Check for winning streak
    if (winStreak >= 3) {
        showStreakMessage();
    }
}

// Show streak message
function showStreakMessage() {
    const streakMsg = document.createElement('div');
    streakMsg.className = 'streak-message';
    streakMsg.textContent = `🔥 ${winStreak} Win Streak! 🔥`;
    document.querySelector('.container').appendChild(streakMsg);
    
    setTimeout(() => {
        streakMsg.remove();
    }, 2000);
}

// Update statistics display
function updateStatsDisplay() {
    const winRate = gameStats.totalGames > 0 
        ? ((gameStats.wins / gameStats.totalGames) * 100).toFixed(1) 
        : 0;
    
    // Update or create stats display
    let statsDisplay = document.querySelector('.stats-display');
    if (!statsDisplay) {
        statsDisplay = document.createElement('div');
        statsDisplay.className = 'stats-display';
        document.querySelector('.container').insertBefore(
            statsDisplay, 
            document.querySelector('.reset-btn')
        );
    }
    
    statsDisplay.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Win Rate:</span>
            <span class="stat-value">${winRate}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Current Streak:</span>
            <span class="stat-value ${winStreak >= 3 ? 'hot-streak' : ''}">${winStreak}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Best Streak:</span>
            <span class="stat-value">${maxWinStreak}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Total Games:</span>
            <span class="stat-value">${gameStats.totalGames}</span>
        </div>
    `;
}

// Animate score change
function animateScore(element) {
    element.style.transform = 'scale(1.3)';
    element.style.color = '#4CAF50';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '#ffd700';
    }, 300);
}

// Play sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Disable choice buttons
function disableButtons() {
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
}

// Enable choice buttons
function enableButtons() {
    choiceButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
}

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    rounds = 0;
    winStreak = 0;
    moveHistory = [];

    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    roundsEl.textContent = '0';
    resultText.textContent = 'Choose your move!';
    resultText.classList.remove('win', 'lose', 'draw');
    playerChoiceEl.textContent = '❓';
    computerChoiceEl.textContent = '❓';

    updateStatsDisplay();

    // Animate reset
    const container = document.querySelector('.container');
    container.style.animation = 'none';
    setTimeout(() => {
        container.style.animation = 'fadeIn 0.5s ease';
    }, 10);
}

// Initialize game when page loads
init();
