import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import BillingPage from "./pages/BillingPage";
import BillPreview from "./pages/BillPreview";
import AccountsDashboard from "./pages/AccountsDashboard";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import ProductsPage from "./pages/ProductsPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { load } from "./utils/localStorage";
import Login from "./pages/Login";

export default function App() {
  const navigate = useNavigate();

  // Shared state for preview
  const [customerInfo, setCustomerInfo] = useState({});
  const [previewData, setPreviewData] = useState(null);
  
  const shopName = load("shopName", "high tech");
  const storedPin = load("pin", null);
  // If a pin exists, require authentication on startup
  const [authenticated, setAuthenticated] = React.useState(
    !Boolean(storedPin)
  );

  const handleLogin = () => setAuthenticated(true);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title={shopName} />

      <main className="py-6">
        {!authenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Routes>
      {/* DASHBOARD */}
      <Route
        path="/"
        element={
          <Dashboard
            onGo={(path) => navigate(path)}
          />
        }
      />

      {/* BILLING */}
      <Route
        path="/billing"
        element={
          <BillingPage
            onPreview={(data) => {
              setPreviewData(data); // advancePaid, etc.
              // Pass the bill data via navigation state so pages that read
              // `location.state` (like `BillPreview`) receive the payload.
              navigate("/preview", { state: { bill: data } });
            }}
          />
        }
      />

      {/* PREVIEW */}
      <Route
        path="/preview"
        element={
          <BillPreview
            customerInfo={customerInfo}
            bill={previewData}
            onBack={() => navigate("/billing")}
          />
        }
      />

      {/* HISTORY */}
      <Route
        path="/history"
        element={
          <HistoryPage onBack={() => navigate("/")} />
        }
      />

      {/* PRODUCTS */}
      <Route
        path="/products"
        element={<ProductsPage onBack={() => navigate("/")} />}
      />

      {/* ACCOUNTS */}
      <Route
        path="/accounts"
        element={
          <AccountsDashboard onBack={() => navigate("/")} />
        }
      />

      {/* SETTINGS */}
      <Route
        path="/settings"
        element={
          <SettingsPage onBack={() => navigate("/")} onPinChange={(hasPin) => setAuthenticated(!hasPin)} />
        }
      />
          </Routes>
        )}
      </main>

      <Footer />
    </div>
  );
}
