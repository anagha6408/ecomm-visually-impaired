from django.urls import include, path
from . import views
from cart.views import *

app_name = "payment"
urlpatterns = [
    #path("", views.index, name="index"),
    path('payment_success', views.payment_success, name="payment_success"),
    path('paypal_success', views.paypal_success, name="paypal_success"),
    path('paypal_failed', views.paypal_failed, name="paypal_failed"),
    path('billing_info', views.billing_info, name="billing_info"),
    path('payment_process', views.payment_process, name="payment_process"),
    path('paypal_payment', views.paypal_payment, name="paypal_payment"),
    path('paypal/', include(('paypal.standard.ipn.urls', 'paypal'))),
    
]

