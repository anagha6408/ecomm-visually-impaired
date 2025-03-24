//voice4.js copy march 23 7:47pm

let currentUtterance = null;
let speechSpeed = 1;
let isPaused = false;
let isKeyboardMode = false;

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById('navToggle');
    const navModeLabel = document.getElementById('navModeLabel');
    // Retrieve stored keyboard mode preference
    const savedMode = localStorage.getItem('keyboardMode');
    if (savedMode !== null) {
        isKeyboardMode = savedMode === 'true'; // Convert string back to boolean
        navToggle.checked = isKeyboardMode;

        navModeLabel.textContent = isKeyboardMode ? 'Keyboard Mouse Navigation' : 'Mouse Navigation';
        
    }
    // Updated selector to include all interactive elements including product view elements
    const interactiveElements = document.querySelectorAll(`
        a[data-description], 
        button[data-description], 
        input[data-description], 
        [class*="col-"][data-description],
        label[data-description],
        h2[data-description],
        h5[data-description],
        h6[data-description],
        p[data-description],
        h3[data-description],
        .badge[data-description],
        img[data-description],
        .toggle-container[data-description],
        select[data-description],
        select,
    `);

    // Initial hover listeners
    interactiveElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            if (!isKeyboardMode) {
                const description = this.getAttribute('data-description');
                if (description) {
                    speak(description);
                }
            }
        });
    });

    // Add quantity control functionality
    const decrementBtn = document.querySelector('.decrement-btn');
    const incrementBtn = document.querySelector('.increment-btn');
    const quantityInput = document.querySelector('input[name="quantity"]');

    if (decrementBtn && incrementBtn && quantityInput) {
        decrementBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                value--;
                quantityInput.value = value;
                quantityInput.setAttribute('data-description', `Current quantity: ${value}`);
            }
        });

        incrementBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            value++;
            quantityInput.value = value;
            quantityInput.setAttribute('data-description', `Current quantity: ${value}`);
        });
    }

    // Navigation mode toggle
    navToggle.addEventListener('change', function() {
        isKeyboardMode = this.checked;
        localStorage.setItem('keyboardMode', isKeyboardMode); // Store the value
        
        navModeLabel.textContent = isKeyboardMode ? 'Keyboard Navigation' : 'Mouse Navigation';
    
        if (isKeyboardMode) {
            // If switching to Keyboard Mode, initialize first tab selection and speech
            const interactiveElements = document.querySelectorAll(`
                a[data-description], 
                button[data-description], 
                input[data-description], 
                [class*="col-"][data-description],
                label[data-description],
                h2[data-description],
                h5[data-description],
                h6[data-description],
                p[data-description],
                h3[data-description],
                .badge[data-description],
                img[data-description],
                .toggle-container[data-description],
                select[data-description],
                select,
            `);
            if (interactiveElements.length > 0) {
                // Explicitly select the first tab and speak its description
                interactiveElements[0].classList.add('selected-tab');
                speakSelected();
            }
        } else {
            // If switching to Mouse Mode, remove the selection, stop speech, and prevent initial tab speech
            const selectedTab = document.querySelector('.selected-tab');
            if (selectedTab) {
                selectedTab.classList.remove('selected-tab');
            }
            window.speechSynthesis.cancel(); // Stop any ongoing speech
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
                case 'ArrowRight':
                    navigateTabs('next');
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    navigateTabs('prev');
                    break;
                case 'Enter':
                    activateSelectedTab();
                    break;
            }
        }
    });

    // Initial tab selection and speaking
    if (isKeyboardMode && interactiveElements.length > 0) {
        interactiveElements[0].classList.add('selected-tab');
        speakSelected();
    }
    console.log("All selects on page:", document.querySelectorAll('select'));
});

// Updated navigation function with comprehensive selector
function navigateTabs(direction) {
    const interactiveElements = Array.from(document.querySelectorAll(`
        a[data-description], 
        button[data-description], 
        input[data-description], 
        [class*="col-"][data-description],
        label[data-description],
        h2[data-description],
        h5[data-description],
        h6[data-description],
        p[data-description],
        h3[data-description],
        .badge[data-description],
        img[data-description],
       .toggle-container[data-description],
       select[data-description],
       select,
    `));
    
    let currentTab = document.querySelector('.selected-tab');
    let currentIndex = currentTab ? interactiveElements.indexOf(currentTab) : -1;
    let newIndex;

    if (direction === 'next') {
        newIndex = currentIndex + 1;
        if (newIndex >= interactiveElements.length) newIndex = 0;
    } else {
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = interactiveElements.length - 1;
    }

    if (currentTab) {
        currentTab.classList.remove('selected-tab');
    }
    
    interactiveElements[newIndex].classList.add('selected-tab');
    speakSelected();

   // Handle speech for the selected element
   const newSelectedElement = interactiveElements[newIndex];
    
    if (!newSelectedElement) {
        console.error("No element found at index:", newIndex);
        return;
    }
    
    newSelectedElement.classList.add('selected-tab');

    // Handle speech for the selected element
    if (newSelectedElement.tagName === 'SELECT') {
        console.log("Select element detected"); // Debug
        
        // Try to get description from the label
        const selectId = newSelectedElement.id;
        const label = document.querySelector(`label[for="${selectId}"]`);
        
        if (label && label.getAttribute('data-description')) {
            // Speak the label description 
            speak(label.getAttribute('data-description'));
            console.log("Speaking label description:", label.getAttribute('data-description')); // Debug
        } else {
            // Try to get description from the currently selected option
            const selectedOption = newSelectedElement.options[newSelectedElement.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-description')) {
                speak(selectedOption.getAttribute('data-description'));
                console.log("Speaking option description:", selectedOption.getAttribute('data-description')); // Debug
            } else {
                // Last resort - try the select element's own description
                const selectDescription = newSelectedElement.getAttribute('data-description');
                if (selectDescription) {
                    speak(selectDescription);
                    console.log("Speaking select description:", selectDescription); // Debug
                } else {
                    // If all else fails, speak the select's text content
                    speak("Select dropdown: " + newSelectedElement.textContent.trim().substring(0, 50));
                    console.log("Speaking fallback text"); // Debug
                }
            }
        }
    } else {
        // For all other elements, use standard description
        const description = newSelectedElement.getAttribute('data-description');
        if (description) {
            speak(description);
            console.log("Speaking element description:", description); // Debug
        }
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

// Updated activateSelectedTab function to handle all interactive elements
function activateSelectedTab() {
    const selectedTab = document.querySelector('.selected-tab');
    if (!selectedTab) return;

    if (selectedTab.tagName === 'INPUT') {
        selectedTab.focus();
    }else if (selectedTab.tagName === 'SELECT') {

        selectedTab.focus();
       

    }else if (selectedTab.tagName === 'BUTTON') {
        selectedTab.click();
    } else if (selectedTab.tagName === 'A') {
        window.location.href = selectedTab.href;
    } else if (selectedTab.classList.toString().includes('col-')) {
        const link = selectedTab.querySelector('a');
        if (link) {
            window.location.href = link.href;
        }
    } else if (selectedTab.classList.contains('increment-btn')) {
        selectedTab.click();
    } else if (selectedTab.classList.contains('decrement-btn')) {
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

// Add CSS style for selected tab
const style = document.createElement('style');
style.textContent = `
    .selected-tab {
        outline: 3px solid #007bff !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(style);   