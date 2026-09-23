import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# ==========================================
# LOAD CLEANED DATA
# ==========================================

file_path = r"ml_model\data\cleaned_data.csv"

df = pd.read_csv(file_path)

X = df["text"].fillna("")
y = df["labels"]

print("Dataset:", df.shape)


# ==========================================
# TF-IDF
# ==========================================

vectorizer = TfidfVectorizer(
    max_features=10000,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True
)

X_tfidf = vectorizer.fit_transform(X)


# ==========================================
# LOGISTIC REGRESSION
# ==========================================

model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

model.fit(X_tfidf, y)


# ==========================================
# SAVE MODEL
# ==========================================

model_path = r"ml_model\fake_news_model.pkl"
vectorizer_path = r"ml_model\tfidf_vectorizer.pkl"

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)


print("\n==============================")
print("FINAL MODEL TRAINED")
print("==============================")

print("Model saved:")
print(model_path)

print("\nVectorizer saved:")
print(vectorizer_path)

print("\nLabel mapping:")
print("0 = FAKE")
print("1 = CREDIBLE")

print("\nTraining completed successfully!")