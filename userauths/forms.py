from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User  # Import Django's User model

class UserRegisterForm(UserCreationForm):
    class Meta:
        model = User  # Use Django's User model
        fields = ['username', 'email']
