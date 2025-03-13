from django.db import models
from store.models import Product,Customer
from django.contrib.auth.models import User
import random
from datetime import datetime
class Order(models.Model):
	#customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
	date_ordered = models.DateTimeField(auto_now_add=True)
	complete = models.BooleanField(default=False)
	transaction_id = models.CharField(max_length=100, null=True,unique=True)

	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	full_name = models.CharField(max_length=200, null=False,default="Not Provided")
	email = models.CharField(max_length=200, null=False,default="Not Provided")
	phone = models.CharField(max_length=200, null=False,default="Not Provided")
	address = models.CharField(max_length=200, null=False, default="Not Provided")
	amount_paid = models.DecimalField(max_digits=7, decimal_places=2, null=False,default="0.00")
	payment_method = models.CharField(max_length=20, null=True, blank=True)
	#shipping = models.ForeignKey(ShippingAddress, on_delete=models.SET_NULL, null=True, blank=True)
	
	def save(self, *args, **kwargs):
		if not self.transaction_id:
			self.transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Order {self.id} - {self.transaction_id} - {self.full_name}"
		
	@property
	def shipping(self):
		#shipping = False
		orderitems = self.orderitem_set.all()
		#for i in orderitems:
		#	if i.product.digital == False:
		#		shipping = True
		return True if orderitems else False
	@property
	def get_cart_total(self):
		orderitems = self.orderitem_set.all()
		total = sum([item.get_total for item in orderitems])
		return total 

	@property
	def get_cart_items(self):
		orderitems = self.orderitem_set.all()
		total = sum([item.quantity for item in orderitems])
		return total 

class OrderItem(models.Model):
	product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True ,related_name='cart_order_items')
	order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
	quantity = models.IntegerField(default=0, null=True, blank=True)
	date_added = models.DateTimeField(auto_now_add=True)

	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	price = models.DecimalField(max_digits=7, decimal_places=2, null=False,default="0.00")

	def __str__(self):
		order_id = self.order.id if self.order else "No Order"
		product_name = self.product.name if self.product else "No Product"
		return f'Order {order_id} - {product_name}'

	
	@property
	def get_total(self):
		total = self.product.selling_price * self.quantity
		return total

