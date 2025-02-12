from django.urls import path,include
from userauths import views
from userauths.views import *

app_name="userauth"

urlpatterns = [
    path("sign-up/",views.register_view,name="sign-up"),
    path('store/', include(('store.urls', 'home'))),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]
