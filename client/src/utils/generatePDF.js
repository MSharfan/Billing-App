import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateInvoicePDF(bill, shop) {
  const doc = new jsPDF("p", "mm", "a4");

  // PAGE CONSTANTS
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  // right margin used for right-aligned text (larger -> moves text further left)
  // Increase to move the totals/metadata slightly left so they don't get clipped.
  const RIGHT_MARGIN = 25;

  let y = 15;

  // -----------------------------
  // LOGO
  // -----------------------------
  if (shop.logoUrl) {
    try {
      const img = await loadImage(shop.logoUrl);
      doc.addImage(img, "PNG", 15, y, 25, 18);
    } catch (e) {
      console.warn("Logo load failed", e);
    }
  }

  // -----------------------------
  // SHOP INFO (LEFT)
  // -----------------------------
  doc.setFontSize(16);
  doc.text(shop.name || "", 45, y + 6);

  doc.setFontSize(10);
  doc.text(shop.address || "", 45, y + 12);
  doc.text(`Phone: ${shop.phone || ""}`, 45, y + 17);

  // -----------------------------
  // INVOICE META (RIGHT)
  // -----------------------------
  doc.setFontSize(14);
  doc.setTextColor(11, 108, 184);
  doc.text("INVOICE", PAGE_WIDTH - RIGHT_MARGIN, y + 6, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Bill No: ${bill.number}`, PAGE_WIDTH - RIGHT_MARGIN, y + 12, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(bill.date).toLocaleDateString("en-IN")}`,
    PAGE_WIDTH - RIGHT_MARGIN,
    y + 17,
    { align: "right" }
  );

  y += 35;

  // -----------------------------
  // CUSTOMER INFO
  // -----------------------------
  doc.setFontSize(10);
  doc.text(`Customer name: ${shop.customerName || ""}`, 15, y);
  doc.text(`Vehicle no: ${shop.vehicleNo || ""}`, 15, y + 6);
  doc.text(`Phone no: ${shop.customerPhone || ""}`, 15, y + 12);

  doc.text(`Current Km: ${shop.currentKm || ""}`, PAGE_WIDTH - RIGHT_MARGIN, y, {
    align: "right",
  });
  doc.text(
    `Oil Change at: ${shop.nextOilKm || ""}`,
    PAGE_WIDTH - RIGHT_MARGIN,
    y + 6,
    { align: "right" }
  );

  y += 20;

  // -----------------------------
  // ITEMS TABLE
  // -----------------------------
  autoTable(doc, {
    startY: y,
    head: [["DESCRIPTION", "TAX %", "QNTY", "PRICE", "TOTAL"]],
    body: bill.items.map((item) => {
      const price = item.product.price;
      const qty = item.qty;
      const tax = item.product.tax || 0;
      const total = price * qty;

      return [
        item.product.name,
        `${tax}%`,
        qty,
        price.toFixed(2),
        total.toFixed(2),
      ];
    }),
    styles: {
      fontSize: 10,
      halign: "center",
    },
    headStyles: {
      fillColor: [11, 108, 184],
      textColor: 255,
    },
    columnStyles: {
      0: { halign: "left" },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // -----------------------------
  // TOTAL / ADVANCE / BALANCE
  // -----------------------------
  const total = Number(bill.total) || 0;
  const advance = Number(bill.advancePaid) || 0;
  const balance = Math.max(0, total - advance);

  doc.setFontSize(12);
  doc.text(
    `TOTAL: ${total.toFixed(2)}`,
    PAGE_WIDTH - RIGHT_MARGIN,
    y,
    { align: "right" }
  );

  y += 7;

  if (advance > 0) {
    doc.setFontSize(11);
    doc.setTextColor(0, 128, 0);
    doc.text(
      `ADVANCE PAID: - ${advance.toFixed(2)}`,
      PAGE_WIDTH - RIGHT_MARGIN,
      y,
      { align: "right" }
    );

    y += 7;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `BALANCE DUE: ${balance.toFixed(2)}`,
      PAGE_WIDTH - RIGHT_MARGIN,
      y,
      { align: "right" }
    );

    y += 5;
  }

  y += 20;

  // -----------------------------
  // FOOTER + QR (BALANCE ONLY)
  // -----------------------------
  doc.setFontSize(10);
  doc.text("THANK YOU FOR YOUR BUSINESS!", 15, y);

  // 🔥 QR only if something is payable
  if (shop.upiId && balance > 0) {
    const upiString = `upi://pay?pa=${shop.upiId}&am=${balance}&cu=INR`;
    const qr = await generateQR(upiString);

    doc.addImage(qr, "PNG", PAGE_WIDTH - 55, y - 5, 35, 35);
    doc.setFontSize(8);
    doc.text("QR CODE\nSCAN TO PAY", PAGE_WIDTH - 37, y + 33, {
      align: "center",
    });
  }

  doc.save(`${bill.number}.pdf`);
}

// -----------------------------
// HELPERS
// -----------------------------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function generateQR(text) {
  return import("qrcode").then(({ default: QRCode }) =>
    QRCode.toDataURL(text, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
    })
  );
}
