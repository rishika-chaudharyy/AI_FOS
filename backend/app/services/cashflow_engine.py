import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def generate_cashflow_insights(df):
    inflow = df[df["category"].isin(["Income", "Liability"]) & (df["amount"] > 0)]["amount"].sum()
    outflow = df[df["category"].isin(["Expense", "Asset", "Purchase"])]["amount"].sum()
    
    # Get top 3 negative transactions (Expenses/Purchases)
    top_expenses_df = df[df["category"].isin(["Expense", "Asset", "Purchase"])].sort_values(by="amount", ascending=False).head(3)
    top_expenses = top_expenses_df[["description", "amount"]].to_dict('records')

    if not client:
        return {
            "advices": ["Monitor your expenses closely.", "Ensure your inflows exceed outflows to extend runway."],
            "forecast": "Expected to remain stable based on historical data.",
            "anomalies": ["No major anomalies detected without AI API access."]
        }

    prompt = f"""
    You are an expert Financial CFO and Advisor. Analyze this company's simplified monthly cash flow overview:
    Total Inflow (Cash generated): ${inflow}
    Total Outflow (Cash burned): ${outflow}
    Top 3 Expenses/Outflows: {top_expenses}

    Return a JSON object with EXACTLY these strings and arrays:
    {{
        "advices": [
            "1-2 sentence strategic advice regarding their burn rate and cash efficiency.",
            "1-2 sentence recommendation for the founder/finance team based on their top expenses."
        ],
        "forecast": "A 1-2 sentence prediction or goal for next month's cash flow target based on this behavior.",
        "anomalies": [
           "A 1 sentence observation pointing out any potential anomaly (e.g. if one expense is dangerously high)."
        ]
    }}

    Respond ONLY with valid JSON. Do not include markdown brackets or chat text.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content.strip()
        result = json.loads(content)
        
        return {
            "advices": result.get("advices", ["No advice generated."]),
            "forecast": result.get("forecast", "No forecast generated."),
            "anomalies": result.get("anomalies", ["No anomalies detected."])
        }

    except Exception as e:
        print("Insight Gen Error:", e)
        return {
            "advices": ["Failed to generate advices via Groq. Please check API Key."],
            "forecast": "Unavailable due to API error.",
            "anomalies": ["Unavailable."]
        }
