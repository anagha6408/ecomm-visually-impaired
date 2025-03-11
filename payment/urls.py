from django.urls import path
from . import views
from cart.views import *

app_name = "payment"
urlpatterns = [
    #path("", views.index, name="index"),
    path('payment_success', views.payment_success, name="payment_success"),
]

