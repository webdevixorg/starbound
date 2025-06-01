from rest_framework import serializers
from django.contrib.auth.models import User, Group 
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Order, Notification, Profile, Update, Trip, Wishlist
from app.product.serializers import ProductSerializer
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'current_password', 'new_password', 'confirm_password', 'groups']


    def validate(self, data):
        user = self.instance

        # Check if current_password is provided
        current_password = data.get('current_password')
        if current_password:
            if not user.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        # Check if new_password and confirm_password are provided and match
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        if new_password or confirm_password:
            if new_password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "The two password fields didn't match."})

            # Validate the new password
            try:
                validate_password(new_password)
            except ValidationError as e:
                raise serializers.ValidationError({"new_password": e.messages})

        return data

    def update(self, instance, validated_data):
        # Update user attributes
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)

        # Update password if provided
        new_password = validated_data.get('new_password')
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user', 'image', 'bio', 'phone', 'address', 'city', 'region', 'postal_code', 'country', 'date_of_birth']

    def get_image(self, obj):
        request = self.context.get('request')
        media_url = settings.MEDIA_URL
        if request:
            # Build the absolute URI for the media URL
            absolute_media_url = request.build_absolute_uri(media_url)
            image_url = f"{absolute_media_url}profiles/profile_images/{obj.image}"
            return image_url
        return f"{media_url}profiles/profile_images/{obj.image}"

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        user.email = user_data.get('email', user.email)
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()

        instance.bio = validated_data.get('bio', instance.bio)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.city = validated_data.get('city', instance.city)
        instance.region = validated_data.get('region', instance.region)
        instance.postal_code = validated_data.get('postal_code', instance.postal_code)
        instance.country = validated_data.get('country', instance.country)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.image = validated_data.get('image', instance.image)
        instance.save()

        return instance


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Nest the ProductSerializer

    class Meta:
        model = Wishlist
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Update
        fields = '__all__'

