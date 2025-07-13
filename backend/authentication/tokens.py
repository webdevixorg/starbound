from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Custom serializer to extend the default JWT token response
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        # Call the base class's validate method to get the default token data
        data = super().validate(attrs)

        # Add custom fields to the response (not the token itself)
        user = self.user

        # Get the first group name (role) the user belongs to, default to "Customer" if none
        role = user.groups.values_list('name', flat=True).first() or "Customer"

        # Add the role to the response data
        data['role'] = role

        return data
