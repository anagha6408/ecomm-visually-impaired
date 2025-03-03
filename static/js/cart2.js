
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis not supported in this browser");
    }
}

var updateBtns = document.getElementsByClassName("update-cart");
console.log("Cart2222.js loaded   haiiiiii ");
for (i = 0; i < updateBtns.length; i++) {
    updateBtns[i].addEventListener("click", function () {
        var productId = this.dataset.product;

        // Get product ID and ensure it's not empty
        var productId = this.dataset.product;
        console.log("Raw productId:", productId);
        
        if (!productId) {
            console.error("Product ID is missing!");
            return;
        }

        var action = this.dataset.action;
        console.log("productId:", productId, "Action:", action);
        console.log("USER:", user);
        // Debug the exact value and type
        console.log("USER:", user);
        console.log("USER type:", typeof user);
        console.log("USER === AnonymousUser:", user === "AnonymousUser");
        console.log("USER == AnonymousUser:", user == "AnonymousUser");
        console.log("USER.trim() === AnonymousUser:", user.trim() === "AnonymousUser");
        if (user.includes("AnonymousUser")){
            console.log("User is anonymous, showing login alert");
            showLoginAlert(); // Show login alert
            //addCookieItem(productId, action);
            return; 
        } else {
            updateUserOrder(productId, action);
        }
    });
}

function updateUserOrder(productId, action) {
    console.log("User is authenticated, sending data...");

    var url = "/cart/update_item/";

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ productId: productId, action: action }),
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("Updated Cart Data:", data);
            console.log('Success:', data);
            showSuccessAlert();
            //location.reload();
        })
        .catch(error => {
            console.error("Error updating cart:", error);
            const errorMessage = "There was an error adding the item to your cart. Please try again.";
            showVoiceAlert(errorMessage);
        });
}

// Function to show a custom non-blocking alert with immediate voice
function showVoiceAlert(message) {
    // Speak immediately
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

function showSuccessAlert() {
    const message = "Item successfully added to your cart!";
    showVoiceAlert(message);
}

function addCookieItem(productId, action) {
    console.log("User is not authenticated");

    if (action == "add") {
        if (cart[productId] == undefined) {
            cart[productId] = { quantity: 1 };
        } else {
            cart[productId]["quantity"] += 1;
        }
    }

    if (action == "remove") {
        cart[productId]["quantity"] -= 1;

        if (cart[productId]["quantity"] <= 0) {
            console.log("Item should be deleted");
            delete cart[productId];
        }
    }
    console.log("CART:", cart);
    document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";

    location.reload();
}
