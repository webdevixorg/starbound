from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    ContactSupport, SupportMessage, HelpCategory, HelpArticle, 
    ArticleVote, Feedback, FeedbackResponse
)


class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 0
    readonly_fields = ['sender', 'created_at']
    fields = ['sender', 'message', 'is_staff_reply', 'attachment', 'created_at']


@admin.register(ContactSupport)
class ContactSupportAdmin(admin.ModelAdmin):
    list_display = [
        'ticket_id', 'subject', 'user', 'category', 'priority', 
        'status', 'assigned_to', 'created_at'
    ]
    list_filter = ['category', 'priority', 'status', 'created_at', 'assigned_to']
    search_fields = ['ticket_id', 'subject', 'message', 'user__username', 'user__email']
    readonly_fields = ['ticket_id', 'created_at', 'updated_at']
    inlines = [SupportMessageInline]
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('ticket_id', 'subject', 'message', 'category', 'priority')
        }),
        ('User Information', {
            'fields': ('user', 'contact_email', 'contact_phone')
        }),
        ('Management', {
            'fields': ('status', 'assigned_to', 'attachment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'assigned_to')


@admin.register(HelpCategory)
class HelpCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'article_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    
    def article_count(self, obj):
        return obj.articles.filter(is_published=True).count()
    article_count.short_description = 'Published Articles'


@admin.register(HelpArticle)
class HelpArticleAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'is_published', 'is_featured', 
        'view_count', 'helpful_votes', 'not_helpful_votes', 'created_at'
    ]
    list_filter = [
        'category', 'is_published', 'is_featured', 'created_at', 'author'
    ]
    search_fields = ['title', 'content', 'summary', 'keywords']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'helpful_votes', 'not_helpful_votes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Article Content', {
            'fields': ('title', 'slug', 'summary', 'content')
        }),
        ('Categorization', {
            'fields': ('category', 'is_published', 'is_featured', 'order')
        }),
        ('SEO', {
            'fields': ('meta_description', 'keywords'),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('view_count', 'helpful_votes', 'not_helpful_votes'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('author', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new article
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(ArticleVote)
class ArticleVoteAdmin(admin.ModelAdmin):
    list_display = ['article', 'user', 'is_helpful', 'created_at']
    list_filter = ['is_helpful', 'created_at']
    search_fields = ['article__title', 'user__username']
    readonly_fields = ['created_at']


class FeedbackResponseInline(admin.TabularInline):
    model = FeedbackResponse
    extra = 0
    readonly_fields = ['responder', 'created_at']
    fields = ['responder', 'message', 'is_public', 'created_at']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'subject', 'user', 'feedback_type', 'overall_rating', 
        'status', 'assigned_to', 'created_at'
    ]
    list_filter = [
        'feedback_type', 'status', 'overall_rating', 'created_at', 
        'allow_contact', 'assigned_to'
    ]
    search_fields = ['subject', 'message', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'user']
    inlines = [FeedbackResponseInline]
    
    fieldsets = (
        ('Feedback Information', {
            'fields': ('user', 'feedback_type', 'subject', 'message')
        }),
        ('Ratings', {
            'fields': ('overall_rating', 'ease_of_use', 'features', 'customer_service'),
            'classes': ('collapse',)
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'allow_contact')
        }),
        ('Management', {
            'fields': ('status', 'assigned_to', 'internal_notes')
        }),
        ('Technical Information', {
            'fields': ('browser_info', 'page_url', 'screenshot', 'attachment'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'assigned_to')


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ['feedback', 'responder', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at', 'responder']
    search_fields = ['feedback__subject', 'message', 'responder__username']
    readonly_fields = ['created_at']


# Customize admin site
admin.site.site_header = "Support System Administration"
admin.site.site_title = "Support Admin"
admin.site.index_title = "Welcome to Support System Administration"