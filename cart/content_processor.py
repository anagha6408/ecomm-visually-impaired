from .cart import Cart

def cart(request):
    return {'cart': Cart(request)}
from .cart import cartData  # Import your cartData function

def cart_items_processor(request):
    data = cartData(request)  # Get cart details
    return {'cartItems': data['cartItems']}  # Make cartItems available globally
