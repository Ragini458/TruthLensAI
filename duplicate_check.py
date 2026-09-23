import pandas as pd

file_path = r"ml_model\data\FA-KES-Dataset.csv"

df = pd.read_csv(file_path, encoding="latin1")

df["article_title"] = df["article_title"].fillna("").str.strip()
df["article_content"] = df["article_content"].fillna("").str.strip()

print("Total articles:", len(df))

# Exact duplicate titles
duplicate_titles = df[df.duplicated(
    subset=["article_title"],
    keep=False
)]

print("\nDuplicate titles:", len(duplicate_titles))

# Exact duplicate contents
duplicate_contents = df[df.duplicated(
    subset=["article_content"],
    keep=False
)]

print("Duplicate contents:", len(duplicate_contents))

# Exact duplicate title + content
duplicate_articles = df[df.duplicated(
    subset=["article_title", "article_content"],
    keep=False
)]

print("Duplicate articles:", len(duplicate_articles))

# Missing values
print("\nMissing values:")
print(df[["article_title", "article_content", "labels"]].isna().sum())

# Empty text
empty_titles = (df["article_title"] == "").sum()
empty_contents = (df["article_content"] == "").sum()

print("\nEmpty titles:", empty_titles)
print("Empty contents:", empty_contents)