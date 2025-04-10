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
    special_products = Product.objects.filter(category__name="Special")
    context = { 'special_products': special_products,}    #to pass data
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
    product = Product.objects.filter(slug=pro_slug, name=pro_name).first()
    if product:
        ratings = Rating.objects.filter(product=product)  # Changed 'products' to 'product'
        context = {
            "products": product,  # Keep variable name for template compatibility
            "in_stock": product.quantity > 0,
            "ratings": ratings
        }
        return render(request, "store/productView2.html", context)
    else:
        messages.error(request, "No product found")
        return redirect("collection")


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

from django.db.models import Q
import re  # Import regex

def search(request):
    query = request.GET.get('searched', '').strip()

    if not query:
        messages.error(request, "Please enter a search term.")
        return redirect('store:home')

    # Remove trailing punctuation (like periods, commas, etc.)
    query = re.sub(r'[^\w\s]', '', query)  

    # Debugging output
    print(f"Cleaned Search Query: {query}")

    # Search across multiple fields
    searched = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(small_description__icontains=query) |
        Q(category__name__icontains=query) |
        Q(tag__icontains=query) |
        Q(meta_title__icontains=query) |
        Q(meta_keywords__icontains=query) |
        Q(meta_description__icontains=query)
    ).distinct()

    print(f"Results Found: {searched.count()}")  # Debugging output

    if not searched.exists():
        messages.warning(request, f'No results found for "{query}".')

    return render(request, 'store/search.html', {'searched': searched, 'query': query})

from django.contrib.auth.decorators import login_required
@login_required(login_url='userauth:login')
def profile(request):
    try:
        customer = Customer.objects.get(user=request.user)
        profile, created = Profile.objects.get_or_create(customer=customer)
        
        return render(request, 'store/profile.html', {
            'customer': customer,
            'profile': profile
        })
    except Customer.DoesNotExist:
        messages.error(request, 'Customer profile not found.')
        return redirect('store:home')

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
def edit_profile(request):
    try:
        # Get or create the profile for the current customer
        customer = Customer.objects.get(user=request.user)
        profile, created = Profile.objects.get_or_create(customer=customer)
        print(f"Profile created: {created}")
        print("edit profile try inside")

        if request.method == 'POST':
            # Debugging: Print out all POST data
            print("POST request received")
            print("POST Data:", request.POST)
            print("FILES Data:", request.FILES)
            
            # Update email for the user
            if request.POST.get('email', '').strip():
                try:
                    # Validate email format
                    validate_email(request.POST.get('email'))
                    
                    # Check if email already exists
                    existing_user = User.objects.exclude(pk=request.user.pk).filter(email=request.POST.get('email')).exists()
                    if existing_user:
                        messages.error(request, 'This email is already in use by another account.')
                        return render(request, 'store/edit_profile.html', {'profile': profile})
                    
                    # Update email
                    request.user.email = request.POST.get('email').strip()
                    request.user.save()
                except ValidationError:
                    messages.error(request, 'Invalid email format.')
                    return render(request, 'store/edit_profile.html', {'profile': profile})

            # Update other profile fields
            profile.phone = request.POST.get('phone', '').strip() or profile.phone
            profile.state = request.POST.get('state', '').strip() or profile.state
            profile.city = request.POST.get('city', '').strip() or profile.city
            profile.country = request.POST.get('country', '').strip() or profile.country
            
            # Handle profile picture
            if request.FILES.get('profile_picture'):
                profile.profile_picture = request.FILES.get('profile_picture')
            
            try:
                profile.save()
                messages.success(request, 'Profile updated successfully!')
                return redirect('store:profile')
            except Exception as e:
                # More detailed error logging
                print(f"Error saving profile: {e}")
                messages.error(request, f'Error updating profile: {e}')
    
    except Customer.DoesNotExist:
        messages.error(request, 'Customer profile not found.')
        return redirect('store:home')
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error: {e}")
        messages.error(request, 'An unexpected error occurred.')
    
    # If something goes wrong, render the edit profile page
    return render(request, 'store/edit_profile.html', {'profile': profile})

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('store:profile')  # Redirect to the profile page
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    
    return render(request, 'store/change_password.html', {
        'form': form
    })

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging
from cart.models import Order

logger = logging.getLogger(__name__)

def send_order_confirmation_email(order):
    """
    Send order confirmation email with comprehensive error handling
    
    :param order: Order instance to send confirmation for
    :return: Boolean indicating email sending success
    """
    try:
        # Validate order and user
        if not order:
            logger.error("Invalid order - cannot send confirmation email")
            return False

        # Prepare context for email template
        context = {
            'order': order,
        }

        # Render email template
        html_message = render_to_string('store/order_confirmation.html', context)
        plain_message = strip_tags(html_message)

        # Logging for debugging
        logger.info(f"Sending order confirmation for Order #{order.id}")
        logger.info(f"Recipient Email: {order.email}")
        logger.info(f"Total Order Items: {order.orderitem_set.count()}")

        # Send email
        send_mail(
            f'Order Confirmation - Order #{order.id}',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [order.email],  # Use the email from the order
            html_message=html_message,
        )

        logger.info(f"Order confirmation email sent successfully to {order.email}")
        return True

    except Exception as e:
        # Comprehensive error logging
        logger.error(f"Error sending order confirmation email: {str(e)}")
        logger.error(f"Order Details - ID: {order.id}, Email: {order.email}")
        return False

# Example usage in a view
def order_confirmation_view(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        send_order_confirmation_email(order)
    except Order.DoesNotExist:
        logger.error(f"Order with ID {order_id} not found")

from django.shortcuts import redirect, get_object_or_404
@login_required
def rate_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)

    # Ensure the order is delivered before allowing ratings
    if order.order_status != 'Delivered':
        messages.error(request, "You can only rate delivered orders.")
        return redirect('cart:order_details', order_id=order.id)

    for item in order.orderitem_set.all():
        rating_value = request.POST.get(f'rating_{item.product.id}')
        if rating_value:
            Rating.objects.update_or_create(
                user=request.user,
                product=item.product,
                defaults={'rating': int(rating_value)}
            )

    messages.success(request, "Your ratings have been submitted.")
    return redirect('cart:order_details', order_id=order.id)

@login_required
def Order_search(request):
    search_query = request.GET.get('searched', '')
    print("Search query:", search_query)
    while search_query and search_query[-1] in '.,;:!?"\'':
        search_query = search_query[:-1]
        
    user_orders = Order.objects.filter(user=request.user, complete=True)
    print("Total orders:", user_orders.count())

    if search_query:
        filtered_orders = user_orders.filter(
            Q(transaction_id__icontains=search_query) |
            Q(order_status__icontains=search_query) |
            Q(payment_method__icontains=search_query)
        )
        print("Filtered orders:", filtered_orders.count())
        user_orders = filtered_orders

    context = {
        'past_orders': user_orders.order_by('-date_ordered'),
    }
    return render(request, 'store/past_orders.html', context)