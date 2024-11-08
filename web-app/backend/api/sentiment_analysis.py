import pandas as pd
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # Keep only alphabetic characters
    text = text.lower()  # Convert to lowercase
    
    #applying stemming
    text = ' '.join(stemmer.stem(word) for word in text.split() if word not in stop_words)
    
    return text

def train_svm_model(data_path):
    #load data from CSV
    data = pd.read_csv("data_path.csv") # --needs work
    
    # preprocess the translated content column
    data['cleaned_content'] = data['translated_content'].apply(clean_text)
    
    # define features and labels
    x = data['cleaned_content']
    y = data['sentiment_score'] # -- needs work
    
    #vectorizing the conten using TF-IDF (Bigrams)
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(2,2)) #indicates bigram
    x_tfidf = vectorizer.fit_transform(x).toarray()
    
    #split data into training and testing sets
    x_train, x_test, y_train, y_test = train_test_split(x_tfidf, y, test_size=0.2, random_state=42)
    
    svm_model = SVC(kernel='linear', C=1)
    svm_model.fit(x_train, y_train)
    
    y_pred = svm_model.predict(x_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
    print(f"Classification Report: \n{classification_report(y_test, y_pred)}")
    
    with open('svm_sentiment_model.pkl', 'wb') as f:
        pickle.dump(svm_model, f)
        
    with open('tfidf_vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
        
    print("Model and vectorizer saved successfully!")

def predict_sentiment(text):
    cleaned_text = clean_text(text)
    
    with open('svm_sentiment_model.pkl','rb') as f:
        svm_model = pickle.load(f)
        
    with open('tfidf_vectorizer.pkl', 'wb') as f:
        vectorizer = pickle.load(f)
    
    text_tfidf = vectorizer.transform([cleaned_text]).toarray()
    
    prediction = svm_model.predict(text_tfidf)
    
    return prediction[0]

if __name__ == "__main__":
    train_svm_model('path to csv.csv')
    