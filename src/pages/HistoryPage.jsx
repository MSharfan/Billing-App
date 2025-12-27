import React, { useEffect, useState } from "react";
import { load, save } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { addIncomeFromBill } from "../utils/accounts";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductsContext";
import { v4 as uuidv4 } from "uuid";

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
  const { products, updateProduct, addProduct } = useProducts();

  // EDITING STATE
  const [editingBill, setEditingBill] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [updateCatalogOnSave, setUpdateCatalogOnSave] = useState(false);

  const openEdit = (bill) => {
    setEditingBill(bill);
    // deep copy items so edits don't mutate original until saved
    setEditItems(bill.items.map(i => ({ ...i, product: { ...i.product } })));
  }

  const closeEdit = () => {
    setEditingBill(null);
    setEditItems([]);
    setUpdateCatalogOnSave(false);
  }

  const updateEditItem = (itemId, changes) => {
    setEditItems(prev => prev.map(i => i.id === itemId ? { ...i, ...changes } : i));
  }

  const removeEditItem = (itemId) => setEditItems(prev => prev.filter(i => i.id !== itemId));

  const addEditItemFromProduct = (productId) => {
    const p = products.find(x => x.id === productId);
    if (!p) return showToast('Product not found','error');
    const item = { id: uuidv4(), product: { ...p }, qty: 1 };
    setEditItems(prev => [item, ...prev]);
  }

  // custom product input state
  const [addingCustomOpen, setAddingCustomOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const addCustomProductToEdit = () => {
    const name = (newProductName || '').trim();
    const price = Number(newProductPrice || 0);
    if (!name) return showToast('Enter product name','error');
    if (!price || price <= 0) return showToast('Enter valid price','error');

    const prod = { id: uuidv4(), name, price, tax: 0 };
    const item = { id: uuidv4(), product: prod, qty: 1 };
    setEditItems(prev => [item, ...prev]);
    setNewProductName(''); setNewProductPrice(''); setAddingCustomOpen(false);
    showToast('Product added to bill (not saved yet)', 'success');
  }

  const saveEdits = () => {
    if (!editingBill) return;
    // recalc totals
    const subtotal = editItems.reduce((s, i) => s + (Number(i.product.price) || 0) * (Number(i.qty) || 0), 0);
    const taxes = editItems.reduce((s, i) => s + (((Number(i.product.tax) || 0) / 100) * ((Number(i.product.price) || 0) * (Number(i.qty) || 0))), 0);
    const total = subtotal + taxes;

    const updatedBill = {
      ...editingBill,
      items: editItems,
      subtotal,
      taxes,
      total,
      balanceDue: Math.max(0, total - (Number(editingBill.advancePaid) || 0))
    };

    const all = load('bills', []);
    const updated = all.map(b => b.id === editingBill.id ? updatedBill : b);
    save('bills', updated);
    setBills(updated);
    setFilteredBills(updated);

    // optionally update product catalog: update existing products' prices
    if (updateCatalogOnSave) {
      editItems.forEach(i => {
        const pid = i.product.id;
        if (!pid) return;
        const orig = products.find(p => p.id === pid);
        if (orig) {
          if (Number(orig.price) !== Number(i.product.price)) {
            try { updateProduct(pid, { price: Number(i.product.price) }) } catch (e) { /* ignore */ }
          }
        } else {
          // product doesn't exist in catalog -> add it
          try { addProduct({ name: i.product.name || i.product.title || 'Item', price: Number(i.product.price || 0), tax: i.product.tax || 0 }) } catch (e) { /* ignore */ }
        }
      });
    }

    showToast('Bill updated', 'success');
    closeEdit();
  }

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
              <button
                onClick={() => openEdit(b)}
                className="flex-1 py-2 rounded bg-yellow-600"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingBill && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl p-4 rounded text-white">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-semibold">Editing Bill {editingBill.number}</div>
                <div className="text-sm text-slate-400">{new Date(editingBill.date).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={closeEdit} className="py-1 px-3 rounded bg-slate-700">Close</button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-auto">
              {editItems.map((it) => (
                <div key={it.id} className="bg-slate-800 p-2 rounded flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{it.product?.name || it.product?.title || 'Product'}</div>
                    <div className="text-xs text-slate-400">ID: {it.product?.id || '—'}</div>
                  </div>

                  <div className="w-32">
                    <input type="number" min="0" step="0.01" value={it.product?.price ?? ''}
                      onChange={(e) => updateEditItem(it.id, { product: { ...it.product, price: Number(e.target.value) } })}
                      className="w-full p-1 rounded bg-slate-700 text-sm" />
                  </div>

                  <div className="w-24">
                    <input type="number" min="1" step="1" value={it.qty}
                      onChange={(e) => updateEditItem(it.id, { qty: Number(e.target.value) })}
                      className="w-full p-1 rounded bg-slate-700 text-sm" />
                  </div>

                  <button onClick={() => removeEditItem(it.id)} className="py-1 px-2 rounded bg-red-600 text-sm">Remove</button>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 items-center">
                <select className="col-span-2 p-2 rounded bg-slate-800" onChange={(e) => { if (e.target.value) addEditItemFromProduct(e.target.value); e.target.value = '' }} defaultValue="">
                  <option value="">Add product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name || p.title || p.id} — ₹{p.price}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Update catalog</label>
                  <input type="checkbox" checked={updateCatalogOnSave} onChange={(e) => setUpdateCatalogOnSave(e.target.checked)} />
                </div>
              </div>

              {/* custom add product form (collapsible) */}
              <div className="bg-slate-800 p-2 rounded">
                <button onClick={() => setAddingCustomOpen(v => !v)} className="w-full text-left p-2 rounded bg-amber-900/20">+ Add Product</button>

                {addingCustomOpen && (
                  <div className="mt-2 space-y-2">
                    <input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Product name" className="w-full p-2 rounded bg-slate-700" />
                    <input value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Price" className="w-full p-2 rounded bg-slate-700" />
                    <div className="flex gap-2">
                      <button onClick={addCustomProductToEdit} className="flex-1 py-2 rounded bg-emerald-600">Add to Bill</button>
                      <button onClick={() => { setNewProductName(''); setNewProductPrice(''); setAddingCustomOpen(false); }} className="flex-1 py-2 rounded bg-slate-700">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={saveEdits} className="flex-1 py-2 rounded bg-accent text-slate-900 font-semibold">Save Changes</button>
              <button onClick={closeEdit} className="flex-1 py-2 rounded bg-slate-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
