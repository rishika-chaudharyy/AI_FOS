import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Statements from "./pages/Statements";
import Cashflow from "./pages/Cashflow";
import Analysis from "./pages/Analysis";
import Navbar from "./components/Navbar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="page-content">{children}</div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* App Pages */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/journal"
          element={
            <Layout>
              <Journal />
            </Layout>
          }
        />

        <Route
          path="/statements"
          element={
            <Layout>
              <Statements />
            </Layout>
          }
        />

        <Route
          path="/cashflow"
          element={
            <Layout>
              <Cashflow />
            </Layout>
          }
        />

        <Route
          path="/analysis"
          element={
            <Layout>
              <Analysis />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
