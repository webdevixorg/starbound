from django.core.management.base import BaseCommand
from app.posts.models import Post
from categories.models import Category

class Command(BaseCommand):
    help = 'Add categories to featured posts'

    def handle(self, *args, **options):
        try:
            # Get the posts
            post_1017 = Post.objects.get(id=1017)
            post_1016 = Post.objects.get(id=1016)
            
            # Get categories (assuming we have some available)
            # Let's try to get "How-To Guides" and "News & Updates" that we used before
            howto_category = Category.objects.filter(name__icontains="How-To").first()
            news_category = Category.objects.filter(name__icontains="News").first()
            
            if howto_category:
                post_1017.categories.add(howto_category)
                self.stdout.write(f'Added category "{howto_category.name}" to post 1017')
            
            if news_category:
                post_1016.categories.add(news_category)
                self.stdout.write(f'Added category "{news_category.name}" to post 1016')
                
            # If we don't have these categories, let's see what's available
            if not howto_category or not news_category:
                self.stdout.write('Available categories:')
                for cat in Category.objects.all()[:10]:
                    self.stdout.write(f'- ID: {cat.id}, Name: "{cat.name}"')
                    
            self.stdout.write(self.style.SUCCESS('Successfully processed featured posts'))
            
        except Post.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'Post not found: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))