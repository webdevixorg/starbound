from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Avg, Count
from django.utils import timezone
from datetime import timedelta

from .models import (
    ContactSupport, SupportMessage, HelpCategory, HelpArticle, 
    ArticleVote, Feedback, FeedbackResponse
)
from .serializers import (
    ContactSupportSerializer, ContactSupportCreateSerializer,
    SupportMessageSerializer, HelpCategorySerializer,
    HelpArticleListSerializer, HelpArticleDetailSerializer,
    ArticleVoteSerializer, FeedbackSerializer, FeedbackCreateSerializer,
    FeedbackResponseSerializer, FeedbackStatsSerializer
)


class ContactSupportViewSet(viewsets.ModelViewSet):
    """ViewSet for contact support tickets"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['subject', 'message', 'ticket_id']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter tickets based on user role"""
        user = self.request.user
        if user.is_staff or user.is_superuser:
            # Staff can see all tickets
            return ContactSupport.objects.all().prefetch_related('messages', 'user', 'assigned_to')
        else:
            # Regular users can only see their own tickets
            return ContactSupport.objects.filter(user=user).prefetch_related('messages')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContactSupportCreateSerializer
        return ContactSupportSerializer
    
    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """Add a message to a support ticket"""
        ticket = self.get_object()
        serializer = SupportMessageSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            message = serializer.save(
                ticket=ticket,
                sender=request.user,
                is_staff_reply=request.user.is_staff
            )
            
            # Update ticket status if needed
            if ticket.status == 'closed' and not request.user.is_staff:
                ticket.status = 'open'
                ticket.save()
            
            return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def assign_ticket(self, request, pk=None):
        """Assign ticket to a staff member"""
        ticket = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if assigned_to_id:
            from django.contrib.auth.models import User
            try:
                assigned_user = User.objects.get(id=assigned_to_id, is_staff=True)
                ticket.assigned_to = assigned_user
                ticket.save()
                return Response({'message': 'Ticket assigned successfully'})
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid staff member'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            ticket.assigned_to = None
            ticket.save()
            return Response({'message': 'Ticket unassigned'})
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        """Update ticket status"""
        ticket = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(ContactSupport.STATUS_CHOICES):
            old_status = ticket.status
            ticket.status = new_status
            
            if new_status == 'resolved' and old_status != 'resolved':
                ticket.resolved_at = timezone.now()
            
            ticket.save()
            return Response({'message': 'Status updated successfully'})
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Get current user's tickets"""
        tickets = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a support ticket"""
        ticket = self.get_object()
        messages = ticket.messages.all().order_by('created_at')
        serializer = SupportMessageSerializer(messages, many=True)
        return Response(serializer.data)


class HelpCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for help categories"""
    queryset = HelpCategory.objects.filter(is_active=True)
    serializer_class = HelpCategorySerializer
    ordering = ['order', 'name']
    
    @action(detail=True, methods=['get'])
    def articles(self, request, pk=None):
        """Get articles for a specific category"""
        category = self.get_object()
        articles = HelpArticle.objects.filter(
            category=category, 
            is_published=True
        ).order_by('order', 'title')
        
        serializer = HelpArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class HelpArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for help articles"""
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'content', 'summary', 'keywords']
    ordering_fields = ['title', 'created_at', 'view_count', 'helpful_votes']
    ordering = ['order', 'title']
    
    def get_queryset(self):
        return HelpArticle.objects.filter(is_published=True).select_related('category', 'author')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HelpArticleDetailSerializer
        return HelpArticleListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get article detail and increment view count"""
        instance = self.get_object()
        
        # Increment view count
        HelpArticle.objects.filter(id=instance.id).update(
            view_count=instance.view_count + 1
        )
        instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote on article helpfulness"""
        article = self.get_object()
        is_helpful = request.data.get('is_helpful')
        
        if is_helpful is None:
            return Response(
                {'error': 'is_helpful field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update or create vote
        vote, created = ArticleVote.objects.update_or_create(
            article=article,
            user=request.user,
            defaults={'is_helpful': is_helpful}
        )
        
        # Update article vote counts
        helpful_count = ArticleVote.objects.filter(article=article, is_helpful=True).count()
        not_helpful_count = ArticleVote.objects.filter(article=article, is_helpful=False).count()
        
        article.helpful_votes = helpful_count
        article.not_helpful_votes = not_helpful_count
        article.save()
        
        action_text = "updated" if not created else "recorded"
        return Response({'message': f'Vote {action_text} successfully'})
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured articles"""
        articles = self.get_queryset().filter(is_featured=True)[:5]
        serializer = HelpArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular articles by view count"""
        articles = self.get_queryset().order_by('-view_count')[:10]
        serializer = HelpArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class FeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet for user feedback"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['subject', 'message']
    ordering_fields = ['created_at', 'updated_at', 'overall_rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter feedback based on user role"""
        user = self.request.user
        if user.is_staff or user.is_superuser:
            # Staff can see all feedback
            return Feedback.objects.all().prefetch_related('responses', 'user', 'assigned_to')
        else:
            # Regular users can only see their own feedback
            return Feedback.objects.filter(user=user).prefetch_related('responses')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_response(self, request, pk=None):
        """Add a staff response to feedback"""
        feedback = self.get_object()
        serializer = FeedbackResponseSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            response = serializer.save(
                feedback=feedback,
                responder=request.user
            )
            
            # Update feedback status if needed
            if feedback.status == 'new':
                feedback.status = 'reviewed'
                feedback.save()
            
            return Response(FeedbackResponseSerializer(response).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        """Update feedback status"""
        feedback = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Feedback.STATUS_CHOICES):
            feedback.status = new_status
            feedback.save()
            return Response({'message': 'Status updated successfully'})
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        """Get feedback statistics"""
        # Date range (last 30 days by default)
        days = int(request.query_params.get('days', 30))
        since_date = timezone.now() - timedelta(days=days)
        
        feedback_qs = Feedback.objects.filter(created_at__gte=since_date)
        
        stats = {
            'total_feedback': feedback_qs.count(),
            'average_overall_rating': feedback_qs.aggregate(
                avg=Avg('overall_rating')
            )['avg'] or 0,
            'average_ease_of_use': feedback_qs.aggregate(
                avg=Avg('ease_of_use')
            )['avg'] or 0,
            'average_features': feedback_qs.aggregate(
                avg=Avg('features')
            )['avg'] or 0,
            'average_customer_service': feedback_qs.aggregate(
                avg=Avg('customer_service')
            )['avg'] or 0,
            'feedback_by_type': dict(
                feedback_qs.values('feedback_type').annotate(
                    count=Count('id')
                ).values_list('feedback_type', 'count')
            ),
            'feedback_by_status': dict(
                feedback_qs.values('status').annotate(
                    count=Count('id')
                ).values_list('status', 'count')
            ),
            'recent_feedback_count': Feedback.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
        }
        
        serializer = FeedbackStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_feedback(self, request):
        """Get current user's feedback"""
        feedback = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(feedback, many=True)
        return Response(serializer.data)