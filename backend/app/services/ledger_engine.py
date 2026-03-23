from collections import defaultdict

def generate_ledger(journal):
    ledger = defaultdict(list)

    for entry in journal:

        # Debit side
        ledger[entry["debit"]].append({
            "date": entry["date"],
            "particular": f"To {entry['credit']}",
            "debit": entry["amount"],
            "credit": 0
        })

        # Credit side
        ledger[entry["credit"]].append({
            "date": entry["date"],
            "particular": f"By {entry['debit']}",
            "debit": 0,
            "credit": entry["amount"]
        })

    return dict(ledger)