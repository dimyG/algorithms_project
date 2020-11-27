from .serializers import UserSerializer
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model


User = get_user_model()


class UserDetail(RetrieveAPIView):
    # this view is currently not used by the web client
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated, )


class CurrentUser(APIView):
    def get(self, request, *args, **kwargs):
        # in case of anonymous user, id is None and username an empty string
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
