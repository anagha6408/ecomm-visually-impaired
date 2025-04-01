if (typeof window.voiceNavInitialized === 'undefined') {
    window.voiceNavInitialized = true;

    let currentUtterance = null;
    let speechSpeed = 1;
    let isPaused = false;
    let isKeyboardMode = false;
    console.log("Voicewwww.js loaded");

    document.addEventListener("DOMContentLoaded", function () {
        const navToggle = document.getElementById('navToggle');
        const navModeLabel = document.getElementById('navModeLabel');

        // Retrieve stored keyboard mode preference
        const savedMode = localStorage.getItem('keyboardMode');
        if (savedMode !== null) {
            isKeyboardMode = savedMode === 'true'; // Convert string back to boolean
            navToggle.checked = isKeyboardMode;
            navModeLabel.textContent = isKeyboardMode ? 'Keyboard Navigation' : 'Mouse Navigation';
        }

        // Log all select elements on page at load time
        console.log("===== SELECT ELEMENTS DETECTED =====");
        const allSelectsOnLoad = document.querySelectorAll('select');
        console.log(`Found ${allSelectsOnLoad.length} select elements`);
        allSelectsOnLoad.forEach((sel, i) => {
            console.log(`Select ${i}:`, sel.id || 'no-id', sel.getAttribute('data-description') || 'no-description');

            // Ensure all selects have data-description if they don't already
            if (!sel.hasAttribute('data-description') && sel.id === 'existing_addresses') {
                sel.setAttribute('data-description', 'Select a saved address');
                console.log("Added description to select:", sel.id);
            }
        });

        // Specifically check for the address select element
        const addressSelect = document.getElementById('existing_addresses');
        if (addressSelect) {
            console.log("Found address select:", addressSelect);
            console.log("Has data-description:", addressSelect.hasAttribute('data-description'));

            // Make sure it has a data-description
            if (!addressSelect.hasAttribute('data-description')) {
                addressSelect.setAttribute('data-description', 'Select a saved address');
            }

            // Explicitly add event listener for keyboard selection
            addressSelect.addEventListener('focus', function () {
                if (isKeyboardMode) {
                    // Clear any existing selections
                    document.querySelectorAll('.selected-tab').forEach(el => el.classList.remove('selected-tab'));
                    this.classList.add('selected-tab');
                    speakSelected();
                }
            });
        } else {
            console.error("Could not find address select element!");
        }

        // Updated selector to include all interactive elements including product view elements
        const interactiveElements = document.querySelectorAll(`
            a[data-description], 
            button[data-description], 
            input[data-description], 
            [class*="col-"][data-description],
            label[data-description],
            h1[data-description],
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
            div[data-description][tabindex="0"],
            tr[data-description],
            th[data-description],
            td[data-description],
            h4[data-description],
            li[data-description],
            iframe[data-description]
        `);

        // Initial hover listeners
        interactiveElements.forEach(element => {
            element.addEventListener('mouseover', function () {
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
            decrementBtn.addEventListener('click', function () {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    value--;
                    quantityInput.value = value;
                    quantityInput.setAttribute('data-description', `Current quantity: ${value}`);
                    speak(`Current quantity: ${value}`); // Announce new quantity
                }
            });

            incrementBtn.addEventListener('click', function () {
                let value = parseInt(quantityInput.value);
                value++;
                quantityInput.value = value;
                quantityInput.setAttribute('data-description', `Current quantity: ${value}`);
                speak(`Current quantity: ${value}`); // Announce new quantity
            });
        }
        
        // Navigation mode toggle
        // When toggling to keyboard mode
        navToggle.addEventListener('change', function () {
            isKeyboardMode = this.checked;
            localStorage.setItem('keyboardMode', isKeyboardMode);
            navModeLabel.textContent = isKeyboardMode ? 'Keyboard Navigation' : 'Mouse Navigation';

            if (isKeyboardMode) {
                // Get the CURRENT state of all interactive elements on the page
                const currentInteractiveElements = document.querySelectorAll(`
                    a[data-description], 
                    button[data-description], 
                    input[data-description], 
                    [class*="col-"][data-description],
                    label[data-description],
                    h1[data-description],
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
                    div[data-description][tabindex="0"],
                    tr[data-description],
                    th[data-description],
                    td[data-description],
                    h4[data-description],
                    li[data-description],
                    iframe[data-description]
                `);
                
                // Clear any existing selections first
                document.querySelectorAll('.selected-tab').forEach(el => el.classList.remove('selected-tab'));
                
                if (currentInteractiveElements.length > 0) {
                    currentInteractiveElements[0].classList.add('selected-tab');
                    speakSelected();
                }
                window.location.reload();
            } else {
                // Remove selection when switching to mouse mode
                document.querySelectorAll('.selected-tab').forEach(el => el.classList.remove('selected-tab'));
                window.speechSynthesis.cancel();
            }
        });

        // Add keyboard support for the toggle control
        navToggle.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.checked = !this.checked;
                
                // Update the keyboard mode directly
                isKeyboardMode = this.checked;
                localStorage.setItem('keyboardMode', isKeyboardMode);
                navModeLabel.textContent = isKeyboardMode ? 'Keyboard Navigation' : 'Mouse Navigation';
                
                // Apply the appropriate navigation mode actions
                if (isKeyboardMode) {
                    const interactiveElements = document.querySelectorAll(`
                        a[data-description], 
                        button[data-description], 
                        input[data-description], 
                        [class*="col-"][data-description],
                        /* other selectors as in original code */
                    `);
                    if (interactiveElements.length > 0) {
                        interactiveElements[0].classList.add('selected-tab');
                        speakSelected();
                    }
                } else {
                    const selectedTab = document.querySelector('.selected-tab');
                    if (selectedTab) {
                        selectedTab.classList.remove('selected-tab');
                    }
                    window.speechSynthesis.cancel();
                }
            }
        });

        // Similar update for the label
        navModeLabel.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                navToggle.checked = !navToggle.checked;
                
                // Update the keyboard mode directly
                isKeyboardMode = navToggle.checked;
                localStorage.setItem('keyboardMode', isKeyboardMode);
                navModeLabel.textContent = isKeyboardMode ? 'Keyboard Navigation' : 'Mouse Navigation';
                
                // Apply the appropriate navigation mode actions
                if (isKeyboardMode) {
                    const interactiveElements = document.querySelectorAll(`
                        a[data-description], 
                        button[data-description], 
                        input[data-description], 
                        [class*="col-"][data-description],
                        /* other selectors as in original code */
                    `);
                    if (interactiveElements.length > 0) {
                        interactiveElements[0].classList.add('selected-tab');
                        speakSelected();
                    }
                } else {
                    const selectedTab = document.querySelector('.selected-tab');
                    if (selectedTab) {
                        selectedTab.classList.remove('selected-tab');
                    }
                    window.speechSynthesis.cancel();
                }
            }
        });

        // Keyboard controls for navigation and speech control
        document.addEventListener('keydown', function (e) {
            if (e.target === document.body) {
                e.preventDefault();
                //resetNavigation();
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
                    case 'Escape':
                        resetNavigation();
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

        // Add event listener for Reset button
        const resetButton = document.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                resetNavigation();
            });
        }
    });

    // Updated navigation function with comprehensive selector
    function navigateTabs(direction) {
        const interactiveElements = Array.from(document.querySelectorAll(`
            a[data-description], 
            button[data-description], 
            input[data-description], 
            [class*="col-"][data-description],
            label[data-description],
            h1[data-description],
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
        div[data-description][tabindex="0"],
        tr[data-description],
        th[data-description],
        td[data-description],
        h4[data-description],
        li[data-description],
        iframe[data-description]
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
        } else if (selectedTab.tagName === 'SELECT') {
            selectedTab.focus();
        } else if (selectedTab.tagName === 'BUTTON') {
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
        } else if (selectedTab.tagName === 'DIV' && selectedTab.id === 'paypal-button-container') {
            // Find the form inside the div and submit it
            const form = selectedTab.querySelector('form');
            if (form) {
                form.submit();
            }
        } else if (selectedTab.classList.contains('toggle-container')) {
            // Handle toggle container activation
            const toggle = selectedTab.querySelector('input[type="checkbox"]');
            if (toggle) {
                toggle.checked = !toggle.checked;
                // Trigger the change event manually
                const changeEvent = new Event('change');
                toggle.dispatchEvent(changeEvent);
            }
        }
    }

    // Updated resetNavigation function
    function resetNavigation() {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Remove 'selected-tab' class from all elements
        const selectedElements = document.querySelectorAll('.selected-tab');
        selectedElements.forEach(el => el.classList.remove('selected-tab'));

        // Get all interactive elements
        const interactiveElements = Array.from(document.querySelectorAll(`
            a[data-description], 
            button[data-description], 
            input[data-description], 
            [class*="col-"][data-description],
            label[data-description],
            h1[data-description],
            h2[data-description],
            h5[data-description],
            h6[data-description],
            p[data-description],
            h3[data-description],
            .badge[data-description],
            img[data-description],
            .toggle-container[data-description],
            select[data-description],
            div[data-description][tabindex="0"],
            tr[data-description],
            th[data-description],
            td[data-description],
            h4[data-description],
            li[data-description],
            iframe[data-description]
        `));

        // Check if interactive elements exist
        if (interactiveElements.length > 0) {
            // Select the first interactive element again
            const firstElement = interactiveElements[0];
            firstElement.classList.add('selected-tab');

            // Focus on the first element
            if (firstElement.tagName === 'INPUT' || firstElement.tagName === 'SELECT') {
                firstElement.focus();
                console.log(`Focus set on: ${firstElement.tagName} with description: ${firstElement.getAttribute('data-description')}`);
            } else {
                firstElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log(`Scrolled into view: ${firstElement.tagName} with description: ${firstElement.getAttribute('data-description')}`);
            }

            // Announce it again
            speakSelected();
        }
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            let utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        } else {
            console.error("Speech synthesis not supported.");
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
            window.speechSynthesis.cancel(); // Stop current speech
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

}