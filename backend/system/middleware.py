"""
Rate limiting and throttling middleware for Django
"""
import time
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser

class RateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting middleware that uses Redis/cache to track request counts
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        # Skip rate limiting for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return None
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Different limits for authenticated vs anonymous users
        if isinstance(request.user, AnonymousUser):
            rate_limit = getattr(settings, 'ANONYMOUS_RATE_LIMIT', 100)  # 100 per hour
            window = getattr(settings, 'ANONYMOUS_RATE_WINDOW', 3600)    # 1 hour
        else:
            rate_limit = getattr(settings, 'AUTHENTICATED_RATE_LIMIT', 1000)  # 1000 per hour
            window = getattr(settings, 'AUTHENTICATED_RATE_WINDOW', 3600)     # 1 hour
        
        # Create cache key
        cache_key = f"rate_limit:{client_ip}:{request.user.id if request.user.is_authenticated else 'anonymous'}"
        
        # Get current request count
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= rate_limit:
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Limit: {rate_limit} per hour.',
                'retry_after': window
            }, status=429)
        
        # Increment counter
        cache.set(cache_key, current_requests + 1, window)
        
        return None
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Add security headers to all responses
    """
    
    def process_response(self, request, response):
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Only add HSTS in production
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        return response