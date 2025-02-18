class Cart():
    def __init__(self, request):
        self.session = request.session
        # Try to get the existing cart from session
        cart = self.session.get('session_key')
        
        # Create a new cart if none exists
        if 'session_key' not in request.session:
            cart = self.session['session_key'] = {}
        
        self.cart = cart
    
    def add(self, product, quantity=1):
        """
        Add a product to the cart or update its quantity
        """
        product_id = str(product.id)
        
        if product_id not in self.cart:
            # If product not in cart, add it with initial quantity
            self.cart[product_id] = {
                'quantity': quantity,
                'price': str(product.selling_price),
                'name': product.name
            }
        else:
            # If product exists, update its quantity
            self.cart[product_id]['quantity'] += quantity
            
        # Mark the session as modified to ensure it gets saved
        self.session.modified = True