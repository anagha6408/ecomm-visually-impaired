from django.contrib import messages
from django.shortcuts import redirect, render
from payment.models import ShippingAddress
from payment.forms import ShippingForm
from cart.cart import cartData
from cart.models import Order, OrderItem, Product
def checkout_view(request):
    shipping_form = ShippingForm()
    
    # Get all saved shipping addresses for the logged-in user
   # Ensure the user is authenticated before fetching addresses
    if request.user.is_authenticated:
        user_addresses = ShippingAddress.objects.filter(user=request.user)
    else:
        user_addresses = None  # Avoid errors if user is not logged in

    print(user_addresses)

    context = {
        'shipping_form': shipping_form,
        'user_addresses': user_addresses,
    }
    return render(request, 'store/checkout.html', context)

def billing_info(request):
    print("✅ BILLING INFO FUNCTION")
    if not request.user.is_authenticated:
        messages.error(request, "User is not logged in. Please login.")
        return redirect('store:home')

    if request.method == "POST":
        data = cartData(request)
        cartItems = data['cartItems']
        order = data['order']
        items = data['items']

        selected_address_id = request.POST.get("saved_address")
        if selected_address_id:
            print("✅ User chose an existing address") 
            print("Selected Address ID:", selected_address_id)
            shipping_address = ShippingAddress.objects.get(id=selected_address_id, user=request.user)
            # Store the selected address ID in session
            request.session['selected_address_id'] = selected_address_id
        else:
            print("✅ User entered a new address") 
            shipping_form = ShippingForm(request.POST)
            if shipping_form.is_valid():
                shipping_address = shipping_form.save(commit=False)
                shipping_address.user = request.user
                shipping_address.save()
                # Store the newly created address ID in session
                request.session['selected_address_id'] = shipping_address.id
            else:
                messages.error(request, "Invalid form submission.")
                return redirect('cart:checkout')

        messages.success(request, "Billing Info is loaded successfully")
        return render(request, 'store/billing_info.html', {
            "cartItems": cartItems,
            "order": order,
            "items": items,
            "shipping_address": shipping_address
        })

    messages.error(request, "Invalid request method. Please submit the form properly.")
    return redirect('cart:checkout')

def payment_process(request):
    if request.method == "POST":
        payment_method = request.POST.get("payment_method")
        print(f"✅ Received payment_method: {payment_method}")

        if not request.user.is_authenticated:
            messages.error(request, "You need to log in first.")
            return redirect('store:home')

        # Get the current cart data
        cart_data = cartData(request)
        current_order = cart_data['order']
        
        # Check if the order has items
        if not current_order.get_cart_items:
            messages.error(request, "Your cart is empty.")
            return redirect('cart:cart')
        selected_address_id = request.session.get('selected_address_id') 
        # Fetch the shipping information
        try:
            # If we have a selected address ID (either from dropdown or from newly created address)
            if selected_address_id:
                print(f"✅ Using selected/created address ID: {selected_address_id}")
                shipping_address = ShippingAddress.objects.get(id=selected_address_id, user=request.user)
            else:
                # This case should only happen if there's a session issue
                print("⚠️ No address ID in session, falling back to form data")
                # Try to get shipping information from the form data (if present)
                shipping_form = ShippingForm(request.POST) if request.POST else None
                
                if shipping_form and shipping_form.is_valid():
                    shipping_address = shipping_form.save(commit=False)
                    shipping_address.user = request.user
                    shipping_address.save()
                    print(f"✅ Created new address from form: {shipping_address.id}")
                else:
                    # Last resort: get the most recent address
                    shipping_address = ShippingAddress.objects.filter(user=request.user).order_by('-shipping_date_added').first()
                    print(f"⚠️ Falling back to most recent address: {shipping_address.id if shipping_address else 'None'}")
                    
                    if not shipping_address:
                        messages.error(request, "No shipping information available. Please add shipping details.")
                        return redirect('cart:checkout')
            
            
            # Update the existing order instead of creating a new one
            current_order.full_name = shipping_address.shipping_name
            current_order.email = shipping_address.shipping_email
            current_order.phone = shipping_address.shipping_phone
            current_order.address = shipping_address.shipping_address
            current_order.payment_method = payment_method
            current_order.amount_paid = current_order.get_cart_total
            current_order.save()
            
            # Store the current order ID in session
            request.session['current_order_id'] = current_order.id
            
        except ShippingAddress.DoesNotExist:
            messages.error(request, "Please provide shipping information first.")
            return redirect('cart:checkout')

        if payment_method == "cod":
            messages.success(request, "Order placed successfully with Cash on Delivery!")
            return redirect('payment:payment_success')
        elif payment_method == "paypal":
            return redirect('payment:paypal_payment')
        else:
            messages.error(request, "Please select a valid payment method.")
            return redirect('payment:billing_info')

    messages.error(request, "Invalid request method.")
    return redirect('cart:checkout')

def payment_success(request):
    user = request.user
    if not user.is_authenticated:
        messages.error(request, "You need to log in first.")
        return redirect('store:home')

    # Get the order ID from session
    order_id = request.session.get('current_order_id')
    
    if not order_id:
        messages.error(request, "No order information found.")
        return redirect('store:home')
    
    try:
        # Get the specific order by ID
        order = Order.objects.get(id=order_id, user=user)
        
        # Store order items for display
        items = order.orderitem_set.all()
        
        # IMPORTANT: Mark the order as complete
        order.complete = True
        order.save()
        
        # Get the selected shipping address from session instead of most recent
        selected_address_id = request.session.get('selected_address_id')
        if selected_address_id:
            shipping_address = ShippingAddress.objects.get(id=selected_address_id, user=user)
        else:
            # Fallback to most recent if session data is missing
            shipping_address = ShippingAddress.objects.filter(user=user).order_by('-shipping_date_added').first()
        
        # Clear session cart
        order_clear_cart(request)
        
        # Clear session data
        if 'current_order_id' in request.session:
            del request.session['current_order_id']
        
        if 'selected_address_id' in request.session:
            del request.session['selected_address_id']
            
        # Create a new empty cart order for future shopping
        Order.objects.create(user=user, complete=False)
        
        # Ensure session changes are saved
        request.session.modified = True
        
    except Order.DoesNotExist:
        messages.error(request, "Order not found.")
        return redirect('store:home')

    except ShippingAddress.DoesNotExist:
        shipping_address = None

    transaction_id = order.transaction_id
    payment_method = order.payment_method if hasattr(order, 'payment_method') else "Not available"

    return render(request, 'store/payment_success.html', {
        "order": order,
        "items": items,
        "shipping_address": shipping_address,
        "payment_method": payment_method,
        "transaction_id": transaction_id,
    })


def paypal_payment(request):
    return render(request, 'store/paypal_payment.html')




def order_calculate_cart_total(request):
    """Calculate the total amount from cart items"""
    if request.user.is_authenticated:
        order = Order.objects.filter(user=request.user, complete=False).first()
        if order:
            return order.get_cart_total
    
    # Fallback to manually calculating from session
    cart_items = order_get_cart_items(request)
    total = sum(item['quantity'] * item['product'].selling_price for item in cart_items)
    return total

def order_get_cart_items(request):
    """Get cart items from session or database"""
    # This implementation will depend on how you're storing cart items
    # For example, if using session:
    cart_items = []
    cart = request.session.get('cart', {})
    user = request.user
    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            cart_items.append({
                'product': product,
                'quantity': quantity,
                'user':user,
                'price':order_calculate_cart_total(request),
            })
        except Product.DoesNotExist:
            pass
    
    return cart_items

def order_clear_cart(request):
    """Clear the cart from session"""
    if 'cart' in request.session:
        del request.session['cart']
    request.session.modified = True