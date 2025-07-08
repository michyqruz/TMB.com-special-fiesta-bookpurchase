// Enhanced device detection
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
};

const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
};

// DOM elements
const elements = {
    installPrompt: document.getElementById('installPrompt'),
    postInstall: document.getElementById('postInstall'),
    appContent: document.getElementById('appContent'),
    androidInstall: document.getElementById('androidInstall'),
    iosInstall: document.getElementById('iosInstall'),
    showSafariHelp: document.getElementById('showSafariHelp'),
    showAndroidHelp: document.getElementById('showAndroidHelp'),
    safariOverlay: document.getElementById('safariOverlay'),
    androidOverlay: document.getElementById('androidOverlay'),
    flowpage: document.getElementById('toform')
};

// Initialize the UI based on device and installation status
const initApp = () => {
    if (isStandalone()) {
        // Running as installed PWA - show content
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.add('hidden');
        elements.appContent.classList.remove('hidden');
        
        // Store installation status
        localStorage.setItem('pwaInstalled', 'true');
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        // Just installed - show post-install message
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.remove('hidden');
        elements.appContent.classList.add('hidden');
        
        // Redirect to clean URL after showing message
        setTimeout(() => {
            window.location.href = window.location.pathname;
        }, 3000);
    } else {
        // Not installed - show install prompt
        elements.installPrompt.classList.remove('hidden');
        elements.postInstall.classList.add('hidden');
        elements.appContent.classList.add('hidden');
        
        if (isIOS()) {
            elements.androidInstall.classList.add('hidden');
            elements.iosInstall.classList.remove('hidden');
        } else if (isAndroid()) {
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
        }
    }
};

// Check for PWA installation status periodically
const checkPWAStatus = () => {
    if (isStandalone()) {
        localStorage.setItem('pwaInstalled', 'true');
        initApp();
    }
};

// Event listeners
elements.showSafariHelp?.addEventListener('click', () => {
    elements.safariOverlay.classList.remove('hidden');
});

elements.showAndroidHelp?.addEventListener('click', () => {
    elements.androidOverlay.classList.remove('hidden');
});

document.querySelectorAll('.close-overlay').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.overlay').forEach(overlay => {
            overlay.classList.add('hidden');
        });
    });
});

elements.flowpage?.addEventListener('click', () => {
    window.location.href = 'flow.html';
});

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    // Check every second if PWA was installed
    setInterval(checkPWAStatus, 1000);
});

// Additional check when page is shown from back/forward cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initApp();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
