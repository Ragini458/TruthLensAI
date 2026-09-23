import pandas as pd

file_path = r"ml_model\data\FA-KES-Dataset.csv"

df = pd.read_csv(file_path, encoding="latin1")

print("Dataset shape:", df.shape)

print("\nLabel counts:")
print(df["labels"].value_counts())

print("\nLabel 0 examples:")
print(df[df["labels"] == 0][["article_title", "source", "labels"]].head(10).to_string(index=False))

print("\nLabel 1 examples:")
print(df[df["labels"] == 1][["article_title", "source", "labels"]].head(10).to_string(index=False))

print("\nSources:")
print(df["source"].value_counts())

print("\nLocations:")
print(df["location"].value_counts().head(10))