import React, { useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useStore } from "../store/useStore";
import Upload from "../components/Upload";
import "../styles/Cashflow.css";

export default function Cashflow() {
  const data = useStore((state) => state.data) || [];
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  useEffect(() => {
    setCurrentPage("cashflow");
  }, [setCurrentPage]);

  // Aggregate and calculate cashflow metrics
  const {
    inflows, outflows, totalInflow, totalOutflow, netCashFlow,
    operating, investing, financing,
    burnRate, runway
  } = useMemo(() => {
    const inflows = [];
    const outflows = [];
    let totalInflow = 0;
    let totalOutflow = 0;

    const operating = [];
    const investing = [];
    const financing = [];

    data.forEach((item) => {
      const amount = Number(item.amount) || 0;
      const category = item.category?.toLowerCase() || "";
      const isIncome = category === "income";
      const isExpense = category === "expense";
      const isAssetOrPurchase = category === "asset" || category === "purchase";
      const isLiability = category === "liability";

      // Classify as Inflow or Outflow
      if (isIncome || (isLiability && amount > 0)) { 
         inflows.push(item);
         totalInflow += amount;
      } else if (isExpense || isAssetOrPurchase || (isLiability && amount < 0)) {
         outflows.push(item);
         totalOutflow += Math.abs(amount);
      } else if (amount > 0) {
         inflows.push(item);
         totalInflow += amount;
      } else if (amount < 0) {
         outflows.push(item);
         totalOutflow += Math.abs(amount);
      }

      // Group by Activity
      if (isIncome || isExpense) {
        operating.push(item);
      } else if (isAssetOrPurchase) {
        investing.push(item);
      } else if (isLiability) {
        financing.push(item);
      }
    });

    const monthlyBurnRate = totalOutflow;
    const currentCash = totalInflow; 
    const monthsRunway = monthlyBurnRate > 0 ? (currentCash / monthlyBurnRate).toFixed(1) : "Infinite";

    return {
      inflows: inflows.sort((a, b) => b.amount - a.amount), 
      outflows: outflows.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      operating: operating.sort((a, b) => b.amount - a.amount),
      investing: investing.sort((a, b) => b.amount - a.amount),
      financing: financing.sort((a, b) => b.amount - a.amount),
      burnRate: monthlyBurnRate,
      runway: monthsRunway
    };
  }, [data]);

  const COLORS = {
    operating: "#3b82f6", investing: "#8b5cf6", financing: "#f59e0b",
    inflow: "#10b981", outflow: "#ef4444",
  };

  const comparisonData = [{ name: "Cash Flow", Inflow: totalInflow, Outflow: totalOutflow }];
  
  const distributionData = [
    { name: "Operating", value: operating.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0) },
    { name: "Investing", value: investing.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0) },
    { name: "Financing", value: financing.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0) },
  ].filter(d => d.value > 0);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  // PDF Export Logic
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Cash Flow Report", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    doc.text(`Total Cash Inflow: ${formatCurrency(totalInflow)}`, 14, 45);
    doc.text(`Total Cash Outflow: ${formatCurrency(totalOutflow)}`, 14, 55);
    doc.text(`Net Cash Flow: ${formatCurrency(netCashFlow)}`, 14, 65);
    doc.text(`Monthly Burn Rate: ${formatCurrency(burnRate)}`, 14, 75);
    doc.text(`Cash Runway: ${runway} Months`, 14, 85);

    doc.text("Transaction Breakdown", 14, 105);
    
    const tableData = data.map(row => [row.description, formatCurrency(row.amount), row.category]);
    
    autoTable(doc, {
      startY: 115,
      head: [["Description", "Amount", "Category"]],
      body: tableData,
    });

    doc.save("CashFlow_Report.pdf");
  };

  if (!data || data.length === 0) {
    return (
      <div className="dashboard cashflow-container">
        <h1 className="main-title">Cash Flow Statement</h1>
        <div style={{ marginBottom: "2rem" }}>
          <Upload />
        </div>
        <div className="empty-state">
          <h3>No Data Available</h3>
          <p>Please upload a dataset to view Cash Flow analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard cashflow-container">
      <div className="cashflow-header-row">
        <h1 className="main-title">Cash Flow Statement</h1>
        <button onClick={downloadPDF} className="export-btn btn-pdf">
          Download PDF Report
        </button>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <Upload />
      </div>

      {/* Top Level Metrics */}
      <h2 className="section-title">Cash Metrics</h2>
      <div className="cards metrics-grid">
        <div className="card metric-card" style={{ borderTop: `3px solid ${COLORS.inflow}` }}>
          <p className="metric-title">Total Inflow</p>
          <h2 className="metric-value positive">{formatCurrency(totalInflow)}</h2>
        </div>

        <div className="card metric-card" style={{ borderTop: `3px solid ${COLORS.outflow}` }}>
          <p className="metric-title">Total Outflow</p>
          <h2 className="metric-value negative">{formatCurrency(totalOutflow)}</h2>
        </div>

        <div className="card metric-card" style={{ borderTop: `3px solid ${netCashFlow >= 0 ? COLORS.inflow : COLORS.outflow}` }}>
          <p className="metric-title">Net Cash Flow</p>
          <h2 className={`metric-value ${netCashFlow >= 0 ? "positive" : "negative"}`}>
            {formatCurrency(netCashFlow)}
          </h2>
        </div>

        <div className="card metric-card" style={{ borderTop: `3px solid #f59e0b` }}>
          <p className="metric-title">Est. Monthly Burn Rate</p>
          <h2 className="metric-value">{formatCurrency(burnRate)}</h2>
        </div>

        <div className="card metric-card" style={{ borderTop: `3px solid #8b5cf6` }}>
          <p className="metric-title">Est. Cash Runway</p>
          <h2 className="metric-value">{runway} {runway !== "Infinite" && "Months"}</h2>
        </div>
      </div>

      {/* Visualizations */}
      <h2 className="section-title">Cash Movement</h2>
      <div className="charts-section">
        <div className="chart-box card">
          <h2 className="chart-title">Inflow vs Outflow</h2>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip cursor={{ fill: "transparent" }} formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Inflow" fill={COLORS.inflow} radius={[6, 6, 0, 0]} maxBarSize={80} />
                <Bar dataKey="Outflow" fill={COLORS.outflow} radius={[6, 6, 0, 0]} maxBarSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-box card">
          <h2 className="chart-title">Activity Volume</h2>
          <div style={{ height: 300, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#9CA3AF' }}>Not enough data</p>}
          </div>
        </div>
      </div>

      {/* Detailed Activity Lists */}
      <h2 className="section-title">Detailed Activities</h2>
      <div className="activities-grid">
        <ActivityCard title="Operating Activities" data={operating} color={COLORS.operating} />
        <ActivityCard title="Investing Activities" data={investing} color={COLORS.investing} />
        <ActivityCard title="Financing Activities" data={financing} color={COLORS.financing} />
      </div>
    </div>
  );
}

function ActivityCard({ title, data, color }) {
  const total = data.reduce((acc, curr) => {
      const amount = Number(curr.amount) || 0;
      const isOutflow = curr.category?.toLowerCase() === 'expense' || curr.category?.toLowerCase() === 'asset' || curr.category?.toLowerCase() === 'purchase';
      return isOutflow ? acc - Math.abs(amount) : acc + Math.abs(amount);
  }, 0);

  const formatCurrency = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <div className="activity-card card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="activity-header">
        <h3>{title}</h3>
        <span className="activity-total" style={{ color: total < 0 ? '#ef4444' : '#10b981' }}>
           {total > 0 ? '+' : ''}{formatCurrency(total)}
        </span>
      </div>
      <ul className="activity-list">
        {data.length > 0 ? data.slice(0, 15).map((item, idx) => {
            const amount = Number(item.amount) || 0;
            const isOutflow = item.category?.toLowerCase() === 'expense' || item.category?.toLowerCase() === 'asset' || item.category?.toLowerCase() === 'purchase';
            const displayColor = isOutflow ? '#ef4444' : '#10b981';
            return (
              <li key={idx} className="activity-item">
                <div className="activity-desc">
                  <span>{item.description}</span>
                  <span className="activity-category">{item.category}</span>
                </div>
                <div className="activity-amount" style={{ color: displayColor }}>
                  {isOutflow ? '-' : '+'}{formatCurrency(Math.abs(amount))}
                </div>
              </li>
            );
          }) : <li className="activity-item" style={{ justifyContent: 'center', color: '#9CA3AF' }}>No transactions found</li>}
      </ul>
    </div>
  );
}
