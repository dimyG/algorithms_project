from rest_framework import viewsets
from rest_framework import permissions
from .models import Algorithm
from .serializers import AlgorithmSerializer
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.template.response import TemplateResponse


class AlgorithmMixin(object):
    queryset = Algorithm.objects.all()
    serializer_class = AlgorithmSerializer
    # permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


decorators = [csrf_protect]


# @method_decorator(decorators, name='dispatch')
class AlgorithmViewSet(AlgorithmMixin, viewsets.ModelViewSet):

    def list(self, request, *args, **kwargs):
        response = super(AlgorithmViewSet, self).list(request, *args, **kwargs)
        response.set_cookie('test', 'test_value')
        return response


def test(request):
    return TemplateResponse(request, 'test.html')
