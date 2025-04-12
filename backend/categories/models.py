from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(default='')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    content_type_id = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'app_category'