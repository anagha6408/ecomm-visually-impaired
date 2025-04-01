from django.db import models
import datetime
import os
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg
def get_file_path(request,filename):
    original_filename=filename
    nowTime=datetime.datetime.now().strftime('%Y%m%d%H:%M:%S')
    filename="%s%s" %(nowTime,original_filename)
    return os.path.join('uploads/',filename)
# Create your models here.
class Category(models.Model):
    slug=models.CharField(max_length=150,blank=False)
    name=models.CharField(max_length=150,blank=False)
    image=models.ImageField(upload_to=get_file_path,null=True,blank=True)
    description=models.TextField(max_length=500,null=False,blank=False)
    status=models.BooleanField(default=False,help_text="0=default,1=Hidden")
    trending=models.BooleanField(default=False,help_text="0=default,1=Trending")
    meta_title=models.CharField(max_length=150,null=False,blank=False)
    meta_keywords=models.CharField(max_length=150,null=False,blank=False)
    meta_description=models.TextField(max_length=500,null=False,blank=False)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    

class Product(models.Model):
    category=models.ForeignKey(Category,on_delete=models.CASCADE)
    slug=models.CharField(max_length=150,blank=False)
    name=models.CharField(max_length=150,blank=False)
    product_image=models.ImageField(upload_to=get_file_path,null=True,blank=True)
    small_description=models.CharField(max_length=200,null=False,blank=False)
    description=models.TextField(max_length=500,null=False,blank=False)
    quantity=models.IntegerField(null=False,blank=False)
    original_price=models.FloatField(null=False,blank=False)
    selling_price=models.FloatField(null=False,blank=False)
    status=models.BooleanField(default=False,help_text="0=default,1=Hidden")
    trending=models.BooleanField(default=False,help_text="0=default,1=Trending")
    tag=models.CharField(max_length=150,null=False,blank=False)
    meta_title=models.CharField(max_length=150,null=False,blank=False)
    meta_keywords=models.CharField(max_length=150,null=False,blank=False)
    meta_description=models.TextField(max_length=500,null=False,blank=False)
    created_at=models.DateTimeField(auto_now_add=True)

    @property
    def imageURL(self):
        try:
             return '/static/uploads/' + self.image.name.split('/')[-1]
        except:
            return '/static/images/placeholder.png'
        
    def average_rating(self):
        avg_rating = self.rating_set.aggregate(Avg('rating'))['rating__avg']
        return round(avg_rating, 1) if avg_rating else 0
    
    def __str__(self):
        return self.name
    
class Customer(models.Model):
	user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
	name = models.CharField(max_length=200, null=True)
	email = models.CharField(max_length=200)

	def __str__(self):
		return self.name
class CarouselImage(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)  # Optional title for the image
    image_ads  = models.ImageField(upload_to='carousel/')  # Uploads images to `MEDIA_ROOT/carousel/`
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the image was added

    def __str__(self):
        return self.title
    

from django.db import models
from django.contrib.auth.models import User
from store.models import Customer  # Assuming Customer model is in the store app

class Profile(models.Model):
    """
    Separate Profile model linked to Customer
    """
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/', 
        null=True, 
        blank=True, 
        default='default_profile.png'
    )
    
    def __str__(self):
        return f"{self.customer.name}'s Profile"

    class Meta:
        verbose_name = 'Customer Profile'
        verbose_name_plural = 'Customer Profiles'


class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who rated
    product = models.ForeignKey(Product, on_delete=models.CASCADE)  # Product being rated
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # Rating from 1 to 5
    review = models.TextField(blank=True, null=True)  # Optional review text
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp
    product_name = models.CharField(max_length=255, editable=False,default='')  # Store product name at the time of rating
    class Meta:
        unique_together = ('user', 'product')  # One rating per user per product
    def save(self, *args, **kwargs):
        # Store the product name at the time of rating creation
        self.product_name = self.product.name  
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.product.id} ({self.product.name}): {self.rating} ⭐"