import pandas as pd
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.pipeline import Pipeline

# Download necessary NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Preprocessing function with enhancements
def clean_text(text):
    text = re.sub(r'<.*?>', ' ', text)  # Remove HTML tags
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # Keep only alphabetic characters
    text = text.lower()  # Convert to lowercase
    
    # Apply lemmatization and remove stopwords
    text = ' '.join(lemmatizer.lemmatize(word) for word in text.split() if word not in stop_words)
    return text

# Train SVM model with hyperparameter tuning
def train_svm_model(data_path):
    # Load data from CSV
    data = pd.read_csv(data_path)
    
    # Preprocess the translated_content column
    data['cleaned_content'] = data['translated_content'].apply(clean_text)
    
    # Define features and labels
    x = data['cleaned_content']
    y = data['sentiment_score']  # Ensure your CSV has a 'sentiment_score' column with numeric labels
    
    # Build a pipeline for TF-IDF and SVM with grid search for parameter tuning
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=15000, min_df=5)),
        ('svm', SVC(kernel='linear'))
    ])
    
    # Define parameter grid for GridSearchCV
    param_grid = {
        'tfidf__max_features': [10000, 15000, 20000],
        'tfidf__ngram_range': [(1,1), (1,2)],
        'svm__C': [0.1, 1, 10],
        'svm__kernel': ['linear', 'rbf']  # Try both linear and RBF kernels
    }
    
    # Initialize GridSearchCV
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1)
    grid_search.fit(x, y)
    
    # Best model from grid search
    best_model = grid_search.best_estimator_
    
    # Save the best model
    with open('svm_sentiment_model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    
    print("Best model and vectorizer saved successfully!")
    print("Best parameters found:", grid_search.best_params_)

    # Split data for evaluation
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    y_pred = best_model.predict(x_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
    print(f"Classification Report: \n{classification_report(y_test, y_pred)}")
    # print(classification_report(y_test, y_pred))
    print(confusion_matrix(y_test, y_pred))

# Predict sentiment for a given text using the saved model
def predict_sentiment(text):
    cleaned_text = clean_text(text)
    
    # Load the saved model pipeline
    with open('svm_sentiment_model.pkl', 'rb') as f:
        model = pickle.load(f)
        
    # Predict sentiment
    prediction = model.predict([cleaned_text])
    return prediction[0]

if __name__ == "__main__":
    print(predict_sentiment("The price of gold decreased by Rs 300 per tola."))
