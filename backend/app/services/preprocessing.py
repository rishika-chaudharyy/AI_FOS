import pandas as pd
import re
from rapidfuzz import process, fuzz


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


# -------------------------------
# BALANCED ACCOUNT MATCHING
# -------------------------------

KNOWN_ACCOUNTS = []
SIMILARITY_THRESHOLD = 92   # 🔥 stricter to avoid over-grouping


def normalize_account_name(name):
    if not name:
        return ""

    name = str(name).lower().strip()

    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', ' ', name)

    return name


def get_standard_account(name):
    clean_name = normalize_account_name(name)

    # 🔥 avoid grouping very small/generic text
    if len(clean_name.split()) < 2:
        KNOWN_ACCOUNTS.append(clean_name)
        return clean_name.title() + " A/c"

    if KNOWN_ACCOUNTS:
        match = process.extractOne(
            clean_name,
            KNOWN_ACCOUNTS,
            scorer=fuzz.token_sort_ratio,
            score_cutoff=SIMILARITY_THRESHOLD
        )

        if match:
            return match[0].title() + " A/c"

    KNOWN_ACCOUNTS.append(clean_name)

    return clean_name.title() + " A/c"