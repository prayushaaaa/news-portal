import pandas as pd
from datetime import datetime
from django.core.management.base import BaseCommand
from api.models import NewsArticle, WordSentimentTrend
from collections import defaultdict
from gensim import corpora
from gensim.models import LdaModel

class Command(BaseCommand):
    help = "Track words and their sentiment scores over time using LDA to find key words"

    def handle(self, *args, **kwargs):
        # Define a custom list of stop words to remove
        stop_words = set([
            "the", "of", "to", "in", "and", "is", "that", "a", "has", "was", "will", "be"
        ])

        # Fetch data
        articles = NewsArticle.objects.all().values(
            'id', 'translated_content', 'en_timestamp', 'sentiment_score'
        )

        # Create a DataFrame
        df = pd.DataFrame(articles)
        df['en_timestamp'] = pd.to_datetime(df['en_timestamp']).dt.date

        # Group articles by day
        grouped = df.groupby('en_timestamp')

        # Initialize a dictionary to hold sentiment data for each word over time
        word_sentiment_data = defaultdict(lambda: defaultdict(list))

        # Process each article and its words
        all_texts = []  # Will hold all the tokenized content for LDA

        for date, group in grouped:
            for _, row in group.iterrows():
                # Tokenize the content and filter out stop words
                words = [word for word in row['translated_content'].split() if word.lower() not in stop_words]
                sentiment_score = row['sentiment_score']
                
                # For each word in the article, store its sentiment score for the date
                for word in words:
                    word_sentiment_data[word][date].append(sentiment_score)

                # Add tokenized article to all_texts for LDA
                all_texts.append(words)

        # Create a dictionary and corpus for LDA
        dictionary = corpora.Dictionary(all_texts)
        corpus = [dictionary.doc2bow(text) for text in all_texts]

        # Apply LDA to the corpus
        lda_model = LdaModel(corpus, num_topics=5, id2word=dictionary, passes=15)

        # Extract top words for each topic
        lda_keywords = {}
        for topic_id in range(lda_model.num_topics):
            top_words = lda_model.show_topic(topic_id, topn=10)  # Get top 10 words for each topic
            lda_keywords[topic_id] = [word for word, _ in top_words]

        # Calculate average sentiment for each word and save trends
        count = 0
        for word, sentiment_dict in word_sentiment_data.items():
            for date, sentiment_scores in sentiment_dict.items():
                count += 1
                print(count)
                
                avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)

                # Save to WordSentimentTrend (or similar model)
                WordSentimentTrend.objects.update_or_create(
                    word=word,
                    time_period=date,
                    defaults={
                        "sentiment_average": avg_sentiment,
                        "articles_count": len(sentiment_scores),
                    }
                )

        # Print the top keywords for each topic
        print("Top keywords for each topic based on LDA:")
        for topic_id, words in lda_keywords.items():
            print(f"Topic {topic_id}: {', '.join(words)}")

        self.stdout.write(self.style.SUCCESS("Word sentiment trends and key words from LDA successfully computed!"))
