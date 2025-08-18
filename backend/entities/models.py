from django.db import models
from django.utils.text import slugify

class Entity(models.Model):
    """
    A hierarchical table for storing brands, models, trims, or any
    other item hierarchy without mixing with the main Category table.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=200)
    description = models.TextField(blank=True, default='')
    
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='children'
    )

    # Optional: to classify entity types (brand, model, variant, etc.)
    ENTITY_TYPES = [
        ('brand', 'Brand'),
        ('model', 'Model'),
        ('variant', 'Variant'),
        ('other', 'Other'),
    ]
    type = models.CharField(max_length=20, choices=ENTITY_TYPES, default='brand')

    class Meta:
        unique_together = ('parent', 'name')
        db_table = 'app_entity'
        verbose_name_plural = "Entities"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_hierarchy()

    def get_hierarchy(self):
        """
        Returns a hierarchical representation, e.g.:
        Toyota > Corolla > 2015 > SE
        """
        if self.parent:
            return f"{self.parent.get_hierarchy()} > {self.name}"
        return self.name

    def is_brand(self):
        return self.type == 'brand'

    def is_model(self):
        return self.type == 'model'
