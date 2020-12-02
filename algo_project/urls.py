"""algo_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from algorithms.views import AlgorithmViewSet, test
from users.views import UserDetail, CurrentUser

router = DefaultRouter()
router.register(r'algorithms', AlgorithmViewSet)

urlpatterns = [
    path('test/', test, name='test'),
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('users/<int:pk>/', UserDetail.as_view()),
    path('users/current/', CurrentUser.as_view()),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    re_path(r'^(?P<path>.*)/$', TemplateView.as_view(template_name='index.html')),  # this matches all except '/'
    path('', TemplateView.as_view(template_name='index.html'))  # This matches the '/'
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
