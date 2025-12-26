import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useToast } from "../context/ToastContext";
import ProductForm from "../components/billing/ProductForm";

export default function ProductsPage({ onBack }) {
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // SEARCH only by product name
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const onSave = (data) => {
    if (editing) {
      updateProduct(editing.id, data);
      showToast("Product updated successfully!", "success");
    } else {
      addProduct(data);
      showToast("Product added successfully!", "success");
    }

    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white">
      {/* BACK */}
      <button
        onClick={() => onBack("dashboard")}
        className="text-slate-300 hover:text-white mb-4"
      >
        ← Back
      </button>

      {/* SEARCH + ADD BUTTON */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product"
          className="flex-1 p-3 rounded bg-slate-900 text-white"
        />

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-3 rounded bg-accent text-slate-900"
        >
          Add
        </button>
      </div>

      {/* PRODUCT FORM */}
      {showForm && (
        <div className="mt-4">
          <ProductForm
            product={editing}
            onSave={onSave}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* PRODUCT LIST */}
      <div className="mt-4 space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex justify-between bg-slate-900 p-3 rounded"
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-slate-400">
                ₹{p.price} • {p.tax}% tax • {p.stock ?? 0} stock
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
                className="px-3 py-1 rounded bg-slate-700"
              >
                Edit
              </button>

              <button
                onClick={() => setDeleteTarget(p.id)}
                className="px-3 py-1 rounded bg-red-600"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-5 rounded-lg w-72 text-white">
            <h3 className="text-lg font-semibold mb-3">Delete Product?</h3>
            <p className="text-sm text-slate-300 mb-5">
              Are you sure you want to delete this product?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  removeProduct(deleteTarget);
                  setDeleteTarget(null);
                  showToast("Product deleted successfully!", "success");
                }}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
