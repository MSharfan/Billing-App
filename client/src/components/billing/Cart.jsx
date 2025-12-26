import React, { useState } from "react";
import { useCart } from "../../context/CartContext";

export default function Cart({
  advancePaid = null,      // null = not set, 0 = valid
  onRemoveAdvance,
  onCheckout,
}) {
  const { cart, updateQty, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(true);

  /* -----------------------------
     CALCULATIONS (SAFE)
  ----------------------------- */
  const subtotal = cart.reduce(
    (s, i) => s + i.product.price * i.qty,
    0
  );

  const taxes = cart.reduce(
    (s, i) =>
      s +
      ((i.product.tax || 0) / 100) *
        (i.product.price * i.qty),
    0
  );

  const advance = advancePaid ?? 0; // null → 0 only for math

  const total = Math.max(
    0,
    subtotal + taxes - advance
  );

  return (
    <div className="bg-slate-900 rounded-lg text-white shadow-md">
      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center p-4 cursor-pointer select-none"
      >
        <h3 className="font-semibold">
          Cart ({cart.length} items)
        </h3>
        <span className="text-slate-400">
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* CONTENT */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[700px] p-4" : "max-h-0 p-0"
        }`}
      >
        {/* CLEAR */}
        <div className="flex justify-end mb-2">
          <button
            onClick={clearCart}
            className="text-sm text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </div>

        {/* ITEMS */}
        <div className="space-y-2 max-h-48 overflow-auto">
          {cart.length === 0 && (
            <div className="text-slate-400">
              No items.
            </div>
          )}

          {cart.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between bg-slate-800 p-2 rounded"
            >
              <div>
                <div className="font-medium">
                  {i.product.name}
                </div>
                <div className="text-sm text-slate-400">
                  ₹{i.product.price} × {i.qty}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQty(i.id, Math.max(1, i.qty - 1))
                  }
                  className="px-2 py-1 rounded bg-slate-700"
                >
                  −
                </button>

                <div>{i.qty}</div>

                <button
                  onClick={() =>
                    updateQty(i.id, i.qty + 1)
                  }
                  className="px-2 py-1 rounded bg-slate-700"
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(i.id)}
                  className="ml-2 text-red-500"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ADVANCE (VISIBLE ONLY IF SET) */}
        {advancePaid !== null && (
          <div className="mt-3 border-t border-slate-700 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-semibold">
                Advance
              </span>

              <div className="flex items-center gap-3">
                <span className="text-green-400 font-semibold">
                  − ₹{advance.toFixed(2)}
                </span>

                {onRemoveAdvance && (
                  <button
                    onClick={onRemoveAdvance}
                    className="text-red-400 font-bold"
                    title="Remove advance"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOTALS */}
        <div className="mt-3 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Taxes</span>
            <span>₹{taxes.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* CHECKOUT */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="mt-3 w-full py-3 rounded bg-accent text-slate-900 font-semibold disabled:opacity-60"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
