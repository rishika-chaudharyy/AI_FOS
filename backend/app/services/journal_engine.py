def generate_journal_entries(df, text_col, amount_col):
    journal = []

    for _, row in df.iterrows():
        desc = row[text_col]
        amount = float(row[amount_col])
        category = row["category"]

        debit = ""
        credit = ""

        # DOUBLE ENTRY LOGIC
        if category == "Income":
            debit = "Cash A/c"
            credit = "Sales A/c"

        elif category == "Expense":
            debit = f"{desc} Expense A/c"
            credit = "Cash A/c"

        elif category == "Asset":
            debit = f"{desc} A/c"
            credit = "Cash A/c"

        elif category == "Liability":
            debit = "Cash A/c"
            credit = f"{desc} A/c"

        else:
            debit = "Suspense A/c"
            credit = "Cash A/c"

        entry = {
            "date": str(row.get("date", "")),
            "debit": debit,
            "credit": credit,
            "amount": amount,
            "narration": f"Being {desc.lower()}"
        }

        journal.append(entry)

    return journal