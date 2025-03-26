// Function to add voice input buttons to form fields and handle address selection
console.log('Shipping voice js loaded...');
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
            .field-highlight {
                transition: background-color 0.5s ease;
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
        voiceBtn.setAttribute('data-description', 'Click to speak your ' + (field.placeholder || field.previousElementSibling?.textContent || 'information'));
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
        // Add voice feedback and form filling for selected addresses
        addressDropdown.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value !== "") {
                const addressText = selectedOption.textContent.trim();
                speak("Selected address: " + addressText);
                
                // Fill the shipping form with the selected address data
                fillShippingFormWithAddress(selectedOption.value);
                
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
            speak(document.getElementById('instructions')?.textContent || "Press arrow keys to navigate, Enter to select, Space to toggle speech, R to replay speech");
        }
        
        // Add arrow key navigation
        handleArrowNavigation(e);
    });
}

// Function to fill the shipping form with the selected address data
// Function to fill the shipping form with the selected address data
function fillShippingFormWithAddress(addressId) {
    // Get the selected option element
    const addressDropdown = document.getElementById('existing_addresses');
    const selectedOption = addressDropdown.options[addressDropdown.selectedIndex];
    
    if (!selectedOption || selectedOption.value === "") {
        speak("No address selected.");
        return;
    }
    
    // Get all the form fields
    const form = document.getElementById('shipping-form');
    if (!form) return;
    
    // Get address data directly from the data attributes of the selected option
    const fieldMappings = {
        'shipping_name': selectedOption.getAttribute('data-name'),
        'shipping_address': selectedOption.getAttribute('data-address'),
        'shipping_city': selectedOption.getAttribute('data-city'),
        'shipping_state': selectedOption.getAttribute('data-state'),
        'shipping_zipcode': selectedOption.getAttribute('data-zipcode'),
        'shipping_country': selectedOption.getAttribute('data-country'),
        'shipping_phone': selectedOption.getAttribute('data-phone'),
        'shipping_email': selectedOption.getAttribute('data-email')
    };
    
    // Fill each field
    for (const [fieldName, value] of Object.entries(fieldMappings)) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && value) {
            field.value = value;
            
            // Add class for highlighting
            field.classList.add('field-highlight');
            field.style.backgroundColor = '#f0f8ff'; // Light blue background
            
            // Trigger any necessary event listeners (like change or input events)
            const event = new Event('input', { bubbles: true });
            field.dispatchEvent(event);
            
            // Reset highlighting after a delay
            setTimeout(() => {
                field.style.backgroundColor = '';
                field.classList.remove('field-highlight');
            }, 1000);
        }
    }
    
    // Announce form is filled
    // Modified part at the end of fillShippingFormWithAddress function
    const addressOption = document.getElementById('existing_addresses').options[document.getElementById('existing_addresses').selectedIndex];
    const addressSummary = `${addressOption.getAttribute('data-name')}, ${addressOption.getAttribute('data-address')}, ${addressOption.getAttribute('data-city')}, ${addressOption.getAttribute('data-state')} ${addressOption.getAttribute('data-zipcode')}`;
    speak(`Form filled with address for ${addressSummary}. You can now save and continue by skipping through tab.`);
}

// Simulated function to get address data by ID
// In a real implementation, this would fetch data from your backend or localStorage
function getAddressById(addressId) {
    // Sample address data - replace with your actual data source
    const addressDatabase = {
        '1': {
            fullName: 'John Doe',
            address: '123 Main St, Apt 4B',
            city: 'Anytown',
            state: 'CA',
            zipcode: '12345',
            country: 'USA',
            phone: '(555) 123-4567',
            email: 'john.doe@example.com'
        },
        '2': {
            fullName: 'Jane Smith',
            address: '456 Oak Ave',
            city: 'Somewhere',
            state: 'NY',
            zipcode: '67890',
            country: 'USA',
            phone: '(555) 987-6543',
            email: 'jane.smith@example.com'
        }
        // Add more addresses as needed
    };
    
    return addressDatabase[addressId];
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
        
        // If it's a field with a label or placeholder, announce it
        let announcement = "";
        if (nextElement.labels && nextElement.labels.length > 0) {
            announcement = "Moved to: " + nextElement.labels[0].textContent;
        } else if (nextElement.getAttribute('data-description')) {
            announcement = "Moved to: " + nextElement.getAttribute('data-description');
        } else if (nextElement.placeholder) {
            announcement = "Moved to: " + nextElement.placeholder;
        }
        
        if (announcement) {
            announceToScreenReader(announcement);
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
        
        // Use the placeholder or label as the prompt
        const basePrompt = "Please speak your " + (field.placeholder || field.previousElementSibling?.textContent || 'information');
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
            const fieldName = field.name || "";
            
            if (fieldName.includes('phone')) {
                processedValue = processPhoneNumber(transcript);
            } else if (fieldName.includes('zipcode')) {
                processedValue = processZipCode(transcript);
            } else if (fieldName.includes('name')) {
                // Remove commas and dots from name fields
                processedValue = transcript.replace(/[,\.]/g, '').trim();
            } else if (fieldName.includes('email')) {
                // Special handling for email to ensure proper format and remove extra commas/dots
                processedValue = processEmail(transcript);
            } else {
                // Use exactly what the user said
                processedValue = transcript;
            }
            
            field.value = processedValue;
            speak("You said: " + formatForSpeech(processedValue, fieldName));
            
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

// Process email addresses
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
    if (fieldType.includes('phone') || fieldType.includes('zipcode')) {
        // Read phone numbers and zip codes digit by digit
        return value.replace(/\D/g, '').split('').join(' ');
    }
    return value;
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

// Function to speak text (from voice.js)
function speak(text) {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechSpeed || 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Call this function when the checkout page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the checkout page
    console.log('Shipping voice js initializing...');
    if (document.getElementById('shipping-form')) {
        // Add screen reader announcer if not already present
        if (!document.getElementById('sr-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        // Define speechSpeed if not already defined
        if (typeof speechSpeed === 'undefined') {
            window.speechSpeed = 1;
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