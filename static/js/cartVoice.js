function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis not supported in this browser");
    }
}

// Function to show a custom non-blocking alert with immediate voice
function showVoiceAlert(message) {
    // Speak immediately
    console.log("showVoiceAlert called with message:", message); 
    const fullMessage = message + ". Press SPACE to close.";
    speakText(fullMessage);
    
    // Create modal if it doesn't exist
    if (!document.getElementById('voiceAlertModal')) {
        const modalHTML = `
            <div class="modal fade" id="voiceAlertModal" tabindex="-1" role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="alertModalLabel">Notification</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="voiceAlertMessage">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                            <p class="text-muted mt-2">Press SPACE to close</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listener for spacebar to close the modal
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && $('#voiceAlertModal').is(':visible')) {
                $('#voiceAlertModal').modal('hide');
            }
        });
    }
    
    // Update message and show modal
    document.getElementById('voiceAlertMessage').textContent = message;
    $('#voiceAlertModal').modal('show');
    
    // Focus on the modal to ensure keyboard events are captured
    $('#voiceAlertModal').focus();
}

// Replace your alert functions
function showLoginAlert() {
    console.log("showLoginAlert function called");
    const message = "Please log in to add items to your cart.";
    showVoiceAlert(message);
}

