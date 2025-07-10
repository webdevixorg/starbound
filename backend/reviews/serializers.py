from rest_framework import serializers
from .models import Review
from app.product.models import Product  
from profiles.models import Profile

class ReviewSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    Name = serializers.SerializerMethodField()
    Email = serializers.SerializerMethodField()
    ProfileImage = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'rating', 'comment', 'created_at', 'approved',
            'product', 'product_id', 'Name', 'Email', 'ProfileImage'
        ]

    def get_product(self, obj):
        if obj.product:
            return {
                "id": obj.product.id,
                "title": obj.product.title
            }
        return None

    def get_Name(self, obj):
        user = obj.user
        if user:
            full_name = f"{user.first_name} {user.last_name}".strip()
            return full_name if full_name else user.username
        return None

    def get_Email(self, obj):
        return obj.user.email if obj.user else None

    def get_ProfileImage(self, obj):
        user = obj.user
        if not user:
            return None

        try:
            profile = user.profile  # assuming OneToOneField on Profile model: user = models.OneToOneField(User)
            image_url = profile.image.url if profile.image and hasattr(profile.image, 'url') else None
            request = self.context.get('request')
            return request.build_absolute_uri(image_url) if image_url and request else image_url
        except Profile.DoesNotExist:
            return None
