const SoundManager = (function() {
    // Detect if we're on the global index.html or in a game subdirectory
    // Check if pathname has subdirectories by counting path segments
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'index.html');
    const isInSubdirectory = pathSegments.length > 0;
    
    // Set path prefix based on location
    const pathPrefix = isInSubdirectory ? '../assets/audio/' : 'assets/audio/';
    
    // Sound library - maps sound names to their files and settings
    const soundLibrary = {
        // UI & Menu sounds
        click: { src: pathPrefix + 'computer-mouse-click.mp3', volume: 0.5 },
        
        // Success sounds
        success: { src: pathPrefix + 'success.mp3', volume: 0.6 },
        successFanfare: { src: pathPrefix + 'success-fanfare-trumpets.mp3', volume: 0.5 },
        ding: { src: pathPrefix + 'ding.mp3', volume: 0.5 },
        
        // Fail/Error sounds
        fail: { src: pathPrefix + 'fail.mp3', volume: 0.6 },
        wrong: { src: pathPrefix + 'wrong.mp3', volume: 0.5 },
        
        // Action sounds
        flip: { src: pathPrefix + 'flip.mp3', volume: 0.4 },
        jump: { src: pathPrefix + 'jump.mp3', volume: 0.5 },
        whoosh: { src: pathPrefix + 'whoosh.mp3', volume: 0.4 },
        thud: { src: pathPrefix + 'thud.mp3', volume: 0.5 },
        hit: { src: pathPrefix + 'metal-hit-96-200425.mp3', volume: 0.5 },
        boing: { src: pathPrefix + 'boing-spring-mouth-harp.mp3', volume: 0.5 },
        
        // Timer/Countdown sounds
        beep: { src: pathPrefix + 'beep-329314.mp3', volume: 0.4 },
        countdown: { src: pathPrefix + 'short-beep-countdown-81121.mp3', volume: 0.5 },
        clockTick: { src: pathPrefix + 'clock-ticking-down.mp3', volume: 0.3 },
        raceStart: { src: pathPrefix + 'race-start-beeps-125125.mp3', volume: 0.5 },
        
        // Game specific
        clickFast: { src: pathPrefix + 'click-fast-305759.mp3', volume: 0.5 },
        message: { src: pathPrefix + 'message-notification-190034.mp3', volume: 0.5 },
        levelUp: { src: pathPrefix + 'level-up.mp3', volume: 0.6 }
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
