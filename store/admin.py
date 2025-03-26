from django.contrib import admin
from .models import Category,Product,CarouselImage,Profile
# Register your models here.

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(CarouselImage)
admin.site.register(Profile)