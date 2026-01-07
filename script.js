// Global Theme Loader - Load saved theme from localStorage on all pages
(function() {
    const savedTheme = localStorage.getItem('gameHubTheme') || 'purple';
    
    // Apply theme class to body immediately
    if (savedTheme !== 'purple') {
        document.body.classList.add('theme-' + savedTheme);
    }
})();

// Global Sound State Synchronization - Initialize on all pages
(function() {
    // Wait for SoundManager to be available
    const initSoundState = function() {
        if (window.SoundManager) {
            const savedSound = localStorage.getItem('gameHubSound');
            const shouldEnable = savedSound === null || savedSound === 'true';
            window.SoundManager.toggle(shouldEnable);
            console.log('🔊 Sound state initialized:', shouldEnable ? 'enabled' : 'muted');
        }
    };
    
    // Try to initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSoundState);
    } else {
        // Run after a short delay to ensure SoundManager is loaded
        setTimeout(initSoundState, 100);
    }
})();

// Global Sound Control with SoundManager
window.isSoundEnabled = function() {
    return window.SoundManager ? window.SoundManager.isEnabled() : true;
};

window.setSoundEnabled = function(enabled) {
    const soundEnabled = localStorage.getItem('gameHubSound');
    const shouldEnable = enabled !== undefined ? enabled : (soundEnabled === null || soundEnabled === 'true');
    if (window.SoundManager) {
        window.SoundManager.toggle(shouldEnable);
    }
    return shouldEnable;
};

window.playGameSound = function(soundName) {
    if (window.SoundManager && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
    }
};

// Sound Toggle for main page
const soundToggle = document.getElementById('soundToggle');
if (soundToggle) {
    const updateSoundIcon = () => {
        const enabled = window.isSoundEnabled();
        soundToggle.querySelector('.sound-icon').textContent = enabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !enabled);
    };
    
    // Initialize sound state
    const savedSound = localStorage.getItem('gameHubSound');
    if (savedSound !== null) {
        window.setSoundEnabled(savedSound === 'true');
    }
    updateSoundIcon();
    
    soundToggle.addEventListener('click', () => {
        const newState = !window.isSoundEnabled();
        localStorage.setItem('gameHubSound', newState);
        if (window.SoundManager) {
            window.SoundManager.toggle(newState);
        }
        updateSoundIcon();
        
        // Play click sound as feedback
        if (newState) {
            window.playGameSound('click');
        }
    });
}

// Theme Switcher for main page
const themeButtons = document.querySelectorAll('.theme-btn');
const body = document.body;

// Initialize theme on main page
if (themeButtons.length > 0) {
    const savedTheme = localStorage.getItem('gameHubTheme') || 'purple';
    setTheme(savedTheme);
}

// Theme button click handlers (only for main page)
if (themeButtons.length > 0) {
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            localStorage.setItem('gameHubTheme', theme);
        });
    });
}

function setTheme(theme) {
    // Remove all theme classes
    body.classList.remove('theme-purple', 'theme-red', 'theme-orange', 'theme-dark', 'theme-cyan', 'theme-white');
    
    // Add new theme class
    if (theme !== 'purple') {
        body.classList.add(`theme-${theme}`);
    }
    
    // Update active button (only on main page)
    if (themeButtons.length > 0) {
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }
    // Add new theme class
    if (theme !== 'purple') {
        body.classList.add(`theme-${theme}`);
    }
    
    // Update active button
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
}

// Add hover sound effect
const gameCards = document.querySelectorAll('.game-card');
gameCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('click', () => {
        window.playGameSound('click');
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Particle interaction on mouse move
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const particles = document.querySelectorAll('.particle');
particles.forEach((particle, index) => {
    setInterval(() => {
        const rect = particle.getBoundingClientRect();
        const particleX = rect.left + rect.width / 2;
        const particleY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - particleX;
        const deltaY = mouseY - particleY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < 200) {
            const angle = Math.atan2(deltaY, deltaX);
            const force = (200 - distance) / 200;
            const moveX = -Math.cos(angle) * force * 30;
            const moveY = -Math.sin(angle) * force * 30;
            
            particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
            particle.style.transform = 'translate(0, 0)';
        }
    }, 50);
});

// Add entrance animations
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});
