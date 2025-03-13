import json
from .models import *

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get("cart", {})
        self.session["cart"] = cart  # Ensure session cart exists
        self.cart = cart

import json
from .models import *

def cookieCart(request):
	try:
		cart = json.loads(request.COOKIES.get('cart', '{}'))
	except json.JSONDecodeError:
		cart = {}

	print("🚀 Cart from Cookies:", cart)  # Debugging

	items = []
	order = {'get_cart_total': 0, 'get_cart_items': 0, 'shipping': False}
	cartItems = order['get_cart_items']

	for i in cart:
		try:
			cartItems += cart[i]['quantity']
			product = Product.objects.get(id=i)
			total = product.selling_price * cart[i]['quantity']

			order['get_cart_total'] += total
			order['get_cart_items'] += cart[i]['quantity']

			item = {
				'id': product.id,
				'product': {
					'id': product.id, 
					'name': product.name, 
					'price': product.selling_price,
					'imageURL': product.product_image
				}, 
				'quantity': cart[i]['quantity'],
				'get_total': total,
			}
			items.append(item)


		except Product.DoesNotExist:
			print(f"❌ Product ID {i} does not exist.")

	print("✅ Final Cookie Cart Data:", {'cartItems': cartItems, 'order': order, 'items': items})
	return {'cartItems': cartItems, 'order': order, 'items': items}

"""
def cartData(request):
    if request.user.is_authenticated:
        customer, created = Customer.objects.get_or_create(user=request.user)
        if not order:
            order = Order.objects.create(user=user)
        items = order.orderitem_set.all()
        cartItems = order.get_cart_items  # Ensure this is called as a property
    else:
        cookieData = cookieCart(request)
        cartItems = cookieData['cartItems']
        order = cookieData['order']
        items = cookieData['items']

    return {'cartItems': cartItems, 'order': order, 'items': items}

"""
def cartData(request):
    if request.user.is_authenticated:
        user = request.user
        print("cartData -----user", user)

        # Add debugging to see all orders for this user
        all_orders = Order.objects.filter(user=user)
        print(f"All orders for user {user}: {all_orders}")

        order = Order.objects.filter(user=user, complete=False).first()
        
        if not order:
            print("No existing order found. Creating a new order...")
            order = Order.objects.create(user=user, complete=False)
        
        # Print the order ID for debugging
        print(f"Using order ID: {order.id}")
        
        items = OrderItem.objects.filter(order=order)
        print(f"Items using direct query: {items}")
        
        cartItems = order.get_cart_items

        # Debugging
        print("CartData function ....")
        print("cartItems:", cartItems)
        print("Order items count:", items.count())
        for item in items:
            print(f"Item: {item.product}, Quantity: {item.quantity}")

    else:
        cookieData = cookieCart(request)
        print("Cookie Data:", cookieData)
        
        cartItems = cookieData['cartItems']
        order = cookieData['order']
        items = cookieData['items']

    return {'cartItems': cartItems, 'order': order, 'items': items}




def guestOrder(request, data):
	name = data['form']['name']
	email = data['form']['email']

	cookieData = cookieCart(request)
	items = cookieData['items']

	customer, created = Customer.objects.get_or_create(
			email=email,
			)
	customer.name = name
	customer.save()

	order = Order.objects.create(
		customer=customer,
		)

	for item in items:
		product = Product.objects.get(id=item['id'])
		orderItem = OrderItem.objects.create(
			product=product,
			order=order,
			quantity=item['quantity'],
		)
	return customer, order


