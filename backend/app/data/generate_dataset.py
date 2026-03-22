import pandas as pd
import random
import numpy as np
from faker import Faker

fake = Faker()

N = 10000  # 🔥 large dataset

descriptions = [
    "NEFT CR SALARY", "UPI SWIGGY", "EMI PAYMENT HDFC",
    "AMAZON PURCHASE", "RENT PAYMENT", "FREELANCE INCOME",
    "NETFLIX SUBSCRIPTION", "ELECTRICITY BILL",
    "UBER RIDE", "FLIPKART ORDER", "GYM MEMBERSHIP",
    "INSURANCE PREMIUM", "DIVIDEND CREDIT", "CRYPTO SALE"
]

categories = ["Income", "Expense", "Asset", "Liability"]

data = []

for _ in range(N):
    desc = random.choice(descriptions)

    # Random noise in text
    noise = random.choice(["", " TXN123", " REF987", " XYZ", ""])
    desc = desc + noise

    amount = random.randint(-50000, 100000)

    # Introduce anomalies
    if random.random() < 0.1:
        desc = None
    if random.random() < 0.1:
        amount = None

    row = {
        "transaction_id": fake.uuid4(),
        "date": fake.date(),
        "description": desc,
        "amount": amount,
        "currency": random.choice(["INR", "USD", "EUR"]),
        "account_type": random.choice(["Savings", "Current", "Credit"]),
        "status": random.choice(["Completed", "Pending", "Failed"]),
        "merchant": fake.company(),
        "location": fake.city(),
        "device": random.choice(["Mobile", "Web", "ATM"]),
        "ip_address": fake.ipv4(),
        "random_text": fake.text(),
        "irrelevant_col1": random.randint(1, 1000),
        "irrelevant_col2": fake.name()
    }

    data.append(row)

df = pd.DataFrame(data)

df.to_csv("enterprise_dataset.csv", index=False)

print("✅ Dataset generated: enterprise_dataset.csv")