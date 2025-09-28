from django.core.management.base import BaseCommand
from app.posts.models import Post
from categories.models import Category


class Command(BaseCommand):
    help = 'Add categories to posts 1037 and 1038'

    def handle(self, *args, **options):
        try:
            # Get the posts
            post_1037 = Post.objects.get(id=1037)
            post_1038 = Post.objects.get(id=1038)
            
            # Get the categories
            category_89 = Category.objects.get(id=89)  # How-To Guides
            category_90 = Category.objects.get(id=90)  # News & Updates
            
            # Add categories to posts
            post_1037.categories.add(category_90)  # Add "News & Updates" to post 1037
            post_1038.categories.add(category_89)  # Add "How-To Guides" to post 1038
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully added categories:')
            )
            self.stdout.write(f"Post 1037 '{post_1037.title}' -> Category '{category_90.name}'")
            self.stdout.write(f"Post 1038 '{post_1038.title}' -> Category '{category_89.name}'")
            
            # Verify the assignments
            self.stdout.write('\nVerification:')
            self.stdout.write(f"Post 1037 categories: {[cat.name for cat in post_1037.categories.all()]}")
            self.stdout.write(f"Post 1038 categories: {[cat.name for cat in post_1038.categories.all()]}")
            
        except Post.DoesNotExist as e:
            self.stdout.write(
                self.style.ERROR(f'Post not found: {e}')
            )
        except Category.DoesNotExist as e:
            self.stdout.write(
                self.style.ERROR(f'Category not found: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {e}')
            )