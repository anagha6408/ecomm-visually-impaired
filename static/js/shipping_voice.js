// Form Voice Input Extension with Fixes
// Function to add voice input buttons to form fields
console.log('Shipping voice js .. file.');
function setupFormVoiceInput() {
    const formFields = document.querySelectorAll('#shipping-form input, #shipping-form select');
    
    // Add CSS for recording animation
    if (!document.getElementById('voice-input-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'voice-input-styles';
        styleSheet.textContent = `
            @keyframes recordingPulse {
                0% { transform: scale(1); background-color: #007bff; }
                50% { transform: scale(1.1); background-color: #dc3545; }
                100% { transform: scale(1); background-color: #007bff; }
            }
            .voice-recording {
                animation: recordingPulse 1.5s infinite;
            }
            .voice-input-wave {
                position: absolute;
                bottom: -10px;
                left: 0;
                width: 100%;
                height: 20px;
                display: none;
                background-color: rgba(220, 53, 69, 0.1);
                overflow: hidden;
            }
            .voice-input-wave.active {
                display: block;
            }
            .voice-input-wave:after {
                content: '';
                display: block;
                position: absolute;
                width: 300%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
                animation: wave 1.5s linear infinite;
                transform: translateX(-100%);
            }
            @keyframes wave {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .voice-input-btn {
                position: relative;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    formFields.forEach(field => {
        // Skip if the field already has a voice button
        if (field.nextElementSibling && field.nextElementSibling.classList.contains('voice-input-btn')) {
            return;
        }
        
        // Create voice input button
        const voiceBtn = document.createElement('button');
        voiceBtn.type = 'button';
        voiceBtn.className = 'voice-input-btn';
        voiceBtn.textContent = '🎤';
        voiceBtn.setAttribute('data-description', 'Click to speak your ' + (field.previousElementSibling ? field.previousElementSibling.textContent : 'information'));
        voiceBtn.style.marginLeft = '10px';
        
        // Make the button easily discoverable
        voiceBtn.style.padding = '8px 12px';
        voiceBtn.style.fontSize = '16px';
        voiceBtn.style.backgroundColor = '#007bff';
        voiceBtn.style.color = 'white';
        voiceBtn.style.border = 'none';
        voiceBtn.style.borderRadius = '4px';
        
        // Create wave animation element
        const waveEl = document.createElement('div');
        waveEl.className = 'voice-input-wave';
        voiceBtn.appendChild(waveEl);
        
        // Insert button after the field
        field.parentNode.insertBefore(voiceBtn, field.nextSibling);
        
        // Set up voice recognition functionality
        voiceBtn.addEventListener('click', function() {
            startVoiceInput(field, voiceBtn);
        });
        
        // Add keyboard support for voice button
        voiceBtn.setAttribute('tabindex', '0');
        voiceBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startVoiceInput(field, voiceBtn);
            }
        });
    });
    
    // Special handling for address dropdown
    const addressDropdown = document.getElementById('existing_addresses');
    if (addressDropdown) {
        // Add voice feedback for selected addresses
        addressDropdown.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value !== "") {
                const addressText = selectedOption.textContent.trim();
                speak("Selected address: " + addressText);
                
                // Auto-scroll to the shipping form
                setTimeout(() => {
                    document.getElementById('shipping-form').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 1000);
            }
        });
    }
    
    // Set up keyboard instructions
    document.addEventListener('keydown', function(e) {
        // Alt+H to hear instructions
        if (e.key === 'h') {
            e.preventDefault();
            speak(document.getElementById('instructions').textContent);
        }
        
        // Add arrow key navigation
        handleArrowNavigation(e);
    });
}

// Function to handle arrow key navigation
function handleArrowNavigation(e) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return; // Not an arrow key
    }
    
    const form = document.getElementById('shipping-form');
    if (!form) return;
    
    // Get all focusable elements within the form
    const focusableElements = Array.from(
        form.querySelectorAll('input, select, button, a[href], textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled && el.offsetParent !== null); // Only visible and enabled elements
    
    // Find the currently focused element
    const currentElement = document.activeElement;
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) return; // No element is focused or not in our form
    
    let nextIndex;
    
    // Determine next focus target based on arrow key
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
    }
    
    // Focus the next element and scroll it into view
    const nextElement = focusableElements[nextIndex];
    if (nextElement) {
        nextElement.focus();
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // If it's a field with a label, announce it
        if (nextElement.labels && nextElement.labels.length > 0) {
            announceToScreenReader("Moved to: " + nextElement.labels[0].textContent);
        } else if (nextElement.getAttribute('data-description')) {
            announceToScreenReader("Moved to: " + nextElement.getAttribute('data-description'));
        }
    }
}

// Function to start voice input for a field
function startVoiceInput(field, voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        // Use only the base prompt without additional instructions
        const basePrompt = "Please speak your " + (field.previousElementSibling ? field.previousElementSibling.textContent : 'information');
        speak(basePrompt);
        
        // Auto-scroll to keep the field in view
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Then start listening
        setTimeout(() => {
            recognition.start();
            
            // Visual feedback - recording animation
            voiceBtn.classList.add('voice-recording');
            voiceBtn.querySelector('.voice-input-wave').classList.add('active');
            
            // Visual feedback for the field
            field.style.borderColor = '#007bff';
            field.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
            
            // Add aria announcement for screen readers
            announceToScreenReader("Listening for your input...");
        }, 2000);
        
        recognition.onresult = function(event) {
            // Get the transcript exactly as spoken
            const transcript = event.results[0][0].transcript;
            
            // Process the transcript based on field type
            let processedValue;
            const fieldType = determineFieldType(field);
            
            if (fieldType === 'phone') {
                processedValue = processPhoneNumber(transcript);
            } else if (fieldType === 'zipcode') {
                processedValue = processZipCode(transcript);
            } else if (fieldType === 'name') {
                // FIX: Remove commas and dots from name fields
                processedValue = transcript.replace(/[,\.]/g, '').trim();
            } else if (fieldType === 'email') {
                // Special handling for email to ensure proper format and remove extra commas/dots
                processedValue = processEmail(transcript);
            } else {
                // Use exactly what the user said
                processedValue = transcript;
            }
            
            field.value = processedValue;
            speak("You said: " + formatForSpeech(processedValue, fieldType));
            
            // Reset visual feedback
            voiceBtn.classList.remove('voice-recording');
            voiceBtn.querySelector('.voice-input-wave').classList.remove('active');
            field.style.borderColor = '';
            field.style.boxShadow = '';
            
            // Auto-scroll to the next field
            const nextField = findNextField(field);
            if (nextField) {
                setTimeout(() => {
                    nextField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    nextField.focus();
                }, 1500);
            }
        };
        
        recognition.onerror = function(event) {
            speak("Voice input error. Please try again.");
            voiceBtn.classList.remove('voice-recording');
            voiceBtn.querySelector('.voice-input-wave').classList.remove('active');
            field.style.borderColor = '';
            field.style.boxShadow = '';
        };
        
        recognition.onend = function() {
            voiceBtn.classList.remove('voice-recording');
            voiceBtn.querySelector('.voice-input-wave').classList.remove('active');
            field.style.borderColor = '';
            field.style.boxShadow = '';
            announceToScreenReader("Voice input completed");
        };
    } else {
        speak("Voice recognition is not supported in this browser.");
    }
}

// Find the next focusable field
function findNextField(currentField) {
    const focusableElements = Array.from(
        document.querySelectorAll('#shipping-form input, #shipping-form select, #shipping-form button, #shipping-form a[href], #shipping-form textarea, #shipping-form [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled && el.offsetParent !== null);
    
    const currentIndex = focusableElements.indexOf(currentField);
    
    if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
        return focusableElements[currentIndex + 1];
    }
    
    return null;
}

// Determine field type based on name or other attributes
function determineFieldType(field) {
    const name = field.name ? field.name.toLowerCase() : '';
    const type = field.type ? field.type.toLowerCase() : '';
    const id = field.id ? field.id.toLowerCase() : '';
    
    if (name.includes('phone') || id.includes('phone')) {
        return 'phone';
    } else if (name.includes('zipcode') || name.includes('postal') || id.includes('zip')) {
        return 'zipcode';
    } else if (name.includes('name') || id.includes('name')) {
        return 'name';
    } else if (name.includes('email') || type === 'email' || id.includes('email')) {
        return 'email';
    }
    
    return 'text';
}

// Process email addresses - new function
function processEmail(text) {
    // Check if the text already looks like an email
    if (text.includes('@') && text.includes('.')) {
        // Remove any extra commas and ensure proper format
        return text.replace(/,/g, '').trim();
    }
    
    // If it doesn't look like an email, just return the cleaned text
    return text.replace(/[,]/g, '').trim();
}

// Special processing for phone numbers
function processPhoneNumber(text) {
    // Remove all non-digit characters
    let digits = text.replace(/\D/g, '');
    
    // If the transcript contains words "one", "two", etc., convert them to digits
    if (digits.length === 0 || text.match(/\b(one|two|three|four|five|six|seven|eight|nine|zero|oh)\b/i)) {
        const numberWords = {
            'zero': '0', 'oh': '0',
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        };
        
        // Split the text into words
        const words = text.toLowerCase().split(/\s+/);
        digits = '';
        
        // Convert each word to a digit if possible
        for (const word of words) {
            if (numberWords[word]) {
                digits += numberWords[word];
            } else if (/^\d+$/.test(word)) {
                // If the word is already a digit, use it
                digits += word;
            } else if (word === 'digit' || word === 'number') {
                // Skip words like "digit" or "number"
                continue;
            } else if (word.startsWith('digit') && word.length > 5) {
                // Handle "digit1", "digit2", etc.
                const digit = word.substring(5);
                if (/^\d+$/.test(digit)) {
                    digits += digit;
                }
            }
        }
    }
    
    // Format the phone number if it's a standard 10-digit US number
    if (digits.length === 10) {
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else {
        return digits;
    }
}

// Process zip codes - similar to phone numbers
function processZipCode(text) {
    // Extract digits and remove spaces
    let digits = text.replace(/\D/g, '');
    
    // Handle number words as with phone numbers
    if (digits.length === 0 || text.match(/\b(one|two|three|four|five|six|seven|eight|nine|zero|oh)\b/i)) {
        const numberWords = {
            'zero': '0', 'oh': '0',
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        };
        
        const words = text.toLowerCase().split(/\s+/);
        digits = '';
        
        for (const word of words) {
            if (numberWords[word]) {
                digits += numberWords[word];
            } else if (/^\d+$/.test(word)) {
                digits += word;
            }
        }
    }
    
    return digits;
}

// Format values for speech feedback
function formatForSpeech(value, fieldType) {
    switch (fieldType) {
        case 'phone':
        case 'zipcode':
            // Read phone numbers and zip codes digit by digit
            return value.replace(/\D/g, '').split('').join(' ');
        default:
            return value;
    }
}

// Announce messages to screen readers
function announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcer');
    if (!announcer) {
        const newAnnouncer = document.createElement('div');
        newAnnouncer.id = 'sr-announcer';
        newAnnouncer.setAttribute('aria-live', 'polite');
        newAnnouncer.className = 'sr-only';
        document.body.appendChild(newAnnouncer);
        setTimeout(() => {
            newAnnouncer.textContent = message;
        }, 100);
    } else {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}

// Call this function when the checkout page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the checkout page
    console.log('Shipping voice js ...');
    if (document.getElementById('shipping-form')) {
        // Add screen reader announcer if not already present
        if (!document.getElementById('sr-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        setupFormVoiceInput();
        
        // Ensure the "Back to Cart" arrow button works correctly
        const backToCartButton = document.querySelector('a[data-description="Back to Car"]');
        if (backToCartButton) {
            // Fix typo in data-description if present
            backToCartButton.setAttribute('data-description', 'Back to Cart');
            
            // Ensure proper navigation
            backToCartButton.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href) {
                    e.preventDefault();
                    window.location.href = href;
                }
            });
        }
        
        // Ensure the Save & Continue button works correctly
        const submitButton = document.querySelector('button[data-description="Save & Continue"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                // Make sure the form submits correctly
                const form = this.closest('form');
                if (form) {
                    // Let the form submit normally
                    // We're just making sure the button is properly functional
                }
            });
        }
    }
});