import Upload from "../components/Upload";
import "../styles/Dashboard.css";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { useStore } from "../store/useStore";
import { useEffect } from "react";

export default function Dashboard() {
  const data = useStore((state) => state.data) || [];
  const summary = useStore((state) => state.summary);
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  useEffect(() => {
    setCurrentPage("dashboard");
  }, []);

  const COLORS = {
    income: "#22c55e",
    expense: "#ef4444",
    asset: "#3b82f6",
    liability: "#f59e0b",
  };

  const chartData = summary?.summary
    ? Object.entries(summary.summary).map(([k, v]) => ({
        name: k,
        value: v,
      }))
    : null;

  const renderLabel = ({ name }) => name;

  const filterBy = (type) =>
    data.filter((d) => d.category?.toLowerCase().includes(type));

  return (
    <div className="dashboard">
      <h1 className="main-title">Financial Analytics Dashboard</h1>

      <Upload />

      {summary && (
        <div className="cards">
          <Card
            title="Income"
            value={summary.pnl?.total_income}
            color={COLORS.income}
          />
          <Card
            title="Expense"
            value={summary.pnl?.total_expense}
            color={COLORS.expense}
          />
          <Card
            title="Assets"
            value={summary.balance_sheet?.total_assets}
            color={COLORS.asset}
          />
          <Card
            title="Liabilities"
            value={summary.balance_sheet?.total_liabilities}
            color={COLORS.liability}
          />
        </div>
      )}

      {chartData && (
        <div className="chart-box">
          <h2 className="chart-title">Financial Distribution</h2>

          <div className="chart-center">
            <PieChart width={350} height={300}>
              <Pie data={chartData} dataKey="value" label={renderLabel}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      )}

      <Section title="Income" data={filterBy("income")} color={COLORS.income} />
      <Section
        title="Expense"
        data={filterBy("expense")}
        color={COLORS.expense}
      />
      <Section title="Assets" data={filterBy("asset")} color={COLORS.asset} />
      <Section
        title="Liabilities"
        data={filterBy("liability")}
        color={COLORS.liability}
      />
    </div>
  );
}

/* ✅ ADD THIS BACK */

function Card({ title, value, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <p className="center">{title}</p>
      <h2 className="center">{value?.toLocaleString() || 0}</h2>
    </div>
  );
}

function Section({ title, data, color }) {
  if (!data.length) return null;

  return (
    <div className="section">
      <h2 className="section-title" style={{ borderColor: color }}>
        {title} ({data.length})
      </h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.description || "-"}</td>
                <td style={{ color }}>
                  {Number(row.amount || 0).toLocaleString()}
                </td>
                <td>{row.category || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
