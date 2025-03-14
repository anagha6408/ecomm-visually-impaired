console.log("wishlist.js is called")
document.addEventListener("DOMContentLoaded", function () {
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
                alert(data.message); // Show confirmation
                document.getElementById("wishlist-count").innerText = data.wishlist_count; // Update count in navbar
            })
            .catch(error => console.error("Error:", error));
        });
    });
});

