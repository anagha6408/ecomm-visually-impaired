from .models import Wishlist

def wishlist_count(request):
    if request.user.is_authenticated:
        count = Wishlist.objects.filter(user=request.user).count()
    else:
        count = 0  # If user is not logged in, show 0
    return {'wishlist_count': count}
