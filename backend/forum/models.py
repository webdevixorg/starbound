from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from categories.models import Category  # Use existing Category model

User = get_user_model()

class Thread(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_threads')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='threads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_solved = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'app_forum_threads'
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def replies_count(self):
        return self.replies.count()
    
    @property
    def last_reply(self):
        return self.replies.order_by('-created_at').first()

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Thread.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

class Reply(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_solution = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'app_forum_replies'
        ordering = ['created_at']
    
    def __str__(self):
        return f'Reply to {self.thread.title}'

class ThreadView(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='thread_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'app_forum_thread_views'
        unique_together = ['thread', 'user', 'ip_address']
    
    def __str__(self):
        return f'View of {self.thread.title} by {self.user or self.ip_address}'