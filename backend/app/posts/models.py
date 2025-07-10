from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.auth.models import User
from categories.models import Category

class PostAbstract(models.Model):
    class StatusChoices(models.TextChoices):
        PUBLISHED = 'published', 'Published'
        DRAFT = 'draft', 'Draft'
        ARCHIVED = 'archived', 'Archived'
        DELETED = 'deleted', 'Deleted'

    title = models.CharField(max_length=200, default='')
    slug = models.SlugField(max_length=200, unique=True, blank=True)  # Allow auto-generation
    description = models.TextField(blank=True)
    images = GenericRelation('uploads.Image', related_query_name='posts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)  # Automatic timestamping
    content_type_id = models.PositiveSmallIntegerField(default=0)  # Saves space

    status = models.CharField(
        max_length=10,
        choices=StatusChoices.choices,
        default=StatusChoices.DRAFT  # Default to 'Draft'
    )

    def __str__(self):
        return self.title

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:  # Auto-generate slug from title if missing
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    

class Post(PostAbstract):
    categories = models.ManyToManyField(Category, related_name='posts')

    def __str__(self):
        return self.title

class VisitorCount(models.Model):
    post = models.ForeignKey(Post, related_name='visitor_counts', on_delete=models.CASCADE)
    count = models.IntegerField(default=0)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_post_visitor_count'

    def __str__(self):
        return f"Visitor count for {self.post.title} on {self.date}"

class AggregatedVisitorCount(models.Model):
    post = models.ForeignKey(Post, related_name='aggregated_visitor_counts', on_delete=models.CASCADE)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_aggregated_visitor_count'

    def __str__(self):
        return f"Aggregated visitor count for {self.post.title}"
