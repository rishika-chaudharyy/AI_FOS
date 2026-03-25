import pandas as pd
from app.services.classifier import classify_transaction
from app.services.preprocessing import get_standard_account, KNOWN_ACCOUNTS


def detect_columns(df):
    cols = {c.lower().strip(): c for c in df.columns}

    text_col = None
    amount_col = None

    for c in cols:
        if any(k in c for k in ["description", "narration", "details", "remark", "particular"]):
            text_col = cols[c]

        if any(k in c for k in ["amount", "amt", "value"]):
            amount_col = cols[c]

    return text_col, amount_col


def clean_dataframe(df, text_col, amount_col=None):
    
    df = df[df[text_col].notna()]
    df[text_col] = df[text_col].astype(str)

    df = df[df[text_col].str.len() > 3]

    if amount_col:
        df[amount_col] = df[amount_col].astype(str).str.replace(",", "")
        df[amount_col] = df[amount_col].str.replace("₹", "")
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

    rename_map = {text_col: "description"}

    if amount_col:
        rename_map[amount_col] = "amount"

    df.rename(columns=rename_map, inplace=True)

    # 🔥 HANDLE DEBIT / CREDIT CASE
    lower_cols = [c.lower() for c in df.columns]
    if "debit" in lower_cols and "credit" in lower_cols:
        debit_col = df.columns[lower_cols.index("debit")]
        credit_col = df.columns[lower_cols.index("credit")]

        df["amount"] = pd.to_numeric(df[debit_col], errors="coerce").fillna(0) - \
                       pd.to_numeric(df[credit_col], errors="coerce").fillna(0)

    df = clean_dataframe(df, "description", "amount")

    if "amount" not in df.columns:
        df["amount"] = 0

    df["category"] = df["description"].apply(classify_transaction)
    df["account"] = df["description"].apply(get_standard_account)

    return df