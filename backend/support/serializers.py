from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    ContactSupport, SupportMessage, HelpCategory, HelpArticle, 
    ArticleVote, Feedback, FeedbackResponse
)


class UserInfoSerializer(serializers.ModelSerializer):
    """Basic user information for nested serialization"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class SupportMessageSerializer(serializers.ModelSerializer):
    """Serializer for support ticket messages"""
    sender = UserInfoSerializer(read_only=True)
    
    class Meta:
        model = SupportMessage
        fields = [
            'id', 'sender', 'message', 'is_staff_reply', 
            'attachment', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_staff_reply', 'created_at']


class ContactSupportSerializer(serializers.ModelSerializer):
    """Serializer for contact support tickets"""
    user = UserInfoSerializer(read_only=True)
    assigned_to = UserInfoSerializer(read_only=True)
    messages = SupportMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ContactSupport
        fields = [
            'id', 'ticket_id', 'user', 'subject', 'message', 'category',
            'priority', 'status', 'contact_email', 'contact_phone',
            'assigned_to', 'created_at', 'updated_at', 'resolved_at',
            'attachment', 'messages'
        ]
        read_only_fields = [
            'id', 'ticket_id', 'user', 'assigned_to', 'created_at', 
            'updated_at', 'resolved_at', 'messages'
        ]
    
    def create(self, validated_data):
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ContactSupportCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating support tickets"""
    class Meta:
        model = ContactSupport
        fields = [
            'subject', 'message', 'category', 'priority',
            'contact_email', 'contact_phone', 'attachment'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HelpCategorySerializer(serializers.ModelSerializer):
    """Serializer for help categories"""
    article_count = serializers.SerializerMethodField()
    
    class Meta:
        model = HelpCategory
        fields = [
            'id', 'name', 'description', 'icon', 'order', 
            'is_active', 'article_count'
        ]
    
    def get_article_count(self, obj):
        return obj.articles.filter(is_published=True).count()


class HelpArticleListSerializer(serializers.ModelSerializer):
    """Simplified serializer for article listings"""
    category = HelpCategorySerializer(read_only=True)
    author = UserInfoSerializer(read_only=True)
    helpfulness_ratio = serializers.SerializerMethodField()
    
    class Meta:
        model = HelpArticle
        fields = [
            'id', 'title', 'slug', 'summary', 'category', 'author',
            'is_featured', 'view_count', 'helpful_votes', 'not_helpful_votes',
            'helpfulness_ratio', 'created_at', 'updated_at'
        ]
    
    def get_helpfulness_ratio(self, obj):
        total_votes = obj.helpful_votes + obj.not_helpful_votes
        if total_votes == 0:
            return None
        return round((obj.helpful_votes / total_votes) * 100, 1)


class HelpArticleDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual articles"""
    category = HelpCategorySerializer(read_only=True)
    author = UserInfoSerializer(read_only=True)
    helpfulness_ratio = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = HelpArticle
        fields = [
            'id', 'title', 'slug', 'content', 'summary', 'category',
            'meta_description', 'keywords', 'is_featured', 'author',
            'view_count', 'helpful_votes', 'not_helpful_votes',
            'helpfulness_ratio', 'user_vote', 'created_at', 'updated_at'
        ]
    
    def get_helpfulness_ratio(self, obj):
        total_votes = obj.helpful_votes + obj.not_helpful_votes
        if total_votes == 0:
            return None
        return round((obj.helpful_votes / total_votes) * 100, 1)
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = ArticleVote.objects.filter(
                article=obj, 
                user=request.user
            ).first()
            return vote.is_helpful if vote else None
        return None


class ArticleVoteSerializer(serializers.ModelSerializer):
    """Serializer for article votes"""
    class Meta:
        model = ArticleVote
        fields = ['id', 'article', 'is_helpful', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackResponseSerializer(serializers.ModelSerializer):
    """Serializer for feedback responses"""
    responder = UserInfoSerializer(read_only=True)
    
    class Meta:
        model = FeedbackResponse
        fields = [
            'id', 'responder', 'message', 'is_public', 'created_at'
        ]
        read_only_fields = ['id', 'responder', 'created_at']


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for user feedback"""
    user = UserInfoSerializer(read_only=True)
    assigned_to = UserInfoSerializer(read_only=True)
    responses = FeedbackResponseSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'user', 'feedback_type', 'subject', 'message',
            'overall_rating', 'ease_of_use', 'features', 'customer_service',
            'average_rating', 'contact_email', 'allow_contact', 'status',
            'assigned_to', 'browser_info', 'page_url', 'screenshot',
            'attachment', 'created_at', 'updated_at', 'responses'
        ]
        read_only_fields = [
            'id', 'user', 'assigned_to', 'status', 'created_at', 
            'updated_at', 'responses', 'average_rating'
        ]
    
    def get_average_rating(self, obj):
        ratings = [
            obj.overall_rating, obj.ease_of_use, 
            obj.features, obj.customer_service
        ]
        valid_ratings = [r for r in ratings if r is not None]
        if valid_ratings:
            return round(sum(valid_ratings) / len(valid_ratings), 1)
        return None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating feedback"""
    class Meta:
        model = Feedback
        fields = [
            'feedback_type', 'subject', 'message', 'overall_rating',
            'ease_of_use', 'features', 'customer_service', 'contact_email',
            'allow_contact', 'browser_info', 'page_url', 'screenshot', 'attachment'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackStatsSerializer(serializers.Serializer):
    """Serializer for feedback statistics"""
    total_feedback = serializers.IntegerField()
    average_overall_rating = serializers.FloatField()
    average_ease_of_use = serializers.FloatField()
    average_features = serializers.FloatField()
    average_customer_service = serializers.FloatField()
    feedback_by_type = serializers.DictField()
    feedback_by_status = serializers.DictField()
    recent_feedback_count = serializers.IntegerField()