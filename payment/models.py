from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class ShippingAddress(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	#order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
	shipping_name = models.CharField(max_length=200, null=False)
	shipping_address = models.CharField(max_length=200, null=False)
	shipping_city = models.CharField(max_length=200, null=True, blank=True)
	shipping_state = models.CharField(max_length=200, null=True, blank=True)
	shipping_zipcode = models.CharField(max_length=200, null=True, blank=True)
	shipping_country = models.CharField(max_length=200, null=False)
	shipping_phone = models.CharField(max_length=200, null=False)
	shipping_email = models.CharField(max_length=200, null=False)
	shipping_date_added = models.DateTimeField(auto_now_add=True)
	#to dont pluralize the shipping address
	class Meta:
		verbose_name_plural = 'Shipping Addresses'
	def __str__(self):
		return f'Shipping Address: {str(self.id)}'
