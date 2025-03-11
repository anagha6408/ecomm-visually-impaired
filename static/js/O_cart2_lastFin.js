var updateBtns = document.getElementsByClassName("update-cart");
console.log("Cart.js loaded!");

for (let i = 0; i < updateBtns.length; i++) {
    updateBtns[i].removeEventListener("click", updateCartHandler); // Prevent duplicate event listeners
    updateBtns[i].addEventListener("click", updateCartHandler);
}

function updateCartHandler() {
    var productId = this.dataset.product;
    var action = this.dataset.action;

    console.log("Raw productId:", productId);
    if (!productId) {
        console.error("Product ID is missing!");
        return;
    }

    console.log("productId:", productId, "Action:", action);
    console.log("USER:", user);

    if (user.includes("AnonymousUser")) {
        console.log("User is anonymous, showing login alert");
        showLoginAlert();
        return;
    } else {
        console.log("Inside showSuccessAlert add to cart");
        updateUserOrder(productId, action);
    }
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
        body: JSON.stringify({ productId, action }),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Updated Cart Data:", data);

        showVoiceAlert(data.message);

        // Ensure updateCartUI runs once per action
        setTimeout(() => {
            updateCartUI(productId, action);
        }, 100);
    })
    .catch(error => {
        console.error("Error updating cart:", error);
        showVoiceAlert("There was an error updating your cart. Please try again.");
    });
}

function updateCartUI(productId, action) {
    console.log("Updating cart for product:", productId, "Action:", action);

    const cartItem = document.querySelector(`.cart-row [data-product="${productId}"]`);
    if (!cartItem) {
        console.warn(`Product ${productId} is new. Reloading cart...`);
        return;
    }

    const cartRow = cartItem.closest('.cart-row');
    const qtyElement = cartRow.querySelector('.qty-input');
    const itemPriceElement = cartRow.querySelector('.item-price');
    const totalPriceElement = cartRow.querySelector('div:nth-child(5) p');

    console.log("Quantity Element:", qtyElement);
    console.log("Item Price Element:", itemPriceElement);
    console.log("Total Price Element:", totalPriceElement);

    if (!qtyElement || !itemPriceElement || !totalPriceElement) {
        console.error("Required elements missing");
        return;
    }

    let currentQuantity = parseInt(qtyElement.textContent.trim(), 10) || 0;
    let itemPrice = parseFloat(itemPriceElement.textContent.replace('$', '').trim()) || 0;

    console.log("Before update: Quantity =", currentQuantity, "Price =", itemPrice);

    // Prevent multiple increments per click
    if (action === 'Increase' && qtyElement.dataset.lastAction !== 'Increase') {
        currentQuantity++;
        qtyElement.dataset.lastAction = 'Increase';
    } else if (action === 'Decrease' && qtyElement.dataset.lastAction !== 'Decrease') {
        currentQuantity = Math.max(0, currentQuantity - 1);
        qtyElement.dataset.lastAction = 'Decrease';
    } else if (action === 'delete') {
        cartRow.remove();
        updateCartSummary();
        return;
    }

    console.log("Updated Quantity:", currentQuantity);

    qtyElement.textContent = currentQuantity;
    totalPriceElement.textContent = `$${(currentQuantity * itemPrice).toFixed(2)}`;

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
