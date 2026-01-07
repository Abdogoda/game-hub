// Global Sound Manager using Howler.js
// This file manages all game sounds across the application

const SoundManager = (function() {
    // Sound library - maps sound names to their files and settings
    const soundLibrary = {
        // UI & Menu sounds
        click: { src: '../assets/audio/computer-mouse-click.mp3', volume: 0.5 },
        
        // Success sounds
        success: { src: '../assets/audio/success.mp3', volume: 0.6 },
        successFanfare: { src: '../assets/audio/success-fanfare-trumpets.mp3', volume: 0.5 },
        ding: { src: '../assets/audio/ding.mp3', volume: 0.5 },
        
        // Fail/Error sounds
        fail: { src: '../assets/audio/fail.mp3', volume: 0.6 },
        wrong: { src: '../assets/audio/wrong.mp3', volume: 0.5 },
        buzzer: { src: '../assets/audio/buzzer-or-wrong-answer-20582.mp3', volume: 0.5 },
        
        // Action sounds
        flip: { src: '../assets/audio/flip.mp3', volume: 0.4 },
        jump: { src: '../assets/audio/jump.mp3', volume: 0.5 },
        whoosh: { src: '../assets/audio/whoosh.mp3', volume: 0.4 },
        thud: { src: '../assets/audio/thud.mp3', volume: 0.5 },
        hit: { src: '../assets/audio/metal-hit-96-200425.mp3', volume: 0.5 },
        boing: { src: '../assets/audio/boing-spring-mouth-harp.mp3', volume: 0.5 },
        
        // Timer/Countdown sounds
        beep: { src: '../assets/audio/beep-329314.mp3', volume: 0.4 },
        countdown: { src: '../assets/audio/short-beep-countdown-81121.mp3', volume: 0.5 },
        clockTick: { src: '../assets/audio/clock-ticking-down.mp3', volume: 0.3 },
        raceStart: { src: '../assets/audio/race-start-beeps-125125.mp3', volume: 0.5 },
        
        // Game specific
        clickFast: { src: '../assets/audio/click-fast-305759.mp3', volume: 0.5 },
        message: { src: '../assets/audio/message-notification-190034.mp3', volume: 0.5 },
        levelUp: { src: '../assets/audio/level-up.mp3', volume: 0.6 }
    };

    // Initialize Howl objects
    const sounds = {};
    let initialized = false;
    let soundEnabled = true;

    // Initialize all sounds
    function init() {
        if (initialized) return;
        
        // Check localStorage for saved sound state
        const savedSound = localStorage.getItem('gameHubSound');
        soundEnabled = savedSound === null || savedSound === 'true';
        
        for (const [name, config] of Object.entries(soundLibrary)) {
            sounds[name] = new Howl({
                src: [config.src],
                volume: config.volume,
                preload: true
            });
        }
        
        initialized = true;
        console.log('🔊 Sound Manager initialized with', Object.keys(sounds).length, 'sounds', soundEnabled ? '(enabled)' : '(muted)');
    }

    // Play a sound by name
    function play(soundName) {
        if (!soundEnabled) return;
        
        if (!initialized) {
            init();
        }

        if (sounds[soundName]) {
            sounds[soundName].play();
        } else {
            console.warn(`Sound "${soundName}" not found in sound library`);
        }
    }

    // Stop a specific sound
    function stop(soundName) {
        if (sounds[soundName]) {
            sounds[soundName].stop();
        }
    }

    // Stop all sounds
    function stopAll() {
        for (const sound of Object.values(sounds)) {
            sound.stop();
        }
    }

    // Set volume for a specific sound
    function setVolume(soundName, volume) {
        if (sounds[soundName]) {
            sounds[soundName].volume(volume);
        }
    }

    // Set global volume
    function setGlobalVolume(volume) {
        Howler.volume(volume);
    }

    // Enable/disable sound
    function toggle(enabled) {
        soundEnabled = enabled !== undefined ? enabled : !soundEnabled;
        if (!soundEnabled) {
            stopAll();
        }
        return soundEnabled;
    }

    // Check if sound is enabled
    function isEnabled() {
        return soundEnabled;
    }

    // Get all available sounds
    function getAvailableSounds() {
        return Object.keys(soundLibrary);
    }

    // Public API
    return {
        init,
        play,
        stop,
        stopAll,
        setVolume,
        setGlobalVolume,
        toggle,
        isEnabled,
        getAvailableSounds
    };
})();

// Auto-initialize on load
if (typeof Howl !== 'undefined') {
    SoundManager.init();
} else {
    console.error('Howler.js not loaded! Sound Manager requires Howler.js');
}

// Make it globally available
window.SoundManager = SoundManager;
