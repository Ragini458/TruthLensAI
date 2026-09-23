import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report


# =========================
# 1. Load dataset
# =========================

data_path = r"ml_model\data\cleaned_data.csv"

df = pd.read_csv(data_path)

print("Dataset loaded!")
print("Dataset shape:", df.shape)


# =========================
# 2. Prepare data
# =========================

X = df["text"].fillna("")
y = df["labels"]


# =========================
# 3. Train/Test split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# =========================
# 4. TF-IDF
# =========================

vectorizer = TfidfVectorizer(
    max_features=10000,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print("\nTF-IDF conversion complete!")
print("Training matrix:", X_train_tfidf.shape)


# =========================
# 5. Linear SVM
# =========================

model = LinearSVC(
    C=1.0,
    random_state=42
)

model.fit(X_train_tfidf, y_train)

print("\nLinear SVM training complete!")


# =========================
# 6. Evaluate
# =========================

y_pred = model.predict(X_test_tfidf)

accuracy = accuracy_score(y_test, y_pred)

print("\n==============================")
print("MODEL ACCURACY")
print("==============================")
print(f"{accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# =========================
# 7. Save model
# =========================

model_path = r"ml_model\fake_news_model.pkl"
vectorizer_path = r"ml_model\tfidf_vectorizer.pkl"

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print("\n==============================")
print("MODEL SAVED SUCCESSFULLY!")
print("==============================")
print("Model:", model_path)
print("Vectorizer:", vectorizer_path)