from django.core.management.base import BaseCommand
from entities.models import Entity

class Command(BaseCommand):
    help = 'Load sample brands and models'

    def handle(self, *args, **options):
        # Create sample brands
        brands_data = [
            {'name': 'Toyota', 'type': 'brand'},
            {'name': 'Honda', 'type': 'brand'},
            {'name': 'Ford', 'type': 'brand'},
            {'name': 'BMW', 'type': 'brand'},
            {'name': 'Mercedes-Benz', 'type': 'brand'},
            {'name': 'Apple', 'type': 'brand'},
            {'name': 'Samsung', 'type': 'brand'},
            {'name': 'Sony', 'type': 'brand'},
            {'name': 'Nike', 'type': 'brand'},
            {'name': 'Adidas', 'type': 'brand'},
        ]

        brands = {}
        for brand_data in brands_data:
            brand, created = Entity.objects.get_or_create(
                name=brand_data['name'],
                type=brand_data['type'],
                defaults={'description': f'{brand_data["name"]} brand'}
            )
            brands[brand.name] = brand
            if created:
                self.stdout.write(f'Created brand: {brand.name}')

        # Create sample models for each brand
        models_data = {
            'Toyota': ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander'],
            'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
            'Ford': ['F-150', 'Mustang', 'Explorer', 'Focus', 'Escape'],
            'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'i4'],
            'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
            'Apple': ['iPhone 15', 'iPhone 14', 'iPad Pro', 'MacBook Air', 'MacBook Pro'],
            'Samsung': ['Galaxy S24', 'Galaxy Note', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds'],
            'Sony': ['PlayStation 5', 'WH-1000XM5', 'Alpha A7', 'Bravia TV', 'WF-1000XM4'],
            'Nike': ['Air Max', 'Air Force 1', 'React', 'Dunk', 'Blazer'],
            'Adidas': ['Ultraboost', 'Stan Smith', 'Superstar', 'NMD', 'Gazelle'],
        }

        for brand_name, model_names in models_data.items():
            brand = brands.get(brand_name)
            if brand:
                for model_name in model_names:
                    model, created = Entity.objects.get_or_create(
                        name=model_name,
                        type='model',
                        parent=brand,
                        defaults={'description': f'{brand_name} {model_name}'}
                    )
                    if created:
                        self.stdout.write(f'Created model: {brand_name} {model_name}')

        self.stdout.write(self.style.SUCCESS('Successfully loaded sample entities'))