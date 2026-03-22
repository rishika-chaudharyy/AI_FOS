def generate_pnl(df, amount_col):
    income = df[df["category"] == "Income"][amount_col].sum()
    expense = df[df["category"] == "Expense"][amount_col].sum()

    return {
        "total_income": float(income),
        "total_expense": float(expense),
        "net_profit": float(income - expense)
    }


def generate_balance_sheet(df, amount_col):
    assets = df[df["category"] == "Asset"][amount_col].sum()
    liabilities = df[df["category"] == "Liability"][amount_col].sum()

    return {
        "total_assets": float(assets),
        "total_liabilities": float(liabilities),
        "net_worth": float(assets - liabilities)
    }