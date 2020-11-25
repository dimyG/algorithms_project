from rest_framework import serializers
from .models import Algorithm


class AlgorithmSerializer(serializers.ModelSerializer):

    class Meta:
        model = Algorithm
        fields = ('id', 'name', 'slug', 'has_animation')
