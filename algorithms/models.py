from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver


class TimeStampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Algorithm(TimeStampMixin):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    has_animation = models.BooleanField(default=False)