from django.shortcuts import render, redirect
from .models import Wishlist
from store.models import Product  # Assuming products are in the store app
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages

def wishlist_view(request):
    if not request.user.is_authenticated:
        messages.warning(request, "You must be logged in to view your wishlist.")
        return redirect('/user/sign-up/')  # Or whatever your login URL is
    
    # Original function continues for authenticated users
    wishlist_items = Wishlist.objects.filter(user=request.user)
    
    if not wishlist_items:
        messages.info(request, "Your wishlist is empty.")

    return render(request, "store/wishlist.html", {"wishlist_items": wishlist_items})

def add_to_wishlist(request):
    if not request.user.is_authenticated:
        messages.warning(request, "You must be logged in to add items to your wishlist.")
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "POST":
        product_id = request.POST.get("product_id")
        product = Product.objects.get(id=product_id)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)

        if created:
            message = "Added to Wishlist"
            #messages.success(request, message)
        else:
            message = "Already in Wishlist"
            #messages.info(request, message)

        wishlist_count = Wishlist.objects.filter(user=request.user).count()
        return JsonResponse({"message": message, "wishlist_count": wishlist_count})

from django.http import JsonResponse

def remove_from_wishlist(request):
    if not request.user.is_authenticated:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False, 
                'message': 'You must be logged in to remove items from your wishlist.',
                'wishlist_count': 0
            })
        messages.warning(request, "You must be logged in to remove items from your wishlist.")
        return redirect('/user/sign-up/')
        
    if request.method == "POST":
        product_id = request.POST.get("product_id")
        Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        
        # If it's an AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            wishlist_count = Wishlist.objects.filter(user=request.user).count()
            return JsonResponse({
                'success': True,
                'message': 'Item removed from your wishlist.',
                'wishlist_count': wishlist_count
            })
        
        # For regular form submission, redirect
        messages.success(request, "Item removed from your wishlist.")
        return redirect("wishlist:view")