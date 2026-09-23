import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC


# ==========================================
# 1. LOAD CLEANED DATASET
# ==========================================

file_path = r"ml_model\data\cleaned_data.csv"

df = pd.read_csv(file_path)

X = df["text"].fillna("")
y = df["labels"]

print("Dataset:", df.shape)


# ==========================================
# 2. TF-IDF + LINEAR SVM
# ==========================================

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
        LinearSVC(
            C=1.0,
            random_state=42
        )
    )
])


# ==========================================
# 3. 5-FOLD CROSS VALIDATION
# ==========================================

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


# ==========================================
# 4. RESULTS
# ==========================================

print("\n==============================")
print("LINEAR SVM MODEL")
print("==============================")

for i, score in enumerate(scores, start=1):
    print(f"Fold {i}: {score * 100:.2f}%")

print("\nAverage Accuracy:")
print(f"{scores.mean() * 100:.2f}%")

print("\nStandard Deviation:")
print(f"{scores.std() * 100:.2f}%")

print("\nCurrent Baseline:")
print("52.91%")

difference = (scores.mean() * 100) - 52.91

print("\nDifference from Baseline:")
print(f"{difference:+.2f} percentage points")