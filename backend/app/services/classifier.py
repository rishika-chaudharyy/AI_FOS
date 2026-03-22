import os
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from app.core.db import get_cached, store


#  ENV
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("⚠️ GROQ API KEY NOT FOUND")

client = Groq(api_key=api_key) if api_key else None


# PREPROCESS 
def preprocess_text(text):
    text = str(text).lower()

    replacements = {
        "cr": "credit",
        "dr": "debit",
        "sal": "salary"
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    return text.strip()


# RULE BASED
def rule_classify(text):
    text = str(text).lower()

    if any(word in text for word in ["salary", "income", "credited", "received"]):
        return "Income"
    elif any(word in text for word in ["rent", "bill", "expense", "subscription"]):
        return "Expense"
    elif any(word in text for word in ["loan", "emi"]):
        return "Liability"
    elif any(word in text for word in ["equipment", "laptop", "vehicle"]):
        return "Asset"
    elif "purchase" in text:
        return "Expense"
    else:
        return "Other"


#TRAINING DATA 
training_data = {
    "text": [
        "salary credit", "client payment", "consulting income",
        "rent payment", "electricity bill", "office expense",
        "loan received", "loan emi",
        "equipment purchase", "asset purchase",
        "amazon order", "netflix subscription", "upi payment",
        "freelance income", "bonus received",
        "crypto sale profit", "vendor payment", "uber ride"
    ],
    "label": [
        "Income", "Income", "Income",
        "Expense", "Expense", "Expense",
        "Liability", "Liability",
        "Asset", "Asset",
        "Expense", "Expense", "Expense",
        "Income", "Income",
        "Income", "Expense", "Expense"
    ]
}

train_df = pd.DataFrame(training_data)


vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(train_df["text"])

model = LogisticRegression()
model.fit(X, train_df["label"])


#  ML 
def ml_classify(text):
    try:
        X_input = vectorizer.transform([text])
        probs = model.predict_proba(X_input)[0]

        confidence = max(probs)
        prediction = model.classes_[probs.argmax()]

        return prediction, confidence
    except:
        return "Other", 0.0


# LLM
def llm_classify(text):
    if not client:
        return "Other"

    try:
        prompt = f"""
        You are a financial expert.

        Classify this transaction into ONE category:
        Income, Expense, Asset, Liability

        Transaction: "{text}"

        Only return the category name.
        """

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        result = response.choices[0].message.content.strip()

        for cat in ["Income", "Expense", "Asset", "Liability"]:
            if cat.lower() in result.lower():
                return cat

        return "Other"

    except Exception as e:
        print("LLM Error:", e)
        return "Other"


#  FINAL CLASSIFIER 
def classify_transaction(text):
    text = preprocess_text(text)

  
    cached = get_cached(text)
    if cached:
        print(f"[CACHE] {text} → {cached}")
        return cached

  
    rule = rule_classify(text)
    if rule != "Other":
        print(f"[RULE] {text} → {rule}")
        store(text, rule, "rule")
        return rule

   
    ml_pred, conf = ml_classify(text)
    print(f"[ML CHECK] {text} → {ml_pred} (conf={conf:.2f})")

    if conf > 0.7:
        store(text, ml_pred, "ml")
        return ml_pred

   
    llm_pred = llm_classify(text)
    print(f"[LLM] {text} → {llm_pred}")

    store(text, llm_pred, "llm")

    return llm_pred