from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add the user's role to the token payload
        user = self.user
        role = user.groups.values_list('name', flat=True).first() or "Customer"
        data['role'] = role

        return data
