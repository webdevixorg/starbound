# orders/models.py
from django.db import models

class Order(models.Model):
    id = models.AutoField(primary_key=True)
    billing_data = models.JSONField()
    shipping_data = models.JSONField(null=True, blank=True)
    order_data = models.JSONField()
    selected_payment_method = models.CharField(max_length=100)
    coupon_code = models.CharField(max_length=100, null=True, blank=True)
    ship_to_different_address = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_orders'