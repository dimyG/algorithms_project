from rest_framework import viewsets
from rest_framework import permissions
from .models import Algorithm
from .serializers import AlgorithmSerializer
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.template.response import TemplateResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import time


class AlgorithmMixin(object):
    queryset = Algorithm.objects.all()
    serializer_class = AlgorithmSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


decorators = [csrf_protect]


@method_decorator(decorators, name='dispatch')
class AlgorithmViewSet(AlgorithmMixin, viewsets.ModelViewSet):

    def destroy(self, request, *args, **kwargs):
        algorithm = self.get_object()
        if algorithm.has_animation:
            message = "Only Gandalf can delete {}...".format(algorithm.name)
            return Response(data=message, status=status.HTTP_403_FORBIDDEN)
        return super(AlgorithmViewSet, self).destroy(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        response = super(AlgorithmViewSet, self).list(request, *args, **kwargs)
        # time.sleep(0.5)
        response.set_cookie('test', 'test_value')
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(AlgorithmViewSet, self).retrieve(request, *args, **kwargs)
        # time.sleep(0.5)
        return response

    @action(detail=False, methods=['delete'])
    def delete_many(self, request, *args, **kwargs):
        ids = []
        animation_ids = Algorithm.objects.filter(has_animation=True).values_list('id', flat=True)
        for item in request.data:
            algorithm_id = item.get("id", None)
            # don't delete algorithms with animations
            if algorithm_id and algorithm_id not in animation_ids:
                ids.append(algorithm_id)
        response = Algorithm.objects.filter(id__in=ids).delete()
        return Response(response)


def test(request):
    return TemplateResponse(request, 'test.html')
