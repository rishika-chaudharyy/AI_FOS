from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.parser import normalize_data, detect_columns
from app.services.classifier import classify_transaction
from app.services.finance_engine import generate_pnl, generate_balance_sheet

router = APIRouter()


def read_file(file):
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        try:
            return pd.read_csv(file.file, encoding="utf-8")
        except:
            return pd.read_csv(file.file, encoding="latin1")

    elif filename.endswith(".xlsx"):
        return pd.read_excel(file.file)

    else:
        raise Exception("Unsupported file format")


# 🔹 PROCESS (FULL DATA)
@router.post("/process")
async def process_file(file: UploadFile = File(...)):
    try:
        df = read_file(file)

        df = df.fillna("")
        df = normalize_data(df)

        text_col, amount_col = detect_columns(df)

        if not text_col:
            return {"error": "No description column found"}

        df[text_col] = df[text_col].astype(str)

        df["category"] = df[text_col].apply(classify_transaction)

        # ✅ FULL DATA (ALL ROWS)
        classified_data = df.to_dict(orient="records")

        return {
            "total_rows": len(df),
            "classified_data": classified_data
        }

    except Exception as e:
        return {"error": str(e)}


# 🔹 ANALYZE
@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        df = read_file(file)

        df = normalize_data(df)

        text_col, amount_col = detect_columns(df)

        if not text_col:
            return {"error": "No description column found"}

        df[text_col] = df[text_col].astype(str)

        df["category"] = df[text_col].apply(classify_transaction)

        if not amount_col:
            return {"error": "Amount column not found"}

        df[amount_col] = pd.to_numeric(df[amount_col], errors="coerce").fillna(0)

        pnl = generate_pnl(df, amount_col)
        balance_sheet = generate_balance_sheet(df, amount_col)

        summary = df.groupby("category")[amount_col].sum().to_dict()

        return {
            "pnl": pnl,
            "balance_sheet": balance_sheet,
            "summary": summary,
            "total_rows": len(df)
        }

    except Exception as e:
        return {"error": str(e)}