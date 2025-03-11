from django import forms
from .models import ShippingAddress

class ShippingForm(forms.ModelForm):
    shipping_name=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'Full Name'}),required=True)
    shipping_address=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'Address'}),required=True)
    shipping_city=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'City'}),required=True)
    shipping_state=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'State'}),required=True)
    shipping_zipcode=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'Zipcode'}),required=True)
    shipping_country=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'Country'}),required=True)
    shipping_phone=forms.CharField(label="",widget=forms.TextInput(attrs={'class':'form-control','placeholder':'Phone'}),required=True)
    shipping_email=forms.EmailField(label="",widget=forms.EmailInput(attrs={'class':'form-control','placeholder':'Email'}),required=True)
    #shipping_date_added=forms.DateTimeField(label="",widget=forms.DateTimeInput(attrs={'class':'form-control','placeholder':'Date Added'}),required=True)

    class Meta:
        model = ShippingAddress
        fields = ['shipping_name','shipping_address','shipping_city','shipping_state','shipping_zipcode','shipping_country','shipping_phone','shipping_email',]
        exclude = ['user',]