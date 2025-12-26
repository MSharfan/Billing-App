import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";


export default function ProductForm({ onSave, product, onCancel }) {
  const { showToast } = useToast();

  // Format helpers
  const formatNumber = (v) =>
    v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cleanNumber = (v) => v.replace(/,/g, "");

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(
    product?.price ? formatNumber(String(product.price)) : ""
  );
  const [stock, setStock] = useState(
    product?.stock ? formatNumber(String(product.stock)) : ""
  );
  const [tax, setTax] = useState(
    product?.tax ? formatNumber(String(product.tax)) : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Product name required", "error");
      return;
    }

    if (!price.trim()) {
      showToast("Price is required", "error");
      return;
    }

    const numericPrice = Number(cleanNumber(price));

    if (isNaN(numericPrice) || numericPrice <= 0) {
      showToast("Invalid price", "error");
      return;
    }

    onSave({
      name: name.trim(),
      price: numericPrice,
      stock: Number(cleanNumber(stock)) || 0,
      tax: Number(cleanNumber(tax)) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-4 rounded-lg text-white">

      {/* PRODUCT NAME */}
      <label className="text-sm">Product Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter product name"
        className="w-full p-2 rounded bg-slate-800 mt-1"
      />

      {/* PRICE */}
      <label className="text-sm mt-3 block">Price</label>
      <input
        value={price}
        onChange={(e) => setPrice(formatNumber(e.target.value))}
        placeholder="Enter price"
        className="w-full p-2 rounded bg-slate-800 mt-1"
        inputMode="numeric"
      />

      {/* STOCK + TAX */}
      <div className="flex gap-2 mt-3">

        <div className="flex-1">
          <label className="text-sm">Stock</label>
          <input
            value={stock}
            onChange={(e) => setStock(formatNumber(e.target.value))}
            placeholder="Optional"
            className="w-full p-2 rounded bg-slate-800 mt-1"
            inputMode="numeric"
          />
        </div>

        <div className="w-28">
          <label className="text-sm">Tax %</label>
          <input
            value={tax}
            onChange={(e) => setTax(formatNumber(e.target.value))}
            className="w-full p-2 rounded bg-slate-800 mt-1"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex-1 py-2 rounded bg-accent text-slate-900 font-semibold"
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 rounded bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
