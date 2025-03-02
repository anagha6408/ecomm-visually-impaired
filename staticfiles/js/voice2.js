let currentUtterance = null;
let speechSpeed = 1;
let isPaused = false;

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('[data-description]');
    
    // Speak welcome message after a short delay to avoid interference
    setTimeout(speakWelcome, 1000); // Delay of 1 second

    // Hover over voice control
    elements.forEach(element => {
        element.addEventListener('mouseover', function () {
            const description = this.getAttribute('data-description');
            if (!window.speechSynthesis.speaking || isPaused) {
                speak(description);
            }
        });
    });

    // Initialize tabs and select the first one
    const tabs = document.querySelectorAll('.tab-item, button, input, a, span, p');
    if (tabs.length > 0) {
        tabs[0].classList.add('selected-tab');  // Automatically select the first tab
        speakSelected();  // Speak description of the first tab
    }

    // Tab Navigation & Voice on Click
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove previous selection
            tabs.forEach(t => t.classList.remove('selected-tab'));

            // Highlight the clicked tab
            this.classList.add('selected-tab');
            speakSelected();
        });
    });

    // Keyboard controls for tab navigation and speech control
    document.addEventListener('keydown', function (e) {
        if (e.target === document.body) {
            e.preventDefault(); // Prevent page scroll

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
});

// Navigate through tabs using the keyboard (ArrowDown/ArrowUp)
function navigateTabs(direction) {
    const tabs = document.querySelectorAll('.tab-item, button, input, a, span, p');
    let currentTab = document.querySelector('.selected-tab');
    let newTab;

    if (!currentTab) return;

    const currentIndex = Array.from(tabs).indexOf(currentTab);
    
    if (direction === 'down') {
        newTab = tabs[(currentIndex + 1) % tabs.length];
    } else if (direction === 'up') {
        newTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
    }

    // Update the selected tab
    if (newTab) {
        currentTab.classList.remove('selected-tab');
        newTab.classList.add('selected-tab');
        speakSelected();
    }
}

// Activate the selected tab when Enter is pressed
function activateSelectedTab() {
    const selectedTab = document.querySelector('.selected-tab');
    if (selectedTab) {
        selectedTab.click(); // Simulate a click on the selected tab
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

// Speak the welcome message when the page loads
function speakWelcome() {
    const welcomeMessage = document.getElementById("welcome-message").textContent;
    speak(welcomeMessage);
}

// Function to speak the provided text
function speak(text) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
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
            document.getElementById('toggleButton').textContent = 'Pause (Space)';
        } else {
            window.speechSynthesis.pause();
            isPaused = true;
            document.getElementById('toggleButton').textContent = 'Play (Space)';
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
    document.getElementById('speedValue').textContent = speechSpeed + 'x';

    // Restart speech with new speed if something is being spoken
    if (window.speechSynthesis.speaking) {
        speak(currentUtterance.text);
    }
}
