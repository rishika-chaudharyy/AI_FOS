import pandas as pd


def clean_text(text):
    if pd.isna(text):
        return ""

    text = str(text).lower()

    replacements = {
        "cr": "credit",
        "dr": "debit",
        "sal": "salary",
        "txn": "",
        "ref": ""
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    return text.strip()


def handle_missing_values(df):
    
    df["description"] = df["description"].fillna("unknown")

    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df["amount"] = df["amount"].fillna(0)

    return df


def remove_irrelevant_columns(df):
    useful_cols = ["description", "amount", "date"]

    cols_to_keep = [col for col in df.columns if col in useful_cols]

    return df[cols_to_keep]


def remove_noise_rows(df):
    df = df[df["description"].str.len() > 3]
    return df


def preprocess_pipeline(df):
    print("Starting preprocessing...")

    df = handle_missing_values(df)
    df["description"] = df["description"].apply(clean_text)
    df = remove_noise_rows(df)
    df = remove_irrelevant_columns(df)

    print("Preprocessing complete")

    return df