from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # set up a custom user model, even if the default User model is sufficient for you. This model behaves
    # identically to the default user model, but you’ll be able to customize it in the future if the need arises
    pass
