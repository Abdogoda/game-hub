// ============================================
// GLOBAL TRANSLATION SYSTEM - i18n.js
// Handles language switching and translation loading
// ============================================

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        // Load translations
        await this.loadTranslations(this.currentLang);
        
        // Apply initial language
        this.applyLanguage();
        
        // Setup language toggle button
        this.setupLanguageToggle();
        
        // Update HTML direction and lang attributes
        this.updateHTMLAttributes();
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`/assets/translations/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            this.translations = await response.json();
            console.log(`Loaded ${lang} translations:`, this.translations);
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English if error occurs
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    applyLanguage() {
        // Get all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Check if element has placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Handle placeholder-specific translations (data-i18n-placeholder)
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            if (translation && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                element.placeholder = translation;
            }
        });

        // Update language toggle button
        this.updateLanguageToggleButton();
    }

    getTranslation(key) {
        // Split key by dots to navigate nested objects
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return null;
            }
        }
        
        return value;
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        await this.loadTranslations(lang);
        this.applyLanguage();
        this.updateHTMLAttributes();
        
        // Trigger custom event for other scripts to react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateHTMLAttributes() {
        const html = document.documentElement;
        html.setAttribute('lang', this.currentLang);
        html.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
        
        // Add/remove RTL class to body for styling
        if (this.currentLang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    setupLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = this.currentLang === 'en' ? 'ar' : 'en';
                this.switchLanguage(newLang);
            });
        }
    }

    updateLanguageToggleButton() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            const langText = langToggle.querySelector('.lang-text');
            if (langText) {
                langText.textContent = this.currentLang === 'en' ? 'AR' : 'EN';
            }
        }
    }

    // Helper method for dynamic translations in JavaScript
    t(key) {
        return this.getTranslation(key) || key;
    }

    // Get current language
    getCurrentLang() {
        return this.currentLang;
    }
}

// Initialize i18n system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n = new I18n();
    });
} else {
    window.i18n = new I18n();
}
