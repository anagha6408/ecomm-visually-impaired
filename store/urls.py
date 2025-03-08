from django.urls import path

from . import views
from django.conf.urls.static import static
from django.conf import settings
from .views import store_home
from cart.views import *
app_name = "store"

urlpatterns = [
    #path("", views.index, name="index"),
    path('', views.home, name="home"),
    path('store_home/', store_home, name='store_home'),
    path('category/', views.collection, name="collection"),
    path('collections/<str:slug>',views.collectionsview,name="collectionsview"),
    path('collections/<str:pro_slug>/<str:pro_name>/',views.productView,name="productView"),
    path('carousel_view/',views.carousel_view,name="slider"),
    path('editProfile/',views.editProfile,name="editProfile"),
    path('search/', views.search, name='search'),
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

