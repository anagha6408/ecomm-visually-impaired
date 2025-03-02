from django.shortcuts import render,redirect
import os
from django.contrib import messages
from django.conf import settings
from .models import CarouselImage
from .models import *
from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the store app.")

def home(request):
	context = {}    #to pass data
	return render(request, 'store/home.html', context)
#
#def cart(request):
#	context = {}
#	return render(request, 'store/cart2.html', context)

#def checkout(request):
#	context = {}
#	return render(request, 'store/checkout.html', context)

def collection(request):
	category=Category.objects.filter()
	context = {'category':category}
	return render(request, 'store/category.html', context)

def collectionsview(request,slug):
	if(Category.objects.filter(slug=slug)):
		products=Product.objects.filter(category__slug=slug)
		category=Category.objects.filter(slug=slug).first()
		context={"products":products,"category":category}
		return render(request,"store/products.html",context)
	else:
		messages.warning(request,"No such category product was found")
		return redirect('collection')
	
def productView(request, pro_slug, pro_name):
		if(Product.objects.filter(slug=pro_slug)):
			#products=Product.objects.filter(slug=pro_slug).first()
			products = Product.objects.filter(slug=pro_slug, name=pro_name).first()
			context={"products":products,"in_stock": products.quantity > 0}
		else:
			messages.error(request,"No product found")
			return redirect("collection")
		return render(request,"store/productView.html",context)

# to dynamically display the images from the  products folder in the silder
def carousel_view(request):
    ads = CarouselImage.objects.all()  # Fetch all images
    return render(request, 'store/slider.html', {'ads': ads})

def store_home(request):
    text = "Welcome to the store. Find the best products here."

    # Path to store the audio file
    audio_file_path = os.path.join(settings.MEDIA_ROOT, "store_audio.mp3")

    # Generate speech if the file does not exist
    if not os.path.exists(audio_file_path):
        tts = gTTS(text=text, lang='en')
        tts.save(audio_file_path)

    # Pass the audio URL to the store page
    return render(request, "store/store.html", {"audio_url": settings.MEDIA_URL + "store_audio.mp3"})

def welcome_msg(request):
    welcome_message = "Welcome to our eCommerce website designed for visually impaired users. We are here to assist you!"
    return render(request, 'home.html', {'welcome_message': welcome_message})
def editProfile(request):
	return render(request,"store/editProfile.html")