from django.shortcuts import render,get_object_or_404
from .cart import Cart
from store.models  import Product
from django.http import JsonResponse
def cart_summary(request):
    return render(request, 'store/cart.html',{})

def cart_add(request):
    print("Request method:", request.method)  # Debug print
    print("POST data:", request.POST)  # Debug print
    
    if request.method == "POST" and request.POST.get("action") == "post":
        try:
            cart = Cart(request)
            product_id = request.POST.get("product_id")
            quantity = int(request.POST.get("quantity", 1))
            
            print(f"Adding product {product_id} with quantity {quantity}")  # Debug print
            
            product = get_object_or_404(Product, id=product_id)
            cart.add(product=product, quantity=quantity)
            
            return JsonResponse({"product Name": product.name, "quantity": quantity})
        except Exception as e:
            print(f"Error in cart_add: {e}")  # Debug print
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request"}, status=400)
def cart_delete(request):
    return render(request, 'store/cart_delete.html')

def cart_update(request):
    return render(request, 'store/cart_update.html')
