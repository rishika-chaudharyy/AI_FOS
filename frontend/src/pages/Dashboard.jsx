import Upload from "../components/Upload";
import "../styles/Dashboard.css";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { useStore } from "../store/useStore";
import { useEffect, useState } from "react";

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

  // 🔥 FIX 1: GROUP + SUM DUPLICATES
  const aggregateData = (data) => {
    const map = {};

    data.forEach((item) => {
      const key = `${item.description}-${item.category}`;

      if (!map[key]) {
        map[key] = {
          ...item,
          amount: Number(item.amount || 0),
        };
      } else {
        map[key].amount += Number(item.amount || 0);
      }
    });

    return Object.values(map);
  };

  const filterBy = (type) =>
    aggregateData(data.filter((d) => d.category?.toLowerCase().includes(type)));

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
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                label={({ name }) => name}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.name?.toLowerCase()] || "#8884d8"}
                  />
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

function Card({ title, value, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <p className="center">{title}</p>
      <h2 className="center">{value?.toLocaleString() || 0}</h2>
    </div>
  );
}

function Section({ title, data, color }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const filtered = data.filter((row) =>
    row.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);

  const exportCSV = () => {
    const headers = ["Description", "Amount", "Category"];
    const rows = filtered.map((row) => [
      row.description,
      row.amount,
      row.category,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `${title}.csv`;
    link.click();
  };

  if (!data.length) return null;

  return (
    <div className="section">
      <h2 className="section-title" style={{ borderColor: color }}>
        {title} ({filtered.length})
      </h2>

      <div className="section-controls">
        {/* 🔥 FIXED SEARCH UI */}
        <div className="search-wrapper">
          <div className="search-box-container">
            <svg className="search-icon" viewBox="0 0 24 24"></svg>

            <input
              className="search-box"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

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
            {paginated.map((row, i) => (
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

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
