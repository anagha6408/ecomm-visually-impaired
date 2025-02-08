let currentUtterance = null;
let speechSpeed = 1;
let isPaused = false;
let isKeyboardMode = false;

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById('navToggle');
    const navModeLabel = document.getElementById('navModeLabel');
    const tabs = document.querySelectorAll('[data-description]');

    // Initial hover listeners
    tabs.forEach(element => {
        element.addEventListener('mouseover', function() {
            if (!isKeyboardMode) {
                const description = this.getAttribute('data-description');
                if (description) {
                    speak(description);
                }
            }
        });
    });

    // Navigation mode toggle
    navToggle.addEventListener('change', function() {
        isKeyboardMode = this.checked;
        
        if (isKeyboardMode) {
            navModeLabel.textContent = 'Mouse Navigation';
        } else {
            navModeLabel.textContent = 'Keyboard Navigation (Default)';
        }
    });

    // Keyboard controls for navigation and speech control
    document.addEventListener('keydown', function (e) {
        if (e.target === document.body) {
            e.preventDefault();

            switch (e.code) {
                case 'Space':
                    toggleSpeech();
                    break;
                case 'KeyD':
                    decreaseSpeed();
                    break;
                case 'KeyI':
                    increaseSpeed();
                    break;
                case 'KeyR':
                    replaySpeech();
                    break;
                case 'ArrowDown':
                    navigateTabs('down');
                    break;
                case 'ArrowUp':
                    navigateTabs('up');
                    break;
                case 'Enter':
                    activateSelectedTab();
                    break;
            }
        }
    });

    // Initial tab selection and speaking
    if (tabs.length > 0) {
        tabs[0].classList.add('selected-tab');
        speakSelected();
    }
});

// Navigate through tabs using the keyboard
function navigateTabs(direction) {
    const tabs = document.querySelectorAll('[data-description]');
    let currentTab = document.querySelector('.selected-tab');
    let newTab;

    if (!currentTab) return;

    const currentIndex = Array.from(tabs).indexOf(currentTab);
    
    if (direction === 'down') {
        newTab = tabs[(currentIndex + 1) % tabs.length];
    } else if (direction === 'up') {
        newTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
    }

    if (newTab) {
        currentTab.classList.remove('selected-tab');
        newTab.classList.add('selected-tab');
        speakSelected();
    }
}

// Speak the description of the currently selected tab
function speakSelected() {
    const selectedElement = document.querySelector('.selected-tab');
    if (selectedElement) {
        const description = selectedElement.getAttribute('data-description');
        if (description) {
            speak(description);
        }
    }
}

// Activate the selected tab when Enter is pressed
function activateSelectedTab() {
    const selectedTab = document.querySelector('.selected-tab');
    if (selectedTab) {
        selectedTab.click();
    }
}

// Function to speak the provided text
function speak(text) {
    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = speechSpeed;
    window.speechSynthesis.speak(currentUtterance);
}

// Toggle between play and pause for speech
function toggleSpeech() {
    if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            isPaused = false;
        } else {
            window.speechSynthesis.pause();
            isPaused = true;
        }
    }
}

// Replay the last spoken text
function replaySpeech() {
    if (currentUtterance) {
        speak(currentUtterance.text);
    }
}

// Decrease the speech speed
function decreaseSpeed() {
    if (speechSpeed > 0.5) {
        speechSpeed = Math.round((speechSpeed - 0.25) * 100) / 100;
        updateSpeedDisplay();
    }
}

// Increase the speech speed
function increaseSpeed() {
    if (speechSpeed < 2) {
        speechSpeed = Math.round((speechSpeed + 0.25) * 100) / 100;
        updateSpeedDisplay();
    }
}

// Update the speech speed display
function updateSpeedDisplay() {
    const speedValueElement = document.getElementById('speedValue');
    if (speedValueElement) {
        speedValueElement.textContent = speechSpeed + 'x';
    }

    if (window.speechSynthesis.speaking) {
        speak(currentUtterance.text);
    }
}