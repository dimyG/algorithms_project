# Generated by Django 3.1.1 on 2020-11-25 11:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('algorithms', '0003_algorithm_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='algorithm',
            name='slug',
            field=models.SlugField(max_length=100, unique=True),
        ),
    ]
