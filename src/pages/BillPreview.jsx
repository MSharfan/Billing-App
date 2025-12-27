import React, { useRef } from "react";
import { useCart } from "../context/CartContext";
import { load, save } from "../utils/localStorage";
import { generateInvoicePDF } from "../utils/generatePDF";
import { addIncomeFromBill } from "../utils/accounts";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";
import { useNavigate, useLocation } from "react-router-dom";

import ActionBar from "../components/invoice/ActionBar";
import { useToast } from "../context/ToastContext";
import InvoiceScreen from "../components/invoice/InvoiceScreen";
import InvoiceImage from "../components/invoice/InvoiceImage";

export default function BillPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const imageRef = useRef(null);

  // -----------------------------
  // STATE FROM NAVIGATION
  // -----------------------------
  const { bill, fromHistory } = location.state || {};
  const isHistory = Boolean(fromHistory);

  // SAFETY: nothing to show
  if (!bill && cart.length === 0) {
    navigate("/");
    return null;
  }

  // -----------------------------
  // ITEMS + META
  // -----------------------------
  const items = isHistory ? bill.items : cart;
  const billNo = isHistory ? bill.number : `B-${Date.now()}`;
  const billDate = isHistory ? bill.date : new Date().toISOString();

  const subtotal = items.reduce(
    (s, i) => s + i.product.price * i.qty,
    0
  );

  const taxes = items.reduce(
    (s, i) =>
      s +
      ((i.product.tax || 0) / 100) *
        (i.product.price * i.qty),
    0
  );

  const total = subtotal + taxes;

  // -----------------------------
  // ADVANCE
  // -----------------------------
  const advancePaid = Number(bill?.advancePaid) || 0;
  const safeAdvance = Math.min(advancePaid, total);
  const balanceDue = total - safeAdvance;

  // Create an immutable snapshot of the bill to use for printing/sharing.
  // This prevents later calls to `clearCart()` from making the
  // `items` array empty before we render the PDF/image.
  const billPayload = {
    number: billNo,
    date: billDate,
    items: items.map((i) => ({
      id: i.id,
      qty: i.qty,
      product: { ...i.product },
    })),
    subtotal,
    taxes,
    total,
    advancePaid: safeAdvance,
    balanceDue,
  };

  // -----------------------------
  // SHOP + CUSTOMER INFO
  // -----------------------------
  const shopInfo = {
    name: load("shopName", "My Shop"),
    address: load("shopAddress", ""),
    phone: load("shopPhone", ""),
    gst: load("shopGST", ""),
    logoUrl: load("logoImage", ""),
    upiId: load("upiId", ""),

    customerName: bill?.customerInfo?.customerName || "",
    vehicleNo: bill?.customerInfo?.vehicleNo || "",
    customerPhone: bill?.customerInfo?.phone || "",
    currentKm: bill?.customerInfo?.currentKm || "",
    nextOilKm: bill?.customerInfo?.nextOilKm || "",
  };

  // -----------------------------
  // FINALIZE BILL (SAVE ONCE)
  // -----------------------------
  const finalizeBill = () => {
    if (isHistory) return;

    const bills = load("bills", []);
    if (bills.find((b) => b.number === billNo)) return;

    const newBill = {
      id: uuidv4(),
      number: billNo,
      date: billDate,
      items,
      subtotal,
      taxes,
      total,
      advancePaid: safeAdvance,
      balanceDue,
      customerInfo: {
        customerName: shopInfo.customerName,
        vehicleNo: shopInfo.vehicleNo,
        phone: shopInfo.customerPhone,
        currentKm: shopInfo.currentKm,
        nextOilKm: shopInfo.nextOilKm,
      },
    };

    bills.unshift(newBill);
    save("bills", bills);

    if (safeAdvance > 0) {
      addIncomeFromBill({
        billNo,
        amount: safeAdvance,
        note: `Advance for ${billNo}`,
      });
    }

    clearCart();

    return true;
  };

  const { showToast } = useToast();

  const handleSave = () => {
    const saved = finalizeBill();
    if (saved) {
      showToast("Bill saved to history", "success");
    } else {
      showToast("Bill already saved or cannot be saved", "warning");
    }
  };

  // -----------------------------
  // SHARE IMAGE
  // -----------------------------
  const shareAsImage = async () => {
    finalizeBill();
    // give the DOM a tick so the hidden image (rendered from the snapshot)
    // is fully painted. 300ms is conservative.
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(imageRef.current, {
      backgroundColor: "#ffffff",
      scale: 1.2,
      useCORS: true,
    });

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/png")
    );

    const file = new File([blob], `${billNo}.png`, {
      type: "image/png",
    });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Invoice" });
    } else {
      alert("Sharing not supported on this device");
    }
  };

  // -----------------------------
  // PDF
  // -----------------------------
  const generatePDF = async () => {
    // Use the frozen snapshot for PDF generation so clearing the cart
    // doesn't remove the items before the PDF is rendered.
    finalizeBill();

    await generateInvoicePDF(billPayload, shopInfo);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex flex-col h-screen">
      {/* BACK */}
      <div className="p-3">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-300 hover:text-white"
        >
          ← Back
        </button>
      </div>

      {/* PREVIEW */}
      <div className="flex-1 overflow-auto p-2">
        <InvoiceScreen
          bill={{
            number: billNo,
            date: billDate,
            items,
            subtotal,
            taxes,
            total,
            advancePaid: safeAdvance,
            balanceDue,
          }}
          shop={shopInfo}
        />
      </div>

      {/* ACTION BAR */}
      <ActionBar
        onSave={handleSave}
        onGeneratePDF={generatePDF}
        onShareImage={shareAsImage}
      />

      {/* HIDDEN IMAGE FOR SHARE */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <InvoiceImage ref={imageRef} bill={billPayload} shop={shopInfo} />
      </div>
    </div>
  );
}
