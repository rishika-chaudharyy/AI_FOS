import pandas as pd
from app.services.classifier import classify_transaction



def detect_columns(df):
    cols = {c.lower(): c for c in df.columns}

    text_col = None
    amount_col = None

    for c in cols:
        if any(k in c for k in ["description", "narration", "details", "remark"]):
            text_col = cols[c]

        if any(k in c for k in ["amount", "amt", "value"]):
            amount_col = cols[c]

    return text_col, amount_col



def clean_dataframe(df, text_col, amount_col=None):
    
    df = df[df[text_col].notna()]
    df[text_col] = df[text_col].astype(str)

    df = df[df[text_col].str.len() > 3]

   
    if amount_col:
        df[amount_col] = pd.to_numeric(df[amount_col], errors="coerce")
        df[amount_col] = df[amount_col].fillna(0)

    return df


def normalize_data(df):
    text_col, amount_col = detect_columns(df)

    if not text_col:
        raise Exception("No description column found")

    df = clean_dataframe(df, text_col, amount_col)

    return df


def process_csv(file):
    df = pd.read_csv(file)

    text_col, amount_col = detect_columns(df)

    if not text_col:
        raise Exception("No description column found")

    
    df = clean_dataframe(df, text_col, amount_col)

   
    df["category"] = df[text_col].apply(classify_transaction)

    return df