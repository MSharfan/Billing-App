import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { load, save } from "../utils/localStorage";

export default function AccountsDashboard({ onBack }) {
  const [records, setRecords] = useState([]);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all"); // all | day | month | year
  const [vehicleFilter, setVehicleFilter] = useState("");

  // --------------------------------
  // LOAD + NORMALIZE DATA (CRITICAL)
  // --------------------------------
  useEffect(() => {
    const raw = load("accounts", []);

    let normalized = [];

    // OLD FORMAT (array)
    if (Array.isArray(raw)) {
      normalized = raw.map((r) => ({
        id: r.id || uuidv4(),
        type: r.type || "income",
        source: r.source || "manual",
        amount: Number(r.amount) || 0,
        note: r.note || "",
        ref: r.ref,
        date: r.date || new Date().toISOString(),
      }));
    }

    // NEW FORMAT (object with income/expense)
    else if (raw && typeof raw === "object") {
      const income = (raw.income || []).map((i) => ({
        id: i.id,
        type: "income",
        source: i.source || "bill",
        amount: Number(i.amount) || 0,
        note: i.note || `Bill ${i.ref || ""}`,
        ref: i.ref,
        date: i.date,
      }));

      const expense = (raw.expense || []).map((e) => ({
        id: e.id,
        type: "expense",
        source: "manual",
        amount: Number(e.amount) || 0,
        note: e.note || e.category || "Expense",
        date: e.date,
      }));

      normalized = [...income, ...expense];
    }

    setRecords(normalized);
  }, []);

  // --------------------------------
  // ADD MANUAL ENTRY
  // --------------------------------
  const addRecord = () => {
    if (!amount || Number(amount) <= 0) return;

    const newRecord = {
      id: uuidv4(),
      type,
      source: "manual",
      amount: Number(amount),
      note: note || (type === "income" ? "Manual income" : "Manual expense"),
      date: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    save("accounts", updated);

    setAmount("");
    setNote("");
  };

  // --------------------------------
  // FILTER LOGIC
  // --------------------------------
  const now = new Date();

  // load bills once to allow vehicle lookup for bill-backed income records
  const billsData = load("bills", []);

  const filteredRecords = records.filter((r) => {
    const d = new Date(r.date);

    // If vehicleFilter is set, only include records linked to bills whose
    // customer vehicle number matches the query.
    if (vehicleFilter && vehicleFilter.trim()) {
      // only bill-sourced records have vehicle info
      if (r.source !== "bill" || !r.ref) return false;

      const bill = billsData.find((b) => b.number === r.ref);
      if (!bill) return false;

      const vno = bill.customerInfo?.vehicleNo || "";
      if (!vno.toUpperCase().includes(vehicleFilter.toUpperCase())) return false;
    }

    if (filter === "day")
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );

    if (filter === "month")
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    if (filter === "year")
      return d.getFullYear() === now.getFullYear();

    return true;
  });

  // --------------------------------
  // CALCULATIONS (SAFE)
  // --------------------------------
  const income = filteredRecords
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + r.amount, 0);

  const expense = filteredRecords
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + r.amount, 0);

  const balance = income - expense;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 text-white">
      <button onClick={() => onBack("dashboard")} className="text-slate-300">
        ← Back
      </button>

      {/* VEHICLE FILTER */}
      <div>
        <input
          placeholder="Filter by vehicle no."
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value.toUpperCase())}
          className="w-full p-2 rounded bg-slate-800 text-white mb-3"
        />
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {["all", "day", "month", "year"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 p-2 rounded capitalize ${
              filter === f ? "bg-blue-600" : "bg-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card title="Income" value={income} color="emerald" />
        <Card title="Expense" value={expense} color="red" />
        <Card title="Balance" value={balance} color="slate" />
      </div>

      {/* ADD ENTRY */}
      <div className="bg-slate-800 p-4 rounded-lg space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setType("income")}
            className={`flex-1 p-2 rounded ${
              type === "income" ? "bg-emerald-600" : "bg-slate-700"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setType("expense")}
            className={`flex-1 p-2 rounded ${
              type === "expense" ? "bg-red-600" : "bg-slate-700"
            }`}
          >
            Expense
          </button>
        </div>

        <input
          className="w-full p-2 rounded bg-slate-900"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        />

        <input
          className="w-full p-2 rounded bg-slate-900"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          onClick={addRecord}
          className="w-full p-2 rounded bg-blue-600 font-semibold"
        >
          Add Entry
        </button>
      </div>

      {/* HISTORY */}
      <div className="space-y-2">
        {filteredRecords.map((r) => (
          <div
            key={r.id}
            className={`p-3 rounded flex justify-between ${
              r.type === "income" ? "bg-emerald-900" : "bg-red-900"
            }`}
          >
            <div>
              <div className="font-semibold">
                {r.source === "bill" ? `Bill ${r.ref}` : r.note}
              </div>
              <div className="text-xs text-slate-300">
                {new Date(r.date).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div className="font-bold">₹{r.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Card = ({ title, value, color }) => (
  <div className={`bg-${color}-600 p-3 rounded-lg`}>
    <div className="text-sm">{title}</div>
    <div className="font-bold">₹{value || 0}</div>
  </div>
);
