import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score


# Load dataset
file_path = r"ml_model\data\FA-KES-Dataset.csv"

df = pd.read_csv(file_path, encoding="latin1")

df["article_title"] = df["article_title"].fillna("")
df["article_content"] = df["article_content"].fillna("")

y = df["labels"]


# Different text inputs
datasets = {
    "Title Only": df["article_title"],
    "Content Only": df["article_content"],
    "Title + Content": (
        df["article_title"] + " " + df["article_content"]
    )
}


for name, X in datasets.items():

    print("\n==============================")
    print(name)
    print("==============================")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    model = Pipeline([
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

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print(f"Accuracy: {accuracy * 100:.2f}%")