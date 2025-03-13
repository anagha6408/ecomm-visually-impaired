from django.db import models
from django.contrib.auth.models import User
from store.models import Product
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
	


"""
#create ordr model

class Order(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	full_name = models.CharField(max_length=200, null=False)
	email = models.CharField(max_length=200, null=False)
	phone = models.CharField(max_length=200, null=False)
	address = models.CharField(max_length=200, null=False)
	amount_paid = models.DecimalField(max_digits=7, decimal_places=2, null=False)
	#shipping = models.ForeignKey(ShippingAddress, on_delete=models.SET_NULL, null=True, blank=True)
	date_ordered = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'Order: {str(self.id)}'

#create order item model

class OrderItem(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	order= models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
	product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='payment_order_items')
	quantity = models.IntegerField(default=1, null=True, blank=True)
	price = models.DecimalField(max_digits=7, decimal_places=2, null=False)

	def __str__(self):
		return f'Order Item: {str(self.id)}'"
		""
"""
