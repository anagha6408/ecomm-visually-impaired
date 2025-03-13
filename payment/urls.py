from django.urls import path
from . import views
from cart.views import *

app_name = "payment"
urlpatterns = [
    #path("", views.index, name="index"),
    path('payment_success', views.payment_success, name="payment_success"),
    path('billing_info', views.billing_info, name="billing_info"),
    path('payment_process', views.payment_process, name="payment_process"),
    path('paypal_payment', views.paypal_payment, name="paypal_payment"),
]

