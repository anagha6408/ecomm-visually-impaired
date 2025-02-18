from django.urls import path

from . import views
from django.conf.urls.static import static
from django.conf import settings
from .views import store_home

app_name = "store"

urlpatterns = [
    #path("", views.index, name="index"),
    path('', views.home, name="home"),
    path('store_home/', store_home, name='store_home'),
	path('cart/', views.cart, name="cart"),
    path('category/', views.collection, name="collection"),
    path('collections/<str:slug>',views.collectionsview,name="collectionsview"),
    path('collections/<str:pro_slug>/<str:pro_name>/',views.productView,name="productView"),
	path('checkout/', views.checkout, name="checkout"),
    path('carousel_view/',views.carousel_view,name="slider"),
    path('editProfile/',views.editProfile,name="editProfile"),
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

