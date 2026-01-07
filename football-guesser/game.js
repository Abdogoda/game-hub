// Use global API key from script.js
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let questionsLeft = 10;
let conversationHistory = [];
let gameActive = false;
let chosenPlayerReference = null;

// Translation helper function
function t(key) {
    if (window.i18n && typeof window.i18n.t === 'function') {
        return window.i18n.t(key) || key;
    }
    return key; // Fallback to key if i18n not loaded
}

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const gameContainer = document.getElementById('gameContainer');
const gameOver = document.getElementById('gameOver');
const chatLog = document.getElementById('chatLog');
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const guessArea = document.getElementById('guessArea');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const questionsLeftDisplay = document.getElementById('questionsLeft');
const resultMessage = document.getElementById('resultMessage');
const resultDetails = document.getElementById('resultDetails');
const restartBtn = document.getElementById('restartBtn');
const startGameBtn = document.getElementById('startGameBtn');

// Event Listeners
startGameBtn.addEventListener('click', startGame);
askBtn.addEventListener('click', askQuestion);
guessBtn.addEventListener('click', makeGuess);
restartBtn.addEventListener('click', resetGame);

questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !askBtn.disabled) askQuestion();
});

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !guessBtn.disabled) makeGuess();
});

async function startGame() {
    welcomeScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameActive = true;
    questionsLeft = 10;
    conversationHistory = [];
    updateUI();
    
    addSystemMessage(t('footballGuesser.messages.initializing'));
    
    conversationHistory.push({
        role: 'system',
        content: `You are playing a football guessing game. Your role:
1. Secretly choose ONE specific random FAMOUS real football player who has played or is currently playing in one of the TOP 5 EUROPEAN LEAGUES (Premier League, La Liga, Serie A, Bundesliga, or Ligue 1).
2. The player MUST be well-known and recognizable (e.g., won major trophies, individual awards, or had significant impact).
3. Choose randomly from different eras, positions, and nationalities to keep the game interesting.
4. Remember this player throughout the entire game - NEVER change your choice.
5. Answer user questions ONLY with: YES, NO, or I DON'T KNOW.
6. Be factually accurate based on the player you chose.
7. When asked directly "Is it [player name]?", answer YES only if the name matches.
8. Never reveal hints or extra information.

Consistency is crucial - base all answers on the same player you initially chose.`
    });
    
    conversationHistory.push({
        role: 'user',
        content: 'You have now secretly chosen a specific football player. Respond with ONLY the word READY when prepared.'
    });
    
    try {
        const response = await callGroqAPI(20);
        conversationHistory.push({ role: 'assistant', content: response });
        
        conversationHistory.push({
            role: 'user',
            content: 'For my records only, what is the player\'s name? Respond with ONLY the player\'s full name.'
        });
        
        chosenPlayerReference = (await callGroqAPI(30)).trim();
        conversationHistory.pop();
        
        chatLog.innerHTML = '';
        addSystemMessage(t('footballGuesser.messages.aiReady'));
        addSystemMessage(t('footballGuesser.messages.askQuestions'));
    } catch (error) {
        chatLog.innerHTML = '';
        addSystemMessage(t('footballGuesser.messages.connectionError'));
        gameActive = false;
        setTimeout(() => resetGame(), 3000);
    }
}

async function askQuestion() {
    if (!gameActive || questionsLeft <= 0) return;
    
    const question = questionInput.value.trim();
    if (!question || question.length < 3) {
        questionInput.style.borderColor = '#f44336';
        setTimeout(() => questionInput.style.borderColor = '', 500);
        if (question && question.length < 3) addSystemMessage(t('footballGuesser.messages.askDetailed'));
        return;
    }
    
    // Detect if user is trying to guess a player name
    const isItPattern = /^is\s+it\s+([a-z\s]+)\??$/i;
    const match = question.match(isItPattern);
    if (match) {
        guessInput.value = match[1].trim();
        questionInput.value = '';
        addSystemMessage(t('footballGuesser.messages.guessDetected'));
        guessArea.style.display = 'flex';
        guessInput.focus();
        return;
    }
    
    addUserMessage(question);
    questionInput.value = '';
    setButtonsState(true);
    
    conversationHistory.push({ role: 'user', content: question });
    
    try {
        const response = await callGroqAPI(15);
        conversationHistory.push({ role: 'assistant', content: response });
        
        const normalized = response.trim().toUpperCase();
        const isValid = normalized.includes('YES') || normalized.includes('NO') || 
                       normalized.includes('DON\'T KNOW') || normalized.includes('IDK');
        
        if (!isValid) {
            addSystemMessage(t('footballGuesser.messages.unclearResponse'));
            conversationHistory.pop();
            conversationHistory.pop();
        } else {
            addAIMessage(response, normalized);
            questionsLeft--;
            updateUI();
            
            if (questionsLeft === 5) {
                guessArea.style.display = 'flex';
                addSystemMessage(t('footballGuesser.messages.canGuessNow'));
            }
            
            if (questionsLeft === 3) {
                addSystemMessage(t('footballGuesser.messages.threeLeft'));
            }
            
            if (questionsLeft === 0) {
                endGame(false, 'Out of questions!');
            }
        }
    } catch (error) {
        addSystemMessage(t('footballGuesser.messages.networkError'));
        conversationHistory.pop();
    } finally {
        setButtonsState(false);
        questionInput.focus();
    }
}

async function makeGuess() {
    if (!gameActive) return;
    
    const guess = guessInput.value.trim();
    if (!guess || guess.length < 3) {
        guessInput.style.borderColor = '#f44336';
        setTimeout(() => guessInput.style.borderColor = '', 500);
        if (guess && guess.length < 3) addSystemMessage(t('footballGuesser.messages.validName'));
        return;
    }
    
    addUserMessage(`🤔 My guess: Is it ${guess}?`);
    guessInput.value = '';
    setButtonsState(true);
    
    conversationHistory.push({
        role: 'user',
        content: `Is the player you're thinking of ${guess}? Answer YES if correct, NO if incorrect.`
    });
    
    try {
        const response = await callGroqAPI(15);
        conversationHistory.push({ role: 'assistant', content: response });
        
        const normalized = response.trim().toUpperCase();
        addAIMessage(response, normalized);
        
        if (normalized.includes('YES')) {
            setTimeout(() => endGame(true, t('footballGuesser.messages.congratulations').replace('{guess}', guess)), 500);
        } else {
            questionsLeft--;
            updateUI();
            
            if (questionsLeft === 0) {
                setTimeout(() => endGame(false, 'Out of questions!'), 500);
            } else {
                const questionsText = questionsLeft > 1 ? t('footballGuesser.messages.questionsPlural') : t('footballGuesser.messages.questionsSingular');
                addSystemMessage(t('footballGuesser.messages.incorrect').replace('{count}', questionsLeft).replace('{questions}', questionsText));
            }
        }
    } catch (error) {
        addSystemMessage(t('footballGuesser.messages.networkError'));
        conversationHistory.pop();
    } finally {
        setButtonsState(false);
    }
}

async function callGroqAPI(maxTokens = 10) {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: conversationHistory,
            temperature: 0.5,
            max_tokens: maxTokens
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

function setButtonsState(disabled) {
    askBtn.disabled = disabled;
    guessBtn.disabled = disabled;
    gameContainer.classList.toggle('loading', disabled);
}

function addSystemMessage(text) {
    const message = document.createElement('div');
    message.className = 'system-message';
    message.textContent = text;
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'user-message';
    message.textContent = text;
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addAIMessage(text, normalizedResponse) {
    const message = document.createElement('div');
    message.className = 'ai-message';
    
    let emoji = '✅ ';
    if (normalizedResponse.includes('NO') && !normalizedResponse.includes('I DON\'T KNOW') && !normalizedResponse.includes('IDK')) {
        message.classList.add('no');
        emoji = '❌ ';
    } else if (normalizedResponse.includes('I DON\'T KNOW') || normalizedResponse.includes('IDK')) {
        message.classList.add('idk');
        emoji = '❓ ';
    }
    
    message.innerHTML = `<strong>${emoji}AI:</strong> ${text}`;
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    questionsLeftDisplay.textContent = questionsLeft;
    questionsLeftDisplay.style.color = questionsLeft <= 3 ? '#f44336' : 
                                        questionsLeft <= 5 ? '#ffc107' : '#4CAF50';
}

async function endGame(won, message) {
    gameActive = false;
    gameContainer.style.display = 'none';
    gameOver.style.display = 'block';
    
    resultMessage.textContent = won ? t('footballGuesser.messages.youWon') : t('footballGuesser.messages.gameOver');
    resultMessage.style.color = won ? '#4CAF50' : '#f44336';
    const betterLuck = won ? '' : ' ' + t('footballGuesser.messages.betterLuck');
    resultDetails.textContent = message + betterLuck;
    
    await revealPlayer();
}

async function revealPlayer() {
    const playerCard = document.getElementById('playerCard');
    playerCard.style.display = 'flex';
    
    document.getElementById('fullName').textContent = 'Loading...';
    
    try {
        const prompt = `Reveal detailed information about ${chosenPlayerReference || 'the player'}. Format:\nFullName: [name]\nBirthDate: [DD/MM/YYYY]\nAge: [age]\nBirthPlace: [city, country]\nHeight: [meters]\nCitizenship: [countries]\nPosition: [position]\nFoot: [right/left/both]\nCurrentClub: [club or Retired]\nFamousClubs: [3-5 clubs]\nAchievements: [brief summary]`;
        
        conversationHistory.push({ role: 'user', content: prompt });
        
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: conversationHistory,
                temperature: 0.3,
                max_tokens: 450
            })
        });
        
        if (!response.ok) throw new Error('API failed');
        
        const data = await response.json();
        await displayPlayerCard(data.choices[0].message.content.trim());
    } catch (error) {
        document.getElementById('fullName').textContent = chosenPlayerReference || 'ERROR';
        document.getElementById('currentClub').textContent = 'Failed to load details';
        setTimeout(() => playerCard.classList.add('show'), 100);
    }
}

async function displayPlayerCard(playerData) {
    const extract = (pattern) => {
        const match = playerData.match(pattern);
        return match ? match[1].trim() : '--';
    };
    
    const fullName = extract(/FullName[:\s]+(.*?)(?:\n|$)/i) || chosenPlayerReference || 'Unknown';
    const birthDate = extract(/BirthDate[:\s]+(.*?)(?:\n|$)/i);
    const age = extract(/Age[:\s]+(.*?)(?:\n|$)/i);
    
    document.getElementById('fullName').textContent = fullName;
    document.getElementById('birthInfo').textContent = birthDate !== '--' && age !== '--' ? `${birthDate} (${age})` : age;
    document.getElementById('birthPlace').textContent = extract(/BirthPlace[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('height').textContent = extract(/Height[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('citizenship').textContent = extract(/Citizenship[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('position').textContent = extract(/Position[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('foot').textContent = extract(/Foot[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('currentClub').textContent = extract(/CurrentClub[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('famousClubs').textContent = extract(/FamousClubs[:\s]+(.*?)(?:\n|$)/i);
    document.getElementById('achievements').textContent = extract(/Achievements[:\s]+(.*?)(?:\n|$)/is) || 'A legendary football player.';
    
    loadPlayerPhoto(fullName);
    
    setTimeout(() => document.getElementById('playerCard').classList.add('show'), 100);
}

function loadPlayerPhoto(playerName) {
    const photoContainer = document.getElementById('playerPhoto');
    const placeholder = photoContainer.querySelector('.photo-placeholder');
    
    if (!playerName || playerName === 'Unknown Player' || playerName === 'ERROR') {
        placeholder.textContent = '⚽';
        return;
    }
    
    const img = document.createElement('img');
    Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%'
    });
    
    const formattedName = playerName.replace(/ /g, '_');
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(formattedName)}`;
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (data.player && data.player.length > 0) {
                const imageUrl = data.player[0].strThumb || data.player[0].strCutout || data.player[0].strFanart1;
                if (imageUrl) {
                    img.src = imageUrl;
                    img.onload = () => {
                        placeholder.style.display = 'none';
                        photoContainer.appendChild(img);
                    };
                    img.onerror = () => showInitials(playerName, placeholder);
                } else {
                    showInitials(playerName, placeholder);
                }
            } else {
                showInitials(playerName, placeholder);
            }
        })
        .catch(() => showInitials(playerName, placeholder));
}

function showInitials(playerName, placeholder) {
    const nameParts = playerName.split(' ').filter(word => word.length > 0);
    let initials = '⚽';
    
    if (nameParts.length >= 2) {
        initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
    } else if (nameParts.length === 1) {
        initials = nameParts[0].substring(0, 2);
    }
    
    placeholder.textContent = initials.toUpperCase();
}

function resetGame() {
    gameOver.style.display = 'none';
    welcomeScreen.style.display = 'block';
    
    const playerCard = document.getElementById('playerCard');
    playerCard.style.display = 'none';
    playerCard.classList.remove('show');
    
    const placeholder = document.querySelector('.photo-placeholder');
    if (placeholder) placeholder.textContent = '⚽';
    
    chatLog.innerHTML = '<div class="system-message">Think of your questions carefully. You have 10 questions to guess the player!</div>';
    questionInput.value = '';
    guessInput.value = '';
    guessArea.style.display = 'none';
    questionsLeft = 10;
    gameActive = false;
    conversationHistory = [];
    chosenPlayerReference = null;
    updateUI();
}
