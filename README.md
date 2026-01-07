# Multi-Game Hub

A collection of 10 interactive games with bilingual support (English/Arabic).

## Setup

1. Clone the repository
2. Copy `config.example.json` to `config.json`
3. Add your Groq API key to `config.json` (only needed for Football Guesser game)
4. Open `index.html` in your browser

## Games Included

1. **Football Guesser** - AI-powered football player guessing game
2. **Hangman** - Classic word guessing game
3. **Tic-Tac-Toe** - Two player strategy game
4. **Memory Card** - Card matching memory game
5. **Whack-a-Mole** - Fast-paced reaction game
6. **Platform Jumper** - Jumping platformer game
7. **Snake** - Classic snake game
8. **Typing Speed** - Test your typing speed
9. **Reaction Time** - Test your reaction time
10. **Stealth Mission** - Avoid detection stealth game

## Features

- 🌍 Bilingual support (English/Arabic)
- 🎨 7 color themes
- 🔊 Sound effects with toggle
- 📱 Responsive design
- 💾 Score persistence with localStorage

## API Key Security

**Important:** Never commit your actual API key to Git. The `config.json` file is ignored by Git to prevent accidental exposure.

To get a Groq API key:

1. Visit https://console.groq.com
2. Sign up for an account
3. Generate an API key
4. Add it to your local `config.json` file

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Groq AI API
