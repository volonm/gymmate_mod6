# Generated by Django 5.0.1 on 2024-01-14 16:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authorization', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='images/'),
        ),
    ]