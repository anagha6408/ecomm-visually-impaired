from django.urls import path
from .views import add_to_wishlist, wishlist_view, remove_from_wishlist

app_name = "wishlist"

urlpatterns = [
    path("add/", add_to_wishlist, name="add"),
    path("view/", wishlist_view, name="view"),
    path("remove/", remove_from_wishlist, name="remove"),
]
