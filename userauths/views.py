from django.shortcuts import redirect, render
from userauths.forms import UserRegisterForm 
from django.contrib.auth import login,authenticate,logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
def register_view(request):
    if request.method=="POST":
        form=UserRegisterForm(request.POST or None)
        if form.is_valid():
            new_user=form.save()
            username=form.cleaned_data.get("username")
            messages.success(request,f"welcome {username}, Your account is created")
            #new_user=authenticate(username=username,password=form.cleaned_data['password1'])
            new_user=authenticate(username=form.cleaned_data.get("email"),password=form.cleaned_data['password1'])
            login(request,new_user)
            return redirect("store:home")
    else:
        form=UserRegisterForm()
    
    context={
        'form':form,
    }
    return render(request,"store/sign-up.html",context)

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect("store:home")
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    
    else:
        form = AuthenticationForm()

    return render(request, "store/login.html", {"form": form})

def logout_view(request):
    logout(request)
    messages.success(request,("You have been logged out..."))
    return redirect('store:home')