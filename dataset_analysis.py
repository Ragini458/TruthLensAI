import pandas as pd

file_path = r"ml_model\data\FA-KES-Dataset.csv"

df = pd.read_csv(file_path, encoding="latin1")

print("========== LABEL + SOURCE ==========")
print(pd.crosstab(df["source"], df["labels"]))

print("\n========== LABEL + LOCATION ==========")
print(pd.crosstab(df["location"], df["labels"]))

print("\n========== LABEL + DATE ==========")
print(pd.crosstab(df["date"], df["labels"]).head(20))

print("\n========== TEXT LENGTH ==========")
df["text_length"] = (
    df["article_title"].fillna("").str.len()
    + df["article_content"].fillna("").str.len()
)

print(df.groupby("labels")["text_length"].describe())