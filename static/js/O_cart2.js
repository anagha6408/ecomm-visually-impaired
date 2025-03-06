var updateBtns = document.getElementsByClassName("update-cart");
console.log("Cart2222.js loaded   haiiiiii!!!!!!!!!!!! ");
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
        if (user.includes("AnonymousUser")){
            console.log("User is anonymous, showing login alert");
            showLoginAlert(); // Show login alert
            //addCookieItem(productId, action);
            return; 
        } else {
            console.log("Inside showSuccessAlert add to cart");
            updateUserOrder(productId, action);
            //showSuccessAlert();
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
        body: JSON.stringify({ 
            productId: productId, 
            action: action
            }),
            
    })
    
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("Updated Cart Data:", data);
            console.log('Success:', data);
            showVoiceAlert(data.message);
            // Use a slight delay before reloading to ensure voice alert plays
            setTimeout(() => {
                location.reload();
            }, 1500); // 500ms delay
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
