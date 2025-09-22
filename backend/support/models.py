from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class ContactSupport(models.Model):
    """Model for contact support tickets"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'General Inquiry'),
        ('technical', 'Technical Issue'),
        ('billing', 'Billing'),
        ('booking', 'Booking Issue'),
        ('refund', 'Refund Request'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
        ('other', 'Other'),
    ]
    
    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    
    # Contact information
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Assignment and tracking
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tickets',
        limit_choices_to={'is_staff': True}
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Attachments (optional)
    attachment = models.FileField(upload_to='support_attachments/', null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
    
    def __str__(self):
        return f"#{self.ticket_id} - {self.subject}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            # Generate unique ticket ID
            import uuid
            self.ticket_id = f"SUP-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class SupportMessage(models.Model):
    """Model for messages/replies within a support ticket"""
    ticket = models.ForeignKey(ContactSupport, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_staff_reply = models.BooleanField(default=False)
    attachment = models.FileField(upload_to='support_messages/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message for {self.ticket.ticket_id} by {self.sender.username}"


class HelpCategory(models.Model):
    """Categories for help articles"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Font Awesome icon class")
    order = models.IntegerField(default=0, help_text="Display order")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Help Category'
        verbose_name_plural = 'Help Categories'
    
    def __str__(self):
        return self.name


class HelpArticle(models.Model):
    """Help center articles/FAQs"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    summary = models.TextField(max_length=300, help_text="Brief summary for listing pages")
    category = models.ForeignKey(HelpCategory, on_delete=models.CASCADE, related_name='articles')
    
    # SEO and metadata
    meta_description = models.CharField(max_length=160, blank=True)
    keywords = models.CharField(max_length=200, blank=True, help_text="Comma-separated keywords")
    
    # Publishing
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    # Analytics
    view_count = models.IntegerField(default=0)
    helpful_votes = models.IntegerField(default=0)
    not_helpful_votes = models.IntegerField(default=0)
    
    # Authoring
    author = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff': True})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__order', 'order', 'title']
        unique_together = ['category', 'slug']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ArticleVote(models.Model):
    """Track helpful/not helpful votes for articles"""
    article = models.ForeignKey(HelpArticle, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()  # True for helpful, False for not helpful
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['article', 'user']
    
    def __str__(self):
        vote_type = "Helpful" if self.is_helpful else "Not Helpful"
        return f"{vote_type} vote for {self.article.title}"


class Feedback(models.Model):
    """User feedback system"""
    FEEDBACK_TYPES = [
        ('general', 'General Feedback'),
        ('bug_report', 'Bug Report'),
        ('feature_request', 'Feature Request'),
        ('improvement', 'Improvement Suggestion'),
        ('compliment', 'Compliment'),
        ('complaint', 'Complaint'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('reviewed', 'Reviewed'),
        ('in_progress', 'In Progress'),
        ('implemented', 'Implemented'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback')
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES, default='general')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Ratings (optional)
    overall_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, 
        blank=True,
        help_text="Overall rating from 1-5 stars"
    )
    ease_of_use = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, 
        blank=True
    )
    features = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, 
        blank=True
    )
    customer_service = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, 
        blank=True
    )
    
    # Contact and follow-up
    contact_email = models.EmailField()
    allow_contact = models.BooleanField(default=True, help_text="Allow staff to contact about this feedback")
    
    # Status and assignment
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_feedback',
        limit_choices_to={'is_staff': True}
    )
    
    # System information (for bug reports)
    browser_info = models.TextField(blank=True, help_text="Browser/device information")
    page_url = models.URLField(blank=True, help_text="Page where issue occurred")
    
    # Attachments
    screenshot = models.ImageField(upload_to='feedback_screenshots/', null=True, blank=True)
    attachment = models.FileField(upload_to='feedback_attachments/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Internal notes
    internal_notes = models.TextField(blank=True, help_text="Internal staff notes")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User Feedback'
        verbose_name_plural = 'User Feedback'
    
    def __str__(self):
        return f"{self.get_feedback_type_display()} - {self.subject}"


class FeedbackResponse(models.Model):
    """Staff responses to feedback"""
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='responses')
    responder = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff': True})
    message = models.TextField()
    is_public = models.BooleanField(default=True, help_text="Visible to the user who submitted feedback")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Response to {self.feedback.subject}"