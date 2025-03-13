from django.shortcuts import redirect, render
from django.http import JsonResponse
import json
import datetime
from .models import * 
from cart.cart import cookieCart, cartData, guestOrder
from payment.forms import ShippingForm
from django.contrib.auth.models import User

def store(request):
	data = cartData(request)

	cartItems = data['cartItems']
	order = data['order']
	items = data['items']

	products = Product.objects.all()
	context = {'products':products, 'cartItems':cartItems}
	return render(request, 'store/home.html', context)


def cart(request):
    data = cartData(request)  # Ensure this function is working correctly
    print("HELLOOO IN THE CART FUNCTION of cart.views")  # Debugging

    cartItems = data['cartItems']
    order = data['order']
    items = data['items']

    print("Cart Items:", cartItems)  # Debugging
    print("Order:", order)
    print("Items:", items)

    context = {'items': items, 'order': order, 'cartItems': cartItems}
    return render(request, 'store/cart2.html', context)


from django.contrib import messages
from payment.models import ShippingAddress

def checkout(request):
    data = cartData(request)
    print("Cart Data Passed to Template:", data)

    cartItems = data['cartItems']
    order = data['order']
    items = data['items']
    print("✅ CHECKOUT FUNCTION")  # Debugging

    shipping_form = ShippingForm()
    user_addresses = None  # Default to None

    if request.user.is_authenticated:
        user_addresses = ShippingAddress.objects.filter(user=request.user)  # Fetch saved addresses

    if request.method == "POST":
        # Only process the form if the user is logged in
        if request.user.is_authenticated:
            shipping_form = ShippingForm(request.POST)
            if shipping_form.is_valid():
                # Don't save the form immediately
                shipping_address = shipping_form.save(commit=False)
                shipping_address.user = request.user
                shipping_address.save()
                
                # Add success message with appropriate tag for bootstrap styling
                messages.success(request, "Shipping address saved successfully!")
                print("✅ Shipping address saved for user:", request.user.username)
                
                return redirect('cart:checkout')  # Redirect to avoid resubmission
            else:
                # Add form validation error message
                messages.error(request, "Please correct the errors in the form.")
                print("❌ Form Errors:", shipping_form.errors)
        else:
            # User is not logged in, redirect to login page with warning
            messages.warning(request, "Please log in to add shipping information.")
            return redirect('store:home')  # Replace with your login URL name
    else:
        shipping_form = ShippingForm()

    context = {'items': items, 'order': order, 'cartItems': cartItems, 'shipping_form': shipping_form,'user_addresses': user_addresses,}
    return render(request, 'store/checkout.html', context)


def updateItem(request):
    data = json.loads(request.body)
    productId = data['productId']
    action = data['action']
    #quantity = int(data.get('quantity', 1))
    print('Action:', action)
    print('Product:', productId)
    #print('quantity: here is ______', quantity)
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=400)

    product = Product.objects.get(id=productId)
    order = Order.objects.filter(user=user, complete=False).first()
    if not order:
        order = Order.objects.create(user=user, complete=False)

    
    # Use filter().first() instead of get_or_create
    orderItem = OrderItem.objects.filter(order=order, product=product).first()
    
    if action == "Increase":
        orderItem.quantity += 1
        message = "Item quantity increased!"
    elif action == "Decrease":
        orderItem.quantity -= 1
        message = "Item quantity decreased!"
    elif action == "delete":
        orderItem.delete()
        #message = "Item successfully removed from your cart!"
        return JsonResponse({"message": "Item successfully removed from your cart!"}, safe=False)
    elif action == "add":
        if orderItem:
            # If item exists, just increase quantity
            print('item exists, just increase quantity:')
            orderItem.quantity += 1
            message = "Item  already exists, Item quantity increased in your cart!"
        else:
            # Only create a new item if it doesn't exist
            print('new item if it doesnt exist:')
            orderItem = OrderItem.objects.create(order=order, product=product, quantity=1,user=user,price=product.selling_price)
            message = "Item successfully added to your cart!"
    else:
        return JsonResponse({"error": "Invalid action"}, status=400)

    if orderItem.quantity <= 0:
        orderItem.delete()
        return JsonResponse({"message": "Item removed due to zero quantity!"}, safe=False)


    orderItem.save()

    if orderItem.quantity <= 0:
        orderItem.delete()
    
    print(f"OrderItem Updated: {orderItem.product.name}, Quantity: {orderItem.quantity}")
    return JsonResponse({"message": message}, safe=False)

def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.loads(request.body)

    if request.user.is_authenticated:
        user = request.user
        order, created = Order.objects.get_or_create(user=user, transaction_id=None)
    else:
        return JsonResponse({"error": "User not authenticated"}, status=400)

    total = float(data['form']['total'])
    order.transaction_id = transaction_id

    if total == order.amount_paid:  # Ensure amount matches
        order.save()

    if order.shipping == True:
        ShippingAddress.objects.create(
        user=user,
        order=order,
        address=data['shipping']['address'],
        city=data['shipping']['city'],
        state=data['shipping']['state'],
        zipcode=data['shipping']['zipcode'],
        )

    return JsonResponse('Payment submitted..', safe=False)


from django.contrib.auth.decorators import login_required
@login_required
def past_orders(request):
    user = request.user
    past_orders = Order.objects.filter(user=user,complete=True).order_by('-date_ordered')  # Latest first
    print(f"User: {user}")
    print("Past Orders:", past_orders)
    return render(request, 'store/past_orders.html', {'past_orders': past_orders})

from django.shortcuts import render, get_object_or_404
def order_details(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    shipping_address = ShippingAddress.objects.filter(user=order.user).order_by('-shipping_date_added').first()
    
    context = {
        'order': order,
        'shipping_address': shipping_address
    }
    
    return render(request, 'store/order_details.html', context)