from django.db import models

class Order(models.Model):
    # Primary key field, auto-incrementing integer (default Django behavior)
    id = models.AutoField(primary_key=True)
    
    # Stores billing information as JSON (e.g., name, address, contact)
    billing_data = models.JSONField()
    
    # Stores shipping information as JSON; can be empty if shipping address is same as billing
    shipping_data = models.JSONField(null=True, blank=True)
    
    # Stores order items data as JSON (e.g., list of product IDs and quantities)
    order_data = models.JSONField()
    
    # Payment method selected by the user (e.g., 'Credit Card', 'PayPal')
    selected_payment_method = models.CharField(max_length=100)
    
    # Optional coupon code applied to the order
    coupon_code = models.CharField(max_length=100, null=True, blank=True)
    
    # Flag to indicate if shipping address is different from billing address
    ship_to_different_address = models.BooleanField(default=False)
    
    # Timestamp when the order was created; set automatically on record creation
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Explicit database table name for this model
        db_table = 'app_orders'
