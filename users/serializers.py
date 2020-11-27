from rest_framework import serializers
from django.contrib.auth import get_user_model


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()  # settings.AUTH_USER_MODEL or django USER model
        fields = ('id', 'username')
