from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import ContactSupport, HelpCategory, HelpArticle, Feedback


class ContactSupportTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_support_ticket(self):
        """Test creating a new support ticket"""
        url = reverse('contactsupport-list')
        data = {
            'subject': 'Test Issue',
            'message': 'This is a test support ticket',
            'category': 'technical',
            'priority': 'medium',
            'contact_email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContactSupport.objects.filter(subject='Test Issue').exists())

    def test_list_user_tickets(self):
        """Test listing user's support tickets"""
        ContactSupport.objects.create(
            user=self.user,
            subject='Test Ticket',
            message='Test message',
            category='general'
        )
        url = reverse('contactsupport-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class HelpArticleTestCase(APITestCase):
    def setUp(self):
        self.category = HelpCategory.objects.create(
            name='Getting Started',
            description='Basic help articles'
        )
        self.article = HelpArticle.objects.create(
            title='How to Get Started',
            slug='how-to-get-started',
            content='This is how you get started...',
            category=self.category,
            is_published=True
        )

    def test_list_published_articles(self):
        """Test listing published help articles"""
        url = reverse('helparticle-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_article_detail_view(self):
        """Test viewing article detail and incrementing view count"""
        url = reverse('helparticle-detail', kwargs={'pk': self.article.pk})
        initial_views = self.article.view_count
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.article.refresh_from_db()
        self.assertEqual(self.article.view_count, initial_views + 1)


class FeedbackTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_feedback(self):
        """Test creating user feedback"""
        url = reverse('feedback-list')
        data = {
            'feedback_type': 'suggestion',
            'subject': 'Feature Request',
            'message': 'It would be great to have...',
            'overall_rating': 4,
            'contact_email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Feedback.objects.filter(subject='Feature Request').exists())

    def test_feedback_stats(self):
        """Test feedback statistics endpoint"""
        Feedback.objects.create(
            user=self.user,
            feedback_type='suggestion',
            subject='Test Feedback',
            message='Test message',
            overall_rating=5
        )
        url = reverse('feedback-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_feedback', response.data)
        self.assertIn('average_rating', response.data)


class ModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_contact_support_ticket_id_generation(self):
        """Test that support tickets generate unique ticket IDs"""
        ticket = ContactSupport.objects.create(
            user=self.user,
            subject='Test Ticket',
            message='Test message',
            category='general'
        )
        self.assertTrue(ticket.ticket_id.startswith('SUP-'))
        self.assertEqual(len(ticket.ticket_id), 15)  # SUP- + 11 digits

    def test_help_article_slug_generation(self):
        """Test that help articles generate proper slugs"""
        category = HelpCategory.objects.create(
            name='Test Category',
            description='Test description'
        )
        article = HelpArticle.objects.create(
            title='How to Use the System',
            content='This is the content...',
            category=category
        )
        self.assertEqual(article.slug, 'how-to-use-the-system')

    def test_feedback_model_defaults(self):
        """Test feedback model default values"""
        feedback = Feedback.objects.create(
            user=self.user,
            feedback_type='bug_report',
            subject='Bug Report',
            message='Found a bug...'
        )
        self.assertEqual(feedback.status, 'open')
        self.assertTrue(feedback.allow_contact)
        self.assertIsNotNone(feedback.created_at)