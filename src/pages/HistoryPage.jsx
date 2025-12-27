import React, { useEffect, useState } from "react";
import { load, save } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { addIncomeFromBill } from "../utils/accounts";
import { useToast } from "../context/ToastContext";

export default function HistoryPage() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);

  const [filter, setFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // -----------------------------
  // LOAD BILLS
  // -----------------------------
  useEffect(() => {
    const data = load("bills", []);
    setBills(data);
    setFilteredBills(data);
  }, []);

  // -----------------------------
  // APPLY FILTERS
  // -----------------------------
  const applyFilter = () => {
    let filtered = [...bills];

    // 1️⃣ VEHICLE NUMBER FILTER
    if (vehicleFilter.trim()) {
      filtered = filtered.filter((b) =>
        b.customerInfo?.vehicleNo
          ?.toLowerCase()
          .includes(vehicleFilter.toLowerCase())
      );
    }

    // 2️⃣ DATE FILTERS (use explicit start/end ranges to avoid
    // timezone/toDateString edge cases)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(todayEnd.getDate() - 1);

    const startOfWeek = new Date(todayStart);
    startOfWeek.setDate(todayStart.getDate() - todayStart.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (filter === "today") {
      filtered = filtered.filter((b) => {
        const d = new Date(b.date);
        return d >= todayStart && d <= todayEnd;
      });
    }

    if (filter === "yesterday") {
      filtered = filtered.filter((b) => {
        const d = new Date(b.date);
        return d >= yesterdayStart && d <= yesterdayEnd;
      });
    }

    if (filter === "week") {
      filtered = filtered.filter((b) => new Date(b.date) >= startOfWeek);
    }

    if (filter === "month") {
      filtered = filtered.filter((b) => new Date(b.date) >= startOfMonth);
    }

    if (filter === "custom" && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);

      filtered = filtered.filter((b) => {
        const d = new Date(b.date);
        return d >= s && d <= e;
      });
    }

    setFilteredBills(filtered);
  };

  // -----------------------------
  // DELETE BILL
  // -----------------------------
  const deleteBill = (id) => {
    if (!window.confirm("Delete this bill?")) return;

    const updated = bills.filter((b) => b.id !== id);
    save("bills", updated);
    setBills(updated);
    setFilteredBills(updated);
  };

  // ---------------------------------
  // RECORD PAYMENT (add income from a bill)
  // ---------------------------------
  const { showToast } = useToast();

  const recordPayment = (bill) => {
    // don't record twice
    if (bill.paymentRecorded) {
      showToast("Payment already recorded for this bill", "warning");
      return;
    }

    const amount = Number(bill.balanceDue || bill.total || 0);
    if (!amount || amount <= 0) {
      showToast("Nothing to record (zero amount)", "error");
      return;
    }

    addIncomeFromBill({ billNo: bill.number, amount, note: `Payment for ${bill.number}` });

    // mark bill as recorded in storage
    const all = load("bills", []);
    const updated = all.map((b) =>
      b.id === bill.id ? { ...b, paymentRecorded: true } : b
    );
    save("bills", updated);

    // update local state views
    const newBills = bills.map((b) => (b.id === bill.id ? { ...b, paymentRecorded: true } : b));
    setBills(newBills);
    setFilteredBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, paymentRecorded: true } : b)));

    showToast("Payment recorded in accounts", "success");
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white space-y-4">
      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="text-slate-300 hover:text-white"
      >
        ← Back
      </button>

      <h2 className="text-lg font-semibold">Bill History</h2>

      {/* FILTER SECTION */}
      <div className="bg-slate-900 p-3 rounded space-y-3">
        {/* VEHICLE FILTER */}
        <input
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value.toUpperCase())}
          placeholder="Enter vehicle no."
          className="w-full p-2 bg-slate-800 rounded text-white"
        />

        {/* DATE FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 bg-slate-800 rounded"
        >
          <option value="all">All Bills</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {/* CUSTOM RANGE */}
        {filter === "custom" && (
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-2 bg-slate-800 rounded"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 p-2 bg-slate-800 rounded"
            />
          </div>
        )}

        <button
          onClick={applyFilter}
          className="w-full py-2 rounded bg-accent text-slate-900 font-semibold"
        >
          Apply Filter
        </button>
      </div>

      {/* BILL LIST */}
      <div className="space-y-3">
        {filteredBills.length === 0 && (
          <div className="text-slate-400">No bills found.</div>
        )}

        {filteredBills.map((b) => (
          <div key={b.id} className="bg-slate-900 p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Bill {b.number}</div>
                <div className="text-sm text-slate-400">
                  {new Date(b.date).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 uppercase">
                  {b.customerInfo?.vehicleNo || "N/A"}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">₹{b.total.toFixed(2)}</div>
                <div className="text-sm text-slate-400">
                  {b.items.length} items
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex mt-3 gap-2">
              <button
                onClick={() =>
                  navigate("/preview", {
                    state: { bill: b, fromHistory: true },
                  })
                }
                className="flex-1 py-2 rounded bg-slate-700"
              >
                View
              </button>

              <button
                onClick={() => recordPayment(b)}
                className="flex-1 py-2 rounded bg-emerald-600"
                disabled={b.paymentRecorded}
              >
                {b.paymentRecorded ? "Recorded" : "Record Payment"}
              </button>

              <button
                onClick={() => deleteBill(b.id)}
                className="flex-1 py-2 rounded bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
