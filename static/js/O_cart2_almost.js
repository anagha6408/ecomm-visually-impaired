
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
        
        // Speak the message
        showVoiceAlert(data.message);
        
        // Update cart UI
        updateCartUI(productId, action);
    })
    .catch(error => {
        console.error("Error updating cart:", error);
        const errorMessage = "There was an error updating your cart. Please try again.";
        showVoiceAlert(errorMessage);
    });
}

function updateCartUI(productId, action) {
    console.log("Updating cart for product:", productId, "Action:", action);

    // Find the specific cart row for this product
    
    const cartItem = document.querySelector(`.cart-row [data-product="${productId}"]`);
    if (!cartItem) {
        console.warn(`Product ${productId} is new. Reloading cart...`);
        //location.reload(); // Reloads page to reflect new cart state
        return;
    }
    const cartRow = document.querySelector(`.cart-row [data-product="${productId}"]`).closest('.cart-row');
    // More specific selectors
    const qtyElement = cartRow.querySelector('.qty-input');
    const itemPriceElement = cartRow.querySelector('.item-price');
    const totalPriceElement = cartRow.querySelector('div:nth-child(5) p');

    // Detailed logging
    console.log("Quantity Element:", qtyElement);
    console.log("Item Price Element:", itemPriceElement);
    console.log("Total Price Element:", totalPriceElement);

    if (!qtyElement || !itemPriceElement || !totalPriceElement) {
        console.error("Required elements missing");
        return;
    }

    // Parsing with explicit conversion and error handling
    const currentQuantity = parseInt(qtyElement.textContent.trim(), 10);
    const itemPrice = parseFloat(itemPriceElement.textContent.replace('$', '').trim());

    console.log("Parsed Quantity:", currentQuantity);
    console.log("Parsed Item Price:", itemPrice);

    // Validate parsed values
    if (isNaN(currentQuantity) || isNaN(itemPrice)) {
        console.error("Invalid quantity or price parsing");
        return;
    }

    // Update quantity based on action
    let newQuantity = currentQuantity;
    if (action === 'Increase') {
        newQuantity++;
    } else if (action === 'Decrease') {
        newQuantity = Math.max(0, currentQuantity - 1);
    } else if (action === 'delete') {
        cartRow.remove();
        updateCartSummary();
        return;
    }

    // Update quantity element
    qtyElement.textContent = newQuantity;

    // Calculate and update total price
    const newTotal = (newQuantity * itemPrice).toFixed(2);
    totalPriceElement.textContent = `$${newTotal}`;

    // Update cart summary
    updateCartSummary();
}

function updateCartSummary() {
    const cartRows = document.querySelectorAll('.cart-row:not(:first-child)');
    let totalItems = 0;
    let totalPrice = 0;

    cartRows.forEach(row => {
        const qtyElement = row.querySelector('.qty-input');
        const priceElement = row.querySelector('div:nth-child(3) p');

        if (qtyElement && priceElement) {
            const qty = parseInt(qtyElement.textContent.trim(), 10) || 0;
            const price = parseFloat(priceElement.textContent.replace('$', '').trim()) || 0;

            totalItems += qty;
            totalPrice += qty * price;
        }
    });

    // Update summary table
    const itemsElement = document.querySelector('th:first-child h5 strong');
    const totalElement = document.querySelector('th:nth-child(2) h5 strong');

    if (itemsElement) itemsElement.textContent = totalItems;
    if (totalElement) totalElement.textContent = `$${totalPrice.toFixed(2)}`;

    // Handle empty cart
    if (totalItems === 0) {
        const cartContainer = document.querySelector('.box-element:nth-child(2)');
        if (cartContainer) {
            cartContainer.innerHTML = '<p>Your cart is empty</p>';
        }
    }
}