from rest_framework.response import Response
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404

from .models import Order, Notification, Profile, Update, Wishlist
from visits.models import Visit

from app.product.models import Product
from .serializers import NotificationSerializer, ProfileSerializer, UpdateSerializer, UserSerializer, WishlistSerializer, OrderSerializer
from visits.serializers import VisitSerializer

import logging

logger = logging.getLogger(__name__)

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to unauthenticated users
    and full access to authenticated users (but only to their own profile).
    """
    def has_permission(self, request, view):
        # Allow read access to everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require authentication
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        return obj.user == request.user

class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'pk'

    def get_object(self):
        """
        Get profile by user ID (for public viewing) or create for authenticated user
        """
        try:
            # Check if we have a pk in the URL (public profile viewing)
            user_id = self.kwargs.get('pk')
            
            if user_id:
                # Public profile viewing by user ID
                logger.info(f"Attempting to retrieve profile for user ID: {user_id}")
                try:
                    user = User.objects.get(pk=user_id)
                    logger.info(f"Found user: {user.username} (ID: {user.pk})")
                    
                    profile, created = Profile.objects.get_or_create(user=user)
                    if created:
                        logger.info(f"Created new profile for user {user.pk}")
                    else:
                        logger.info(f"Retrieved existing profile for user {user.pk}")
                    
                    return profile
                    
                except User.DoesNotExist:
                    logger.error(f"User with ID {user_id} not found")
                    from rest_framework.exceptions import NotFound
                    raise NotFound(f"User with ID {user_id} not found")
            else:
                # Authenticated user accessing their own profile
                if not self.request.user.is_authenticated:
                    logger.error("Unauthenticated user trying to access own profile")
                    from rest_framework.exceptions import NotAuthenticated
                    raise NotAuthenticated("Authentication required to access your own profile")
                
                profile, created = Profile.objects.get_or_create(user=self.request.user)
                if created:
                    logger.info(f"Created new profile for authenticated user {self.request.user.id}")
                else:
                    logger.info(f"Retrieved existing profile for authenticated user {self.request.user.id}")
                
                return profile
                
        except Exception as e:
            logger.error(f"Error in get_object: {str(e)}", exc_info=True)
            raise

    def get(self, request, *args, **kwargs):
        """
        Retrieve user profile - PUBLIC ACCESS
        """
        try:
            logger.info(f"GET request for profile. User: {request.user}, kwargs: {kwargs}")
            
            profile = self.get_object()
            logger.info(f"Successfully retrieved profile for user: {profile.user.username}")
            
            serializer = self.get_serializer(profile)
            logger.info(f"Profile serialized successfully")
            
            # Add metadata about ownership
            response_data = serializer.data
            response_data['is_own_profile'] = (
                request.user.is_authenticated and 
                profile.user == request.user
            )
            response_data['can_edit'] = (
                request.user.is_authenticated and 
                profile.user == request.user
            )
            
            logger.info(f"Returning profile data with metadata")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error in ProfileDetail.get: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to retrieve profile: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, *args, **kwargs):
        """
        Update user profile - AUTHENTICATED USERS ONLY (own profile)
        """
        try:
            logger.info(f"PATCH request for profile. User: {request.user}")
            
            profile = self.get_object()
            
            # Check ownership (redundant with permission class but good to be explicit)
            if profile.user != request.user:
                logger.warning(f"User {request.user.id} trying to update profile of user {profile.user.id}")
                return Response(
                    {'error': 'You can only update your own profile'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Handle JSON data (with image URL from Supabase)
            if request.content_type == 'application/json':
                data = request.data
                logger.info(f"Updating profile for user {request.user.id} with JSON data: {data}")
                
                # Update user fields if provided
                if 'user' in data:
                    user_data = data['user']
                    user_updated = False
                    
                    if 'first_name' in user_data and user_data['first_name'] != request.user.first_name:
                        request.user.first_name = user_data['first_name']
                        user_updated = True
                    
                    if 'last_name' in user_data and user_data['last_name'] != request.user.last_name:
                        request.user.last_name = user_data['last_name']
                        user_updated = True
                    
                    if user_updated:
                        request.user.save()
                        logger.info(f"Updated user fields for user {request.user.id}")

                # Update profile fields
                profile_fields = ['bio', 'phone', 'address', 'city', 'region', 'postal_code', 'country', 'date_of_birth', 'image_id']

                updated_fields = []
                for field in profile_fields:
                    if field in data:
                        old_value = getattr(profile, field, None)
                        new_value = data[field]
                        
                        # Handle empty strings for optional fields
                        if new_value == '':
                            new_value = None
                        
                        # Handle date conversion
                        if field == 'date_of_birth' and new_value:
                            try:
                                from datetime import datetime
                                if isinstance(new_value, str):
                                    new_value = datetime.strptime(new_value, '%Y-%m-%d').date()
                            except (ValueError, TypeError) as date_error:
                                logger.error(f"Date conversion error: {date_error}")
                                return Response(
                                    {'error': f'Invalid date format for {field}. Use YYYY-MM-DD format.'}, 
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                        
                        if old_value != new_value:
                            setattr(profile, field, new_value)
                            updated_fields.append(field)
                
                if updated_fields:
                    profile.save()
                    logger.info(f"Updated profile fields for user {request.user.id}: {updated_fields}")
                
                serializer = self.get_serializer(profile)
                return Response({
                    'message': 'Profile updated successfully',
                    'data': serializer.data,
                    'updated_fields': updated_fields
                })

            # Handle FormData (legacy support)
            else:
                logger.info(f"Updating profile for user {request.user.id} with FormData")
                serializer = self.get_serializer(profile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    logger.info(f"Updated profile via FormData for user {request.user.id}")
                    return Response({
                        'message': 'Profile updated successfully',
                        'data': serializer.data
                    })
                else:
                    logger.error(f"Serializer validation errors: {serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating profile for user {request.user.id}: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to update profile: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, *args, **kwargs):
        """
        Full update - redirect to patch for consistency
        """
        return self.patch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Delete/Clear profile - AUTHENTICATED USERS ONLY (own profile)
        """
        try:
            logger.info(f"DELETE request for profile. User: {request.user}")
            
            profile = self.get_object()
            
            # Check ownership
            if profile.user != request.user:
                logger.warning(f"User {request.user.id} trying to delete profile of user {profile.user.id}")
                return Response(
                    {'error': 'You can only delete your own profile'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Clear profile data instead of deleting the record
            profile.bio = ''
            profile.image = None
            profile.phone = ''
            profile.address = ''
            profile.city = ''
            profile.region = ''
            profile.postal_code = ''
            profile.country = ''
            profile.date_of_birth = None
            profile.save()
            
            logger.info(f"Cleared profile data for user {request.user.id}")
            
            return Response(
                {'message': 'Profile data cleared successfully'}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f"Error clearing profile for user {request.user.id}: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to clear profile data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AccountSettingsView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        """
        Update user account settings
        """
        try:
            user = self.get_object()
            serializer = self.get_serializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Updated account settings for user {user.id}")
                return Response({
                    'message': 'Account settings updated successfully',
                    'data': serializer.data
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating account settings: {e}")
            return Response(
                {'error': 'Failed to update account settings'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StarBoundTokenObtainPairView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)

class HistoryView(generics.ListAPIView):
    serializer_class = VisitSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Visit.objects.filter(
            user=self.request.user,
            date__lt=timezone.now()
        ).order_by('-date')

class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-timestamp')

    def post(self, request, *args, **kwargs):
        """
        Add product to wishlist
        """
        try:
            user = request.user
            product_id = request.data.get('product_id')

            if not product_id:
                return Response(
                    {'error': 'Product ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': 'Product not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if product is already in wishlist
            wishlist_item, created = Wishlist.objects.get_or_create(
                user=user, 
                product=product
            )

            if created:
                logger.info(f"User {user.id} added product {product_id} to wishlist")
                return Response(
                    {'message': 'Product added to wishlist'}, 
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {'message': 'Product is already in the wishlist'}, 
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            logger.error(f"Error adding to wishlist: {e}")
            return Response(
                {'error': 'Failed to add product to wishlist'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WishlistSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

class OrderView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-start_date')

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
class NotificationView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    pagination_class = PageNumberPagination
    pagination_class.page_size = 8
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-timestamp')

    def put(self, request, *args, **kwargs):
        """
        Mark notification as read
        """
        notification_id = kwargs.get('pk')
        try:
            notification = Notification.objects.get(
                id=notification_id, 
                user=request.user
            )
            notification.is_read = True
            notification.save()
            
            serializer = self.get_serializer(notification)
            return Response(serializer.data)
            
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating notification: {e}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
class UpdateListView(generics.ListCreateAPIView):
    serializer_class = UpdateSerializer
    pagination_class = PageNumberPagination
    pagination_class.page_size = 8
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Update.objects.filter(user=self.request.user).order_by('-timestamp')

    def put(self, request, *args, **kwargs):
        """
        Mark update as read
        """
        update_id = kwargs.get('pk')
        try:
            update = Update.objects.get(id=update_id, user=request.user)
            update.is_read = True
            update.save()
            
            serializer = self.get_serializer(update)
            return Response(serializer.data)
            
        except Update.DoesNotExist:
            return Response(
                {"error": "Update not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating update: {e}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UpdateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UpdateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Update.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Update an update record
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating update record: {e}")
            return Response(
                {'error': 'Failed to update record'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete an update record
        """
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Error deleting update record: {e}")
            return Response(
                {'error': 'Failed to delete record'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )