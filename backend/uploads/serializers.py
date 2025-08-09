from rest_framework import serializers
from .models import Image, UserImage

class ImageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Image
        fields = '__all__'

class UserImageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserImage
        fields = '__all__'