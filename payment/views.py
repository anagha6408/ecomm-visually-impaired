from django.shortcuts import render

def payment_success(request):
    return render(request, 'store/payment_success.html',{})
