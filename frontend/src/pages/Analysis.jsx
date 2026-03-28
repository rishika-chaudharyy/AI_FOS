import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useStore } from "../store/useStore";
import "../styles/Analysis.css";

export default function Analysis() {
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  const [period1Name, setPeriod1Name] = useState("Period 1");
  const [period2Name, setPeriod2Name] = useState("Period 2");

  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);

  useEffect(() => {
    setCurrentPage("analysis");
  }, [setCurrentPage]);

  // Uploader Component inline for clean distinct instances
  const ComparativeUploader = ({ label, onUploadSuccess, placeholderName }) => {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      setFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("http://127.0.0.1:8000/process", formData);

        if (res.data.error) {
          alert(res.data.error);
        } else {
          const match = file.name.match(/\d{4}/);
          let detectedYear = match ? match[0] : file.name.split('.')[0];
          // Truncate name if it's crazy long
          if (detectedYear.length > 15) {
            detectedYear = detectedYear.substring(0, 15) + '...';
          }
          
          onUploadSuccess(res.data.classified_data || [], detectedYear);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to process file.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className={`upload-box ${fileName ? "active" : ""}`}>
        <h3>{label}</h3>
        <p title={fileName}>{fileName ? `Loaded: ${fileName}` : `Upload ${placeholderName} report dataset (.csv or .xlsx)`}</p>
        
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleUpload}
          className="upload-input"
          id={`upload-${label}`}
        />
        <label 
          htmlFor={`upload-${label}`} 
          className={`upload-btn ${fileName ? "loaded" : ""}`}
        >
          {loading ? "Processing..." : fileName ? "Change File" : "Choose File"}
        </label>
      </div>
    );
  };

  // Metric Calculation Logic
  const calcMetrics = (dataset) => {
    if (!dataset) return null;
    let income = 0;
    let expense = 0;
    
    // Categorizing
    let operatingExpense = 0;
    let liabilities = 0;
    let assetsAdded = 0;

    dataset.forEach(item => {
      const amount = Number(item.amount) || 0;
      const cat = item.category?.toLowerCase() || "";
      
      if (cat === "income") {
        income += amount;
      } else if (cat === "expense") {
        expense += Math.abs(amount);
        operatingExpense += Math.abs(amount);
      } else if (cat === "liability") {
        if (amount > 0) income += amount;
        else liabilities += Math.abs(amount);
      } else if (cat === "asset" || cat === "purchase") {
        expense += Math.abs(amount);
        assetsAdded += Math.abs(amount);
      } else {
        if (amount > 0) income += amount;
        else expense += Math.abs(amount);
      }
    });

    return { 
      income, 
      expense, 
      net: income - expense,
      operatingExpense,
      liabilities,
      assetsAdded
    };
  };

  const m1 = useMemo(() => calcMetrics(data1), [data1]);
  const m2 = useMemo(() => calcMetrics(data2), [data2]);

  const readyToCompare = !!m1 && !!m2;

  // Render Helpers
  const formatCurrency = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  
  const getDelta = (val1, val2) => {
    if (!val1) return 100;
    return (((val2 - val1) / val1) * 100).toFixed(1);
  };

  // Comparative Chart Data
  const chartData = readyToCompare ? [
    { name: "Total Income", [period1Name || "Per 1"]: m1.income, [period2Name || "Per 2"]: m2.income },
    { name: "Total Expense", [period1Name]: m1.expense, [period2Name]: m2.expense },
    { name: "Net Cash Flow", [period1Name]: m1.net, [period2Name]: m2.net },
  ] : [];

  // Distribution Data for Pie Charts
  const getDistData = (m) => [
    { name: "OpEx", value: m.operatingExpense },
    { name: "Assets", value: m.assetsAdded },
    { name: "Liabilities", value: m.liabilities },
  ].filter(d => d.value > 0);

  const dist1 = readyToCompare ? getDistData(m1) : [];
  const dist2 = readyToCompare ? getDistData(m2) : [];
  const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];

  const tooltipStyle = { backgroundColor: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' };

  const YoYCard = ({ title, val1, val2, invertColor = false }) => {
    const delta = getDelta(val1, val2);
    const isPositive = delta > 0;
    const isNeutral = delta == 0;
    
    let statusClass = "neutral";
    if (!isNeutral) {
      if (invertColor) {
        statusClass = isPositive ? "negative" : "positive";
      } else {
        statusClass = isPositive ? "positive" : "negative";
      }
    }

    const symbol = isPositive ? "▲" : (isNeutral ? "—" : "▼");

    return (
      <div className="yoy-card">
        <div className="yoy-header">
          <h3 className="yoy-title">{title}</h3>
          <div className={`delta-badge ${statusClass}`}>
            {symbol} {isNeutral ? "0%" : `${Math.abs(delta)}%`}
          </div>
        </div>
        <div className="yoy-values">
          <div className="yoy-val-block">
            <span className="yoy-val-label" title={period1Name}>{period1Name}</span>
            <span className="yoy-val" title={formatCurrency(val1)}>{formatCurrency(val1)}</span>
          </div>
          <div className="yoy-divider"></div>
          <div className="yoy-val-block" style={{textAlign: "right"}}>
            <span className="yoy-val-label" title={period2Name}>{period2Name}</span>
            <span className="yoy-val" title={formatCurrency(val2)}>{formatCurrency(val2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard comparative-container">
      <div className="comparative-header">
        <h1>Comparative Insights</h1>
        <p>Upload two datasets to instantly calculate Year-over-Year (YoY) variances and growth drivers.</p>
      </div>

      <div className="upload-split">
        <ComparativeUploader 
          label="Baseline Period" 
          placeholderName="2023"
          onUploadSuccess={(data, name) => { setData1(data); setPeriod1Name(name || "Period 1"); }} 
        />
        <div className="vs-badge">VS</div>
        <ComparativeUploader 
          label="Comparison Period" 
          placeholderName="2024"
          onUploadSuccess={(data, name) => { setData2(data); setPeriod2Name(name || "Period 2"); }} 
        />
      </div>

      {readyToCompare && (
        <div className="comparative-results" style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="yoy-grid">
            <YoYCard title="Total Cash Inflow" val1={m1.income} val2={m2.income} />
            <YoYCard title="Total Cash Outflow" val1={m1.expense} val2={m2.expense} invertColor={true} />
            <YoYCard title="Net Cash Flow" val1={m1.net} val2={m2.net} />
          </div>

          <div className="comparison-chart-container">
            <h2>Growth Comparison</h2>
            <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#9ca3af" />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} stroke="#9ca3af" />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey={period1Name} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey={period2Name} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-row">
            <div className="pie-chart-box">
              <h2>{period1Name} Expense Dist.</h2>
              <ResponsiveContainer width="100%" height="80%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={dist1} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {dist1.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="pie-chart-box">
              <h2>{period2Name} Expense Dist.</h2>
              <ResponsiveContainer width="100%" height="80%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={dist2} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {dist2.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="variance-table-card">
            <h2>Category Variance Breakdown</h2>
            <div className="table-wrapper">
              <table className="variance-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>{period1Name} Volume</th>
                    <th>{period2Name} Volume</th>
                    <th>Variance ($)</th>
                    <th>Growth (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Operating Expenses", v1: m1.operatingExpense, v2: m2.operatingExpense, badGrowth: true },
                    { label: "Assets Purchased", v1: m1.assetsAdded, v2: m2.assetsAdded, badGrowth: false },
                    { label: "Liabilities Paid", v1: m1.liabilities, v2: m2.liabilities, badGrowth: false },
                  ].map((row, i) => {
                    const variance = row.v2 - row.v1;
                    const deltaPerc = getDelta(row.v1, row.v2);
                    const isPos = variance > 0;
                    
                    const colorClass = isPos ? (row.badGrowth ? "v-negative" : "v-positive") : (!isPos ? (row.badGrowth ? "v-positive" : "v-negative") : "");
                    const sign = isPos ? "+" : "";

                    return (
                      <tr key={i}>
                        <td>{row.label}</td>
                        <td>{formatCurrency(row.v1)}</td>
                        <td>{formatCurrency(row.v2)}</td>
                        <td className={colorClass}>{sign}{formatCurrency(variance)}</td>
                        <td className={colorClass}>{sign}{deltaPerc}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
