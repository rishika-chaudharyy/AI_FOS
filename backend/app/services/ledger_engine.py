from collections import defaultdict
from app.services.preprocessing import get_standard_account 

def generate_ledger(journal):
    ledger = defaultdict(list)

    for entry in journal:

        debit_acc = get_standard_account(entry["debit"])
        credit_acc = get_standard_account(entry["credit"])

        # Debit side
        ledger[debit_acc].append({
            "date": entry["date"],
            "particular": f"To {credit_acc}",
            "debit": entry["amount"],
            "credit": 0
        })

        # Credit side
        ledger[credit_acc].append({
            "date": entry["date"],
            "particular": f"By {debit_acc}",
            "debit": 0,
            "credit": entry["amount"]
        })

    return dict(ledger)