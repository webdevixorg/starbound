# locations/models.py
from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=255)
    postcode = models.CharField(max_length=10, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='sublocations')


    def __str__(self):
        return self.name

    class Meta:
        db_table = 'app_location'

