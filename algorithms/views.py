from rest_framework import viewsets
from rest_framework import permissions
from .models import Algorithm
from .serializers import AlgorithmSerializer


class AlgorithmMixin(object):
    queryset = Algorithm.objects.all()
    serializer_class = AlgorithmSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class AlgorithmViewSet(AlgorithmMixin, viewsets.ModelViewSet):
    pass
