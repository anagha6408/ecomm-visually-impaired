var updateBtns = document.getElementsByClassName("update-cart");
console.log("Cart.js 77777 loaded!");

// Set up event listeners only once when the document loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Function to set up event listeners
function setupEventListeners() {
    console.log("Setting up event listeners for", updateBtns.length, "buttons");
    for (let i = 0; i < updateBtns.length; i++) {
        updateBtns[i].removeEventListener("click", updateCartHandler);
        updateBtns[i].addEventListener("click", updateCartHandler);
    }
}

function updateCartHandler() {
    var productId = this.dataset.product;
    var action = this.dataset.action;

    console.log("Raw productId:", productId);
    if (!productId) {
        console.error("Product ID is missing!");
        return;
    }

    // Prevent double-clicks by adding a processing flag
    if (this.dataset.processing === "true") {
        console.log("Already processing this request");
        return;
    }
    
    this.dataset.processing = "true";
    const button = this;

    console.log("productId:", productId, "Action:", action);
    console.log("USER:", user);

    if (user.includes("AnonymousUser")) {
        console.log("User is anonymous, showing login alert");
        showLoginAlert();
        button.dataset.processing = "false";
        return;
    } else {
        console.log("User is authenticated, updating cart");
        updateUserOrder(productId, action, button);
    }
}

function updateUserOrder(productId, action, button) {
    console.log("Sending data to server...");

    var url = "/cart/update_item/";
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ productId, action }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Server returned an error");
        }
        return response.json();
    })
    .then((data) => {
        console.log("Server response:", data);
        
        // Always show the alert
        if (data.message) {
            showVoiceAlert(data.message);
        }
        
        // Check if we need to reload the page
        //if (action === "delete" || (action === "Decrease" && data.quantity === 0)) {
        //    console.log("Item removed, reloading page");
        //    setTimeout(() => {
        //        location.reload();
        //    }, 5500);
        //    return;
       // }
       if (action === "delete") {
        console.log("Item deleted, updating UI");
        // Remove the item from the DOM instead of reloading
        const itemRow = document.querySelector(`.cart-row [data-product="${productId}"]`).closest('.cart-row');
        if (itemRow) {
            itemRow.remove();
            updateCartSummary(); // Update totals
        }
        return;
    }
        
        // Handle updates to the UI
        if (document.querySelector('.cart-row')) {
            // We're on the cart page
            updateCartUI(productId, action, data.quantity);
        } else {
            // Update cart icon indicator
            updateCartIndicator(data.total_items);
            // We're on another page (like product view)
            console.log("Not on cart page, no UI update needed");
        }
    })
    .catch(error => {
        console.error("Error updating cart:", error);
        showVoiceAlert("There was an error updating your cart. Please try again.");
    })
    .finally(() => {
        // Always reset the processing flag
        if (button) {
            button.dataset.processing = "false";
        }
    });
}

function updateCartIndicator(totalItems) {
    const cartIndicator = document.querySelector('.cart-total');
    if (cartIndicator) {
        cartIndicator.textContent = totalItems;
    }
}

function updateCartUI(productId, action, serverQuantity) {
    console.log("Updating cart UI for product:", productId, "Action:", action);

    const cartItem = document.querySelector(`.cart-row [data-product="${productId}"]`);
    if (!cartItem) {
        console.warn(`Product ${productId} not found in the cart. Reloading page.`);
        location.reload();
        return;
    }

    const cartRow = cartItem.closest('.cart-row');
    const qtyElement = cartRow.querySelector('.qty-input');
    const itemPriceElement = cartRow.querySelector('.item-price');
    const totalPriceElement = cartRow.querySelector('div:nth-child(5) p');

    console.log("Found elements:", qtyElement, itemPriceElement, totalPriceElement);

    if (!qtyElement || !itemPriceElement || !totalPriceElement) {
        console.error("Required elements missing. Reloading page.");
        location.reload();
        return;
    }

    let itemPrice = parseFloat(itemPriceElement.textContent.replace('$', '').trim()) || 0;
    
    // Use server quantity if provided
    if (serverQuantity !== undefined) {
        console.log("Using server quantity:", serverQuantity);
        qtyElement.textContent = serverQuantity;
    } else {
        // Fallback to local calculation if needed
        let currentQuantity = parseInt(qtyElement.textContent.trim(), 10) || 0;
        
        if (action === 'Increase') {
            currentQuantity++;
        } else if (action === 'Decrease') {
            currentQuantity = Math.max(0, currentQuantity - 1);
        }
        
        console.log("Calculated local quantity:", currentQuantity);
        qtyElement.textContent = currentQuantity;
    }
    
    // Update the total price for this item
    const currentQuantity = parseInt(qtyElement.textContent.trim(), 10) || 0;
    totalPriceElement.textContent = `$${(currentQuantity * itemPrice).toFixed(2)}`;

    // Remove the item if quantity is zero
    if (currentQuantity === 0) {
        console.log("Quantity is zero, removing item from cart UI");
        cartRow.remove();
    }

    // Update the cart summary
    updateCartSummary();
}

function updateCartSummary() {
    const cartRows = document.querySelectorAll('.cart-row:not(:first-child)');
    let totalItems = 0;
    let totalPrice = 0;

    cartRows.forEach(row => {
        const qtyElement = row.querySelector('.qty-input');
        const priceElement = row.querySelector('.item-price');

        if (qtyElement && priceElement) {
            const qty = parseInt(qtyElement.textContent.trim(), 10) || 0;
            const price = parseFloat(priceElement.textContent.replace('$', '').trim()) || 0;

            totalItems += qty;
            totalPrice += qty * price;
        }
    });

    const itemsElement = document.querySelector('th:first-child h5 strong');
    const totalElement = document.querySelector('th:nth-child(2) h5 strong');

    if (itemsElement) itemsElement.textContent = totalItems;
    if (totalElement) totalElement.textContent = `$${totalPrice.toFixed(2)}`;

    if (totalItems === 0) {
        const cartContainer = document.querySelector('.box-element:nth-child(2)');
        if (cartContainer) {
            cartContainer.innerHTML = '<p>Your cart is empty</p>';
        }
    }
}
