import re
import pandas as pd
from datetime import datetime
from django.core.management.base import BaseCommand
from api.models import NewsArticle, WordSentimentTrend
from collections import defaultdict
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from nltk.corpus import stopwords
from nltk import pos_tag, word_tokenize
import nltk
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')


class Command(BaseCommand):
    WordSentimentTrend.objects.all().delete()
    help = "Track words and their sentiment scores over time using Scikit-learn LDA to find key words."

    def handle(self, *args, **kwargs):
        # Define custom stop words
        stop_words = set(stopwords.words('english')).union({
            "the", "of", "to", "in", "and", "is", "that", "a", "has", "was", "will", "be","per"
        })

        def clean_text(text):
            """
            Cleans input text by removing:
            - HTML tags, punctuations, special characters, numbers
            - Stopwords and verbs
            """
            # Remove HTML tags
            text = re.sub(r"<.*?>", " ", text)
            # Remove special characters, punctuations, and numbers
            text = re.sub(r"[^a-zA-Z\s]", " ", text)
            # Tokenize words
            tokens = word_tokenize(text.lower())

            # Remove stopwords
            filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
            # Remove verbs (POS tagging: keep only nouns, adjectives, etc.)
            filtered_tokens = [
                word for word, tag in pos_tag(filtered_tokens)
                if tag not in ("VB", "VBD", "VBG", "VBN", "VBP", "VBZ")  # Verb tags
            ]
            # Remove extra whitespace
            return " ".join(filtered_tokens).strip()

        # Fetch data from NewsArticle
        articles = NewsArticle.objects.all().values(
            'id', 'translated_title', 'en_timestamp', 'sentiment_score'
        )

        # Create a DataFrame
        df = pd.DataFrame(articles)
        df['en_timestamp'] = pd.to_datetime(df['en_timestamp']).dt.date

        # Group articles by date
        grouped = df.groupby('en_timestamp')

        # Dictionary to hold word sentiment data
        word_sentiment_data = defaultdict(lambda: defaultdict(list))

        # List to hold cleaned text for LDA
        all_texts = []

        for date, group in grouped:
            for _, row in group.iterrows():
                # Clean the article title
                cleaned_text = clean_text(row['translated_title'])
                words = cleaned_text.split()
                sentiment_score = row['sentiment_score']
                article_id = row['id']

                # Record sentiment for each word by date
                for word in words:
                    word_sentiment_data[word][date].append((sentiment_score, article_id))

                # Add cleaned title to all_texts for LDA
                all_texts.append(cleaned_text)

        # Vectorize text for LDA
        vectorizer = CountVectorizer()
        dtm = vectorizer.fit_transform(all_texts)

        # Apply LDA
        lda_model = LatentDirichletAllocation(n_components=5, max_iter=15, random_state=42)
        lda_model.fit(dtm)

        # Extract top words for each topic
        feature_names = vectorizer.get_feature_names_out()
        lda_keywords = {}
        for topic_idx, topic in enumerate(lda_model.components_):
            top_word_indices = topic.argsort()[-10:][::-1]  # Top 10 words per topic
            lda_keywords[topic_idx] = [feature_names[i] for i in top_word_indices]

        # Save word sentiment trends
        for word, sentiment_dict in word_sentiment_data.items():
            for date, sentiment_scores in sentiment_dict.items():
                for sentiment_score, article_id in sentiment_scores:
                    WordSentimentTrend.objects.create(
                        word=word,
                        date=date,
                        sentiment_score=sentiment_score,
                        news_article_id=article_id
                    )

        # Display LDA topics
        self.stdout.write("Top keywords for each topic:")
        for topic_id, words in lda_keywords.items():
            self.stdout.write(f"Topic {topic_id}: {', '.join(words)}")

        self.stdout.write(self.style.SUCCESS(
            "Word sentiment trends and LDA keywords successfully computed!"
        ))
