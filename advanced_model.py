import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.linear_model import LogisticRegression


# ==========================================
# 1. LOAD CLEANED DATASET
# ==========================================

file_path = r"ml_model\data\cleaned_data.csv"

df = pd.read_csv(file_path)

X = df["text"].fillna("")
y = df["labels"]

print("Dataset:", df.shape)


# ==========================================
# 2. WORD + CHARACTER TF-IDF
# ==========================================

word_tfidf = TfidfVectorizer(
    analyzer="word",
    ngram_range=(1, 2),
    max_features=10000,
    stop_words="english",
    sublinear_tf=True
)

char_tfidf = TfidfVectorizer(
    analyzer="char",
    ngram_range=(3, 5),
    max_features=15000,
    sublinear_tf=True
)


# Combine both feature types
features = FeatureUnion([
    ("word", word_tfidf),
    ("char", char_tfidf)
])


# ==========================================
# 3. LOGISTIC REGRESSION
# ==========================================

model = Pipeline([
    ("features", features),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            C=1.0,
            random_state=42
        )
    )
])


# ==========================================
# 4. 5-FOLD CROSS VALIDATION
# ==========================================

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

scores = cross_val_score(
    model,
    X,
    y,
    cv=cv,
    scoring="accuracy"
)


# ==========================================
# 5. RESULTS
# ==========================================

print("\n==============================")
print("ADVANCED MODEL")
print("==============================")

for i, score in enumerate(scores, start=1):
    print(f"Fold {i}: {score * 100:.2f}%")

print("\nAverage Accuracy:")
print(f"{scores.mean() * 100:.2f}%")

print("\nStandard Deviation:")
print(f"{scores.std() * 100:.2f}%")

print("\nBaseline Accuracy:")
print("52.91%")

difference = (scores.mean() * 100) - 52.91

print("\nDifference from Baseline:")
print(f"{difference:+.2f} percentage points")