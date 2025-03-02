from django.db import models
import datetime
import os
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
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