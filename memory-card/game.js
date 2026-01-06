// Game state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timeElapsed = 0;
let timerInterval = null;
let isProcessing = false;

// Card emojis
const cardSymbols = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺'];

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const matchesDisplay = document.getElementById('matches');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const finalMovesDisplay = document.getElementById('finalMoves');
const finalTimeDisplay = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const successSound = document.getElementById('successSound');
const failSound = document.getElementById('failSound');
const bestMovesDisplay = document.getElementById('bestMoves');
const bestTimeDisplay = document.getElementById('bestTime');
const winTitle = document.getElementById('winTitle');
const winMessage = document.getElementById('winMessage');
const recordComparison = document.getElementById('recordComparison');

// Initialize game
function initGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timeElapsed = 0;
    isProcessing = false;

    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Update displays
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';
    matchesDisplay.textContent = '0/8';

    // Create card pairs
    const cardPairs = [...cardSymbols, ...cardSymbols];
    
    // Shuffle cards
    cards = shuffleArray(cardPairs);

    // Render cards
    renderCards();

    // Hide modal
    winModal.classList.remove('show');

    // Load and display best record
    displayBestRecord();
}

// Load and display best record
function displayBestRecord() {
    const bestRecord = getBestRecord();
    if (bestRecord) {
        bestMovesDisplay.textContent = bestRecord.moves;
        bestTimeDisplay.textContent = bestRecord.time;
    } else {
        bestMovesDisplay.textContent = '--';
        bestTimeDisplay.textContent = '--';
    }
}

// Get best record from localStorage
function getBestRecord() {
    const record = localStorage.getItem('memoryGameBestRecord');
    return record ? JSON.parse(record) : null;
}

// Save best record to localStorage
function saveBestRecord(moves, time) {
    const record = {
        moves: moves,
        time: time,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('memoryGameBestRecord', JSON.stringify(record));
    displayBestRecord();
}

// Check if current score is better than best record
function isBetterRecord(currentMoves, currentTime) {
    const bestRecord = getBestRecord();
    if (!bestRecord) return true;
    
    // Better if fewer moves, or same moves but faster time
    if (currentMoves < bestRecord.moves) return true;
    if (currentMoves === bestRecord.moves && currentTime < timeElapsed) return false;
    return currentMoves < bestRecord.moves;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Render cards on the board
function renderCards() {
    gameBoard.innerHTML = '';
    cards.forEach((symbol, index) => {
        const card = createCard(symbol, index);
        gameBoard.appendChild(card);
    });
}

// Create a card element
function createCard(symbol, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.index = index;
    card.dataset.symbol = symbol;

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.textContent = '?';

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = symbol;

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    card.addEventListener('click', () => handleCardClick(card));

    return card;
}

// Handle card click
function handleCardClick(card) {
    // Start timer on first click
    if (moves === 0 && !timerInterval) {
        startTimer();
    }

    // Ignore if processing or card already flipped/matched
    if (isProcessing || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    // Flip card
    card.classList.add('flipped');
    flippedCards.push(card);

    // Check for match if two cards are flipped
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// Check if flipped cards match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const symbol1 = card1.dataset.symbol;
    const symbol2 = card2.dataset.symbol;

    if (symbol1 === symbol2) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            matchesDisplay.textContent = `${matchedPairs}/8`;
            flippedCards = [];
            isProcessing = false;

            // Check for win
            if (matchedPairs === 8) {
                endGame();
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// End game
function endGame() {
    clearInterval(timerInterval);
    
    // Play success sound
    successSound.currentTime = 0;
    if (window.playGameSound) {
        window.playGameSound(successSound);
    } else {
        successSound.play();
    }
    
    // Show win modal after a short delay
    setTimeout(() => {
        finalMovesDisplay.textContent = moves;
        finalTimeDisplay.textContent = timerDisplay.textContent;
        
        // Check if new record
        const bestRecord = getBestRecord();
        const isNewRecord = isBetterRecord(moves, timeElapsed);
        
        if (isNewRecord) {
            winTitle.textContent = '🏆 NEW RECORD! 🏆';
            winMessage.textContent = 'Amazing! You set a new best record!';
            recordComparison.innerHTML = '<p class="new-record">⭐ New Best Record! ⭐</p>';
            saveBestRecord(moves, timerDisplay.textContent);
        } else {
            winTitle.textContent = '🎉 Congratulations! 🎉';
            winMessage.textContent = 'You won the game!';
            
            const moveDiff = moves - bestRecord.moves;
            recordComparison.innerHTML = `
                <p><strong>Best Record:</strong></p>
                <p>Moves: ${bestRecord.moves} | Time: ${bestRecord.time}</p>
                <p style="color: #ff6b6b; margin-top: 10px;">
                    ${moveDiff > 0 ? `${moveDiff} more moves than your best` : 'Matched your best moves!'}
                </p>
            `;
        }
        
        winModal.classList.add('show');
    }, 500);
}

// Event listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Initialize game on page load
initGame();
