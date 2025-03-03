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
            //showSuccessAlert();

            console.log("Updated Cart Data:", data);
            if (data.message) {
                showVoiceAlert(data.message); // Call voice alert from the message sent by Django
            }
            location.reload();
            //location.reload(true);
            // Update the cart UI manually instead of reloading
            //updateCartDisplay(productId, action);
            
        })
        .catch(error => {
            console.error("Error updating cart:", error);
            const errorMessage = "There was an error adding the item to your cart. Please try again.";
            showVoiceAlert(errorMessage);
        });
}
