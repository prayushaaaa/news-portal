import csv
from django.core.management.base import BaseCommand
from api.models import NewsArticle
from datetime import datetime
from django.utils import timezone

class Command(BaseCommand):
    help = 'Load news articles from a CSV file into the NewsArticle model'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the CSV file')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']

        # Clear the table before loading new data
        NewsArticle.objects.all().delete()

        with open(file_path, 'r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            articles_loaded = 0

            for row in reader:
                try:
                    # Parse and convert fields as needed
                    source = row['source']
                    category = row['category']
                    link = row['link']
                    nep_timestamp = row['nep_timestamp']  # Stored as a string

                    # Parse `en_timestamp` and make it timezone-aware
                    en_timestamp_str = row['en_timestamp'].strip() if row['en_timestamp'] else None
                    if en_timestamp_str:
                        en_timestamp = datetime.strptime(en_timestamp_str, '%d-%m-%Y %H:%M')
                        en_timestamp = timezone.make_aware(en_timestamp)  # Make timezone-aware
                    else:
                        en_timestamp = None

                    original_title = row['original_title']
                    translated_title = row['translated_title']
                    original_content = row['original_content']
                    translated_content = row['translated_content']
                    image_source = row['image_source']
                    sentiment_score = row['sentiment_score']

                    # Save article to the database
                    NewsArticle.objects.create(
                        source=source,
                        category=category,
                        link=link,
                        nep_timestamp=nep_timestamp,
                        en_timestamp=en_timestamp,
                        original_title=original_title,
                        translated_title=translated_title,
                        original_content=original_content,
                        translated_content=translated_content,
                        image_source=image_source,
                        sentiment_score=sentiment_score
                    )
                    articles_loaded += 1

                except ValueError as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row: {row['link']} - {e}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Unexpected error for row: {row['link']} - {e}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully loaded {articles_loaded} articles from {file_path}"))
