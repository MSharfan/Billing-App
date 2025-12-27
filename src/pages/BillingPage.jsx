import React, { useMemo, useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Cart from "../components/billing/Cart";
import { useNavigate } from "react-router-dom";

export default function BillingPage({ onPreview }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  /* -----------------------------
     CUSTOMER DETAILS
  ----------------------------- */
  const [customer, setCustomer] = useState({
    customerName: "",
    vehicleNo: "",
    phone: "",
    currentKm: "",
    nextOilKm: "",
  });

  /* -----------------------------
     ADVANCE PAYMENT
  ----------------------------- */
  const [advanceInput, setAdvanceInput] = useState("");
  // null = not set (do not show), number = advance entered
  const [advancePaid, setAdvancePaid] = useState(null);

  const applyAdvance = () => {
    if (advanceInput === "") {
      showToast("Enter advance amount", "error");
      return;
    }

    const val = Number(advanceInput);
    if (val <= 0 || Number.isNaN(val)) {
      showToast("Enter an advance amount greater than 0", "error");
      return;
    }

    setAdvancePaid(val);
    setAdvanceInput("");
    showToast("Advance added", "success");
  };

  const removeAdvance = () => {
    setAdvancePaid(null);
    showToast("Advance removed", "success");
  };

  /* -----------------------------
     ADD TEMP PRODUCT
  ----------------------------- */
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  const handleAddTempProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("Enter product name & price", "error");
      return;
    }

    addToCart(
      {
        id: Date.now(),
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        tax: 0,
      },
      1
    );

    setNewProduct({ name: "", price: "" });
    setShowAddProduct(false);
    showToast("Added to cart", "success");
  };

  /* -----------------------------
     SEARCH
  ----------------------------- */
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 text-white">
      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="text-slate-300 hover:text-white"
      >
        ← Back
      </button>

      {/* CUSTOMER DETAILS */}
      <div className="bg-slate-800 p-4 rounded space-y-3">
        <h2 className="text-lg font-semibold">Customer Details</h2>

        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Customer Name"
          value={customer.customerName}
          onChange={(e) =>
            setCustomer({ ...customer, customerName: e.target.value })
          }
        />

        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Vehicle Number"
          value={customer.vehicleNo}
          onChange={(e) =>
            setCustomer({
              ...customer,
              vehicleNo: e.target.value.toUpperCase(),
            })
          }
        />

        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Phone Number"
          value={customer.phone}
          onChange={(e) =>
            setCustomer({
              ...customer,
              phone: e.target.value.replace(/\D/g, ""),
            })
          }
        />

        <div className="flex gap-2">
          <input
            className="w-full p-3 rounded bg-slate-900"
            placeholder="Present Km"
            value={customer.currentKm}
            onChange={(e) =>
              setCustomer({
                ...customer,
                currentKm: e.target.value.replace(/\D/g, ""),
              })
            }
          />
          <input
            className="w-full p-3 rounded bg-slate-900"
            placeholder="Next Oil Change Km"
            value={customer.nextOilKm}
            onChange={(e) =>
              setCustomer({
                ...customer,
                nextOilKm: e.target.value.replace(/\D/g, ""),
              })
            }
          />
        </div>
      </div>

      {/* ADVANCE */}
      <div className="bg-slate-800 p-3 rounded flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm text-slate-300">Advance Amount (₹)</label>
          <input
            className="w-full p-2 rounded bg-slate-900"
            placeholder="Enter amount"
            value={advanceInput}
            onChange={(e) =>
              setAdvanceInput(e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        <button
          onClick={applyAdvance}
          className="px-4 py-2 rounded bg-emerald-600 font-semibold"
        >
          Add
        </button>
      </div>

      {/* CART */}
      <Cart
        advancePaid={advancePaid}
        onRemoveAdvance={removeAdvance}
        onCheckout={() =>
          onPreview({
            customerInfo: customer,
            advancePaid,
          })
        }
      />

      {/* ADD PRODUCT */}
      <button
        onClick={() => setShowAddProduct(true)}
        className="w-full py-2 rounded bg-green-600 text-slate-900 font-semibold"
      >
        + Add Product
      </button>

      {showAddProduct && (
        <div className="bg-slate-800 p-4 rounded space-y-3">
          <input
            className="w-full p-2 rounded bg-slate-900"
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <input
            className="w-full p-2 rounded bg-slate-900"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTempProduct}
              className="flex-1 py-2 rounded bg-accent text-slate-900 font-semibold"
            >
              Add to Cart
            </button>
            <button
              onClick={() => setShowAddProduct(false)}
              className="px-4 py-2 rounded bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <input
        className="w-full p-3 rounded bg-slate-900"
        placeholder="Search product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* PRODUCT LIST */}
      <div className="space-y-2">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 p-3 rounded flex justify-between"
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-slate-300">₹{p.price}</div>
            </div>
            <button
              onClick={() => addToCart(p, 1)}
              className="px-4 py-2 rounded bg-accent text-slate-900 font-semibold"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
