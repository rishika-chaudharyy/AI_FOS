import "../styles/Statements.css";
import Upload from "../components/Upload";
import { useStore } from "../store/useStore";
import { useEffect } from "react";

export default function Statements() {
  const data = useStore((state) => state.data) || [];
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  useEffect(() => {
    setCurrentPage("statements");
  }, []);

  const normalize = (v) => v?.toLowerCase().trim();

  const fixCategory = (item) => {
    const desc = item.description?.toLowerCase();

    if (desc.includes("goods") && desc.includes("purchase")) return "purchase";
    if (desc.includes("furniture") || desc.includes("equipment"))
      return "asset";
    if (desc.includes("salary") || desc.includes("rent")) return "expense";

    return normalize(item.category);
  };

  const aggregateData = (data) => {
    const map = {};
    data.forEach((item) => {
      const key = `${item.description}-${fixCategory(item)}`;

      if (!map[key]) {
        map[key] = {
          ...item,
          amount: Number(item.amount || 0),
          category: fixCategory(item),
        };
      } else {
        map[key].amount += Number(item.amount || 0);
      }
    });
    return Object.values(map);
  };

  const grouped = aggregateData(data);

  const purchases = grouped.filter(
    (d) => d.category === "purchase" && normalize(d.type) === "debit",
  );

  const sales = grouped.filter(
    (d) => d.category === "income" && normalize(d.type) === "credit",
  );

  const expenses = grouped.filter(
    (d) => d.category === "expense" && normalize(d.type) === "debit",
  );

  const assetItems = grouped.filter(
    (d) => d.category === "asset" && normalize(d.type) === "debit",
  );

  const liabilityItems = grouped.filter(
    (d) => d.category === "liability" && normalize(d.type) === "credit",
  );

  const capitalItems = grouped.filter(
    (d) =>
      d.description.toLowerCase().includes("capital") &&
      normalize(d.type) === "credit",
  );

  const calculateCash = (data) => {
    let debit = 0,
      credit = 0;

    data.forEach((item) => {
      if (item.description.toLowerCase().includes("cash")) {
        if (normalize(item.type) === "debit") debit += item.amount;
        else credit += item.amount;
      }
    });

    return debit - credit;
  };

  const cashBalance = calculateCash(data);

  const assets = [
    ...assetItems.filter((d) => !d.description.toLowerCase().includes("cash")),
    { description: "Cash", amount: cashBalance },
  ];

  const sum = (arr) => arr.reduce((a, b) => a + b.amount, 0);

  const totalPurchases = sum(purchases);
  const totalSales = sum(sales);
  const totalExpenses = sum(expenses);

  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;

  const totalAssets = sum(assets);

  const capitalTotal = sum(capitalItems);

  const totalLiabilities =
    sum(liabilityItems) + capitalTotal + (netProfit > 0 ? netProfit : 0);

  return (
    <div className="statements-container">
      <h1 className="main-title">Financial Statements</h1>

      <Upload />

      {/* TRADING */}
      <div className="statement-card">
        <h2>Trading Account</h2>

        <table>
          <thead>
            <tr>
              <th>Debit</th>
              <th>Amount</th>
              <th>Credit</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* Purchases */}
            {purchases.map((p, i) => (
              <tr key={i}>
                <td>{p.description}</td>
                <td>{p.amount}</td>
                <td></td>
                <td></td>
              </tr>
            ))}

            {/* Sales */}
            {sales.map((s, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td>{s.description}</td>
                <td>{s.amount}</td>
              </tr>
            ))}

            {/* Gross Profit at bottom */}
            <tr className="highlight">
              <td>Gross Profit c/d</td>
              <td>{grossProfit}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* P&L */}
      <div className="statement-card">
        <h2>Profit & Loss Account</h2>

        <table>
          <thead>
            <tr>
              <th>Expenses</th>
              <th>Amount</th>
              <th>Income</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* Expenses */}
            {expenses.map((e, i) => (
              <tr key={i}>
                <td>{e.description}</td>
                <td>{e.amount}</td>
                <td></td>
                <td></td>
              </tr>
            ))}

            {/* Gross Profit b/d */}
            <tr>
              <td></td>
              <td></td>
              <td>Gross Profit b/d</td>
              <td>{grossProfit}</td>
            </tr>

            {/* Net Profit LAST */}
            <tr className="profit-row">
              <td>Net Profit</td>
              <td>{netProfit}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* BALANCE SHEET */}
      <div className="statement-card">
        <h2>Balance Sheet</h2>

        <table>
          <thead>
            <tr>
              <th>Liabilities</th>
              <th>Amount</th>
              <th>Assets</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* Liabilities */}
            {liabilityItems.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td>{l.amount}</td>
                <td></td>
                <td></td>
              </tr>
            ))}

            {/* Capital */}
            {capitalItems.map((c, i) => (
              <tr key={i}>
                <td>{c.description}</td>
                <td>{c.amount}</td>
                <td></td>
                <td></td>
              </tr>
            ))}

            {/* Net Profit LAST */}
            {netProfit > 0 && (
              <tr className="highlight">
                <td>Net Profit</td>
                <td>{netProfit}</td>
                <td></td>
                <td></td>
              </tr>
            )}

            {/* Assets */}
            {assets.map((a, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td>{a.description}</td>
                <td>{a.amount}</td>
              </tr>
            ))}

            <tr className="total-row">
              <td>Total</td>
              <td>{totalLiabilities}</td>
              <td>Total</td>
              <td>{totalAssets}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
