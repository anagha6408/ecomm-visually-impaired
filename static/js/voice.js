let currentUtterance = null;
let speechSpeed = 1;
let isPaused = false;

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('[data-description]');
    // Speak welcome message after a short delay to avoid interference
    setTimeout(speakWelcome, 1000); // Delay of 1 second

    elements.forEach(element => {
        element.addEventListener('mouseover', function () {
            const description = this.getAttribute('data-description');
            if (!window.speechSynthesis.speaking || isPaused) {
                speak(description);
            }
        });
    });

    // Keyboard controls
    document.addEventListener('keydown', function (e) {
        if (e.target === document.body) {
            e.preventDefault(); // Prevent page scroll

            switch (e.code) {
                case 'Space':
                    toggleSpeech();
                    break;
                case 'ArrowLeft':
                    decreaseSpeed();
                    break;
                case 'ArrowRight':
                    increaseSpeed();
                    break;
                case 'KeyR':
                    replaySpeech();
                    break;
            }
        }
    });
});

function speakWelcome() {
    const welcomeMessage = document.getElementById("welcome-message").textContent;
    speak(welcomeMessage);
}

function speak(text) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = speechSpeed;
    window.speechSynthesis.speak(currentUtterance);
}

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

function replaySpeech() {
    if (currentUtterance) {
        speak(currentUtterance.text);
    }
}

function decreaseSpeed() {
    if (speechSpeed > 0.5) {
        speechSpeed = Math.round((speechSpeed - 0.25) * 100) / 100;
        updateSpeedDisplay();
    }
}

function increaseSpeed() {
    if (speechSpeed < 2) {
        speechSpeed = Math.round((speechSpeed + 0.25) * 100) / 100;
        updateSpeedDisplay();
    }
}

function updateSpeedDisplay() {
    document.getElementById('speedValue').textContent = speechSpeed + 'x';

    // Restart speech with new speed if something is being spoken
    if (window.speechSynthesis.speaking) {
        speak(currentUtterance.text);
    }
}
