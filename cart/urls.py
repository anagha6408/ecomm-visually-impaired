from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = "cart"

urlpatterns = [
    path('', views.store, name="store"),
    path('cart/', views.cart, name="cart"),
    path('checkout/', views.checkout, name="checkout"),
    path('update_item/', views.updateItem, name="update_item"),
	path('process_order/', views.processOrder, name="process_order"),
    path('past-orders/', views.past_orders, name='past_orders'),
    path('order/<int:order_id>/', views.order_details, name='order_details'),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)