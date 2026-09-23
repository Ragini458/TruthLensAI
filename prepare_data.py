import pandas as pd

# Dataset path
file_path = r"ml_model\data\FA-KES-Dataset.csv"

# Load dataset
df = pd.read_csv(file_path, encoding="latin1")

print("Original dataset:", df.shape)

# Fill missing values
df["article_title"] = df["article_title"].fillna("").str.strip()
df["article_content"] = df["article_content"].fillna("").str.strip()

# Combine title + content
df["text"] = (
    df["article_title"] + " " +
    df["article_content"]
)

# Remove completely duplicated articles
before = len(df)

df = df.drop_duplicates(
    subset=["article_title", "article_content"],
    keep="first"
)

after = len(df)

print("Duplicate articles removed:", before - after)

# Keep only required columns
data = df[["text", "labels"]].copy()

# Remove empty text
data = data[data["text"].str.strip() != ""]

print("Final dataset:", data.shape)

print("\nLabel distribution:")
print(data["labels"].value_counts())

# Save
output_path = r"ml_model\data\cleaned_data.csv"

data.to_csv(
    output_path,
    index=False,
    encoding="utf-8"
)

print("\nCleaned dataset saved!")
print(output_path)