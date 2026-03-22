import sqlite3

conn = sqlite3.connect("transactions.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    text TEXT PRIMARY KEY,
    category TEXT,
    source TEXT
)
""")
conn.commit()


def get_cached(text):
    cursor.execute("SELECT category FROM transactions WHERE text=?", (text,))
    res = cursor.fetchone()
    return res[0] if res else None


def store(text, category, source):
    cursor.execute(
        "INSERT OR REPLACE INTO transactions VALUES (?, ?, ?)",
        (text, category, source)
    )
    conn.commit()