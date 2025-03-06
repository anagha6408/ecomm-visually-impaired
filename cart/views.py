from django.shortcuts import render
from django.http import JsonResponse
import json
import datetime
from .models import * 
from cart.cart import cookieCart, cartData, guestOrder

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


def checkout(request):
	data = cartData(request)
	print("Cart Data Passed to Template:", data)
	cartItems = data['cartItems']
	order = data['order']
	items = data['items']

	context = {'items':items, 'order':order, 'cartItems':cartItems}
	return render(request, 'store/checkout.html', context)

def updateItem(request):
    data = json.loads(request.body)
    productId = data['productId']
    action = data['action']
    #quantity = int(data.get('quantity', 1))
    print('Action:', action)
    print('Product:', productId)
    #print('quantity: here is ______', quantity)
    try:
        customer = request.user.customer
    except:
        customer = Customer.objects.create(
            user=request.user,
            name=request.user.username,
            email=request.user.email
        )

    product = Product.objects.get(id=productId)
    order = Order.objects.filter(customer=customer, complete=False).first()
    if not order:
        order = Order.objects.create(customer=customer, complete=False)

    
    # Use filter().first() instead of get_or_create
    orderItem = OrderItem.objects.filter(order=order, product=product).first()
    
    # If orderItem doesn't exist, create it
    if orderItem is None:
        orderItem = OrderItem.objects.create(order=order, product=product, quantity=1)
    # Get quantity from request
   
    
    
    if action == "Increase":
        orderItem.quantity += 1
        message = "Item quantity increased!"
    elif action == "Decrease":
        orderItem.quantity -= 1
        message = "Item quantity decreased!"
    elif action == "delete":
        orderItem.delete()
        return JsonResponse({"message": "Item successfully removed from your cart!"}, safe=False)
    elif action == "add":
        message = "Item successfully added to your cart!"
    else:
        return JsonResponse({"error": "Invalid action"}, status=400)

    if orderItem.quantity <= 0:
        orderItem.delete()
        return JsonResponse({"message": "Item removed due to zero quantity!"}, safe=False)


    orderItem.save()

    if orderItem.quantity <= 0:
        orderItem.delete()

    return JsonResponse({"message": message}, safe=False)

def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.loads(request.body)

    if request.user.is_authenticated:
        try:
            customer = request.user.customer
        except:
            # Create a customer for this user if one doesn't exist
            customer = Customer.objects.create(
                user=request.user,
                name=request.user.username,
                email=request.user.email
            )
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
    else:
        customer, order = guestOrder(request, data)

    total = float(data['form']['total'])
    order.transaction_id = transaction_id

    if total == order.get_cart_total:
        order.complete = True
    order.save()

    if order.shipping == True:
        ShippingAddress.objects.create(
        customer=customer,
        order=order,
        address=data['shipping']['address'],
        city=data['shipping']['city'],
        state=data['shipping']['state'],
        zipcode=data['shipping']['zipcode'],
        )

    return JsonResponse('Payment submitted..', safe=False)