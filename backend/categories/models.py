from django.db import models

class Category(models.Model):
    # Name of the category (e.g., "Electronics", "Shoes")
    name = models.CharField(max_length=100, unique=True)

    # URL-friendly version of the name, used in links (e.g., "smartphones" instead of "Smart Phones")
    slug = models.SlugField(max_length=200, unique=True)

    # Optional longer description for the category
    description = models.TextField(default='')

    # Self-referential foreign key to support subcategories (e.g., "Smartphones" under "Electronics")
    parent = models.ForeignKey(
        'self',                      # Reference to the same model
        null=True,                  # Top-level categories can have no parent
        blank=True,                 # Form field can be left empty
        on_delete=models.CASCADE,  # If a parent category is deleted, delete its children
        related_name='children'    # Access children via category.children.all()
    )

    # Optional field to link this category to a specific content type or model logic (custom usage)
    content_type_id = models.IntegerField(default=0)

    def __str__(self):
        # Human-readable representation of the object
        return self.name

    class Meta:
        # Explicit table name in the database
        db_table = 'app_category'
