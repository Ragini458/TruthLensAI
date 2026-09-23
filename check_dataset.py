import pandas as pd

file_path = r"ml_model\data\FA-KES-Dataset.csv"

df = pd.read_csv(file_path, encoding="latin1")

print("\nDataset loaded successfully!")
print("\nRows and columns:")
print(df.shape)

print("\nColumn names:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())