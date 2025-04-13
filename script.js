// Shared settings functions
function loadSettings() {
    const timeLimitInput = document.getElementById('time-limit');
    const notificationsEnabledInput = document.getElementById('notifications-enabled');

    const savedTimeLimit = localStorage.getItem('timeLimit') || '600';
    timeLimitInput.value = savedTimeLimit;

    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    notificationsEnabledInput.checked = savedNotificationsEnabled;
}

function saveSettings() {
    const timeLimitInput = document.getElementById('time-limit');
    const notificationsEnabledInput = document.getElementById('notifications-enabled');

    localStorage.setItem('timeLimit', timeLimitInput.value);
    localStorage.setItem('notificationsEnabled', notificationsEnabledInput.checked);
}

// Main page logic
if (document.getElementById('main-content')) {
    // Elements
    const screenTimeElement = document.getElementById('screen-time');
    const timeLimitInput = document.getElementById('time-limit');
    const lockoutOverlay = document.getElementById('lockout-overlay');
    const timeRemainingElement = document.getElementById('time-remaining');
    const unlockButton = document.getElementById('unlock-button');
    const unlockCountdownElement = document.getElementById('unlock-countdown');
    const countdownSecondsElement = document.getElementById('countdown-seconds');

    // State
    let timeSpent = 0;
    let isLocked = false;
    let unlockCountdown = 0;

    // Load initial settings
    loadSettings();
    timeLimitInput.addEventListener('input', saveSettings);

    // Check lockout state
    const lockoutStart = localStorage.getItem('lockoutStart');
    if (lockoutStart) {
        const lockoutDate = new Date(lockoutStart);
        const today = new Date();
        if (lockoutDate.toDateString() === today.toDateString()) {
            isLocked = true;
            timeSpent = parseInt(localStorage.getItem('timeSpent') || '0', 10);
            lockoutOverlay.classList.remove('hidden');
        } else {
            clearLockoutState();
        }
    }

    // Timer for screen time
    setInterval(() => {
        if (!isLocked) {
            timeSpent++;
            screenTimeElement.textContent = timeSpent;

            const timeLimit = parseInt(timeLimitInput.value, 10);
            const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';

            // 5-minute warning
            if (timeLimit >= 300 && timeSpent === timeLimit - 300 && notificationsEnabled) {
                if (Notification.permission === 'granted') {
                    new Notification('Pause', { body: '5 minutes until your screen time limit!' });
                }
            }

            // Lockout
            if (timeSpent >= timeLimit) {
                isLocked = true;
                lockoutOverlay.classList.remove('hidden');
                localStorage.setItem('lockoutStart', new Date().toISOString());
                localStorage.setItem('timeSpent', timeSpent);

                if (notificationsEnabled && Notification.permission === 'granted') {
                    new Notification('Pause', { body: 'Screen time limit reached! Focus on your tasks.' });
                }
            }
        }

        // Update time remaining until midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const secondsUntilMidnight = Math.floor((midnight - now) / 1000);
        const hours = Math.floor(secondsUntilMidnight / 3600);
        const minutes = Math.floor((secondsUntilMidnight % 3600) / 60);
        const seconds = secondsUntilMidnight % 60;
        timeRemainingElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);

    // Unlock button logic
    unlockButton.addEventListener('click', () => {
        unlockCountdown = 10;
        unlockButton.disabled = true;
        unlockCountdownElement.classList.remove('hidden');
        countdownSecondsElement.textContent = unlockCountdown;

        const countdownInterval = setInterval(() => {
            unlockCountdown--;
            countdownSecondsElement.textContent = unlockCountdown;

            if (unlockCountdown <= 0) {
                clearInterval(countdownInterval);
                clearLockoutState();
                isLocked = false;
                timeSpent = 0;
                lockoutOverlay.classList.add('hidden');
                unlockButton.disabled = false;
                unlockCountdownElement.classList.add('hidden');
            }
        }, 1000);
    });

    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Clear lockout state
function clearLockoutState() {
    localStorage.removeItem('lockoutStart');
    localStorage.removeItem('timeSpent');
}

// Add stars to the background
function addStars() {
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        document.body.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addStars();
});