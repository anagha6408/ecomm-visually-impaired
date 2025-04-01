console.log("wishlist.js is called");

document.addEventListener("DOMContentLoaded", function () {
    // Add to Wishlist
    document.querySelectorAll(".add-to-wishlist").forEach(button => {
        button.addEventListener("click", function () {
            let productId = this.getAttribute("data-product-id");
            let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;

            fetch("/wishlist/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-CSRFToken": csrfToken
                },
                body: `product_id=${productId}`
            })
            .then(response => response.json())
            .then(data => {
                showVoiceAlert(data.message); // ✅ Voice alert on adding
                document.getElementById("wishlist-count").innerText = data.wishlist_count; // Update count in navbar
            })
            .catch(error => console.error("Error:", error));
        });
    });

    // Remove from Wishlist (Updated)
    document.querySelectorAll(".remove-from-wishlist").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            let productId = this.getAttribute("data-product-id");
            let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
    
            fetch("/wishlist/remove/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-CSRFToken": csrfToken,
                    "X-Requested-With": "XMLHttpRequest"  // Add this header
                },
                body: `product_id=${productId}`
            })
            .then(response => {
                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return response.json();
                } else {
                    // If not JSON, refresh the page to handle redirect
                    window.location.reload();
                    throw new Error("Not JSON response");
                }
            })
            .then(data => {
                showVoiceAlert("Item removed from your wishlist.");
                document.getElementById("wishlist-count").innerText = data.wishlist_count;
                let itemToRemove = document.querySelector(`[data-product-id="${productId}"]`).closest(".col-md-4");
                if (itemToRemove) {
                    itemToRemove.remove();
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });
});