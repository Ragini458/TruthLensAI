import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


# Clean dataset
file_path = r"ml_model\data\cleaned_data.csv"

df = pd.read_csv(file_path)

X = df["text"].fillna("")
y = df["labels"]


print("Dataset:", df.shape)


# TF-IDF + Logistic Regression
pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            max_features=10000,
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            random_state=42
        )
    )
])


# 5-fold validation
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

scores = cross_val_score(
    pipeline,
    X,
    y,
    cv=cv,
    scoring="accuracy"
)


print("\n==============================")
print("5-FOLD CROSS VALIDATION")
print("==============================")

for i, score in enumerate(scores, start=1):
    print(f"Fold {i}: {score * 100:.2f}%")

print("\nAverage Accuracy:")
print(f"{scores.mean() * 100:.2f}%")

print("\nStandard Deviation:")
print(f"{scores.std() * 100:.2f}%")