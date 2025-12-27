import React, { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";

const InvoiceImage = forwardRef(({ bill, shop }, ref) => {
  const [qrSrc, setQrSrc] = useState("");

  /* -----------------------------
     QR CODE (BALANCE ONLY)
  ----------------------------- */
  useEffect(() => {
    if (!shop?.upiId) {
      setQrSrc("");
      return;
    }

    const total = Number(bill.total) || 0;
    const advance = Number(bill.advancePaid) || 0;
    const balance = Math.max(0, total - advance);

    if (balance <= 0) {
      setQrSrc("");
      return;
    }

    const upiString = `upi://pay?pa=${shop.upiId}&am=${balance}&cu=INR`;

    QRCode.toDataURL(
      upiString,
      {
        width: 300,
        margin: 1,
        errorCorrectionLevel: "M",
      },
      (err, url) => {
        if (!err) setQrSrc(url);
      }
    );
  }, [shop?.upiId, bill.total, bill.advancePaid]);

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        color: "#000",
        padding: "40px",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {shop.logoUrl && shop.logoUrl.startsWith("data:image") && (
            <img
              src={shop.logoUrl}
              alt="Logo"
              style={{ height: "70px", objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div>
            <h1 style={{ margin: 0, fontSize: "22px" }}>{shop.name}</h1>
            {shop.address && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                {shop.address}
              </p>
            )}
            {shop.phone && (
              <p style={{ margin: 0, fontSize: "13px" }}>
                Phone: {shop.phone}
              </p>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: "13px" }}>
          <h2 style={{ margin: 0, color: "#0b6cb8" }}>INVOICE</h2>
          <p style={{ margin: "6px 0" }}>
            <strong>Bill No:</strong> {bill.number}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Date:</strong>{" "}
            {new Date(bill.date).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
          fontSize: "13px",
        }}
      >
        <div>
          {shop.customerName && (
            <p>
              <strong>Customer name:</strong> {shop.customerName}
            </p>
          )}
          {shop.vehicleNo && (
            <p>
              <strong>Vehicle no:</strong> {shop.vehicleNo}
            </p>
          )}
          {shop.customerPhone && (
            <p>
              <strong>Phone no:</strong> {shop.customerPhone}
            </p>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          {shop.currentKm && (
            <p>
              <strong>Current Km:</strong> {shop.currentKm}
            </p>
          )}
          {shop.nextOilKm && (
            <p>
              <strong>Oil Change at:</strong> {shop.nextOilKm}
            </p>
          )}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "30px",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ background: "#0b6cb8", color: "#fff" }}>
            <th style={thStyle}>DESCRIPTION</th>
            <th style={thStyle}>TAX %</th>
            <th style={thStyle}>QTY</th>
            <th style={thStyle}>PRICE</th>
            <th style={thStyle}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, i) => {
            const price = item.product.price;
            const qty = item.qty;
            const total = price * qty;

            return (
              <tr key={i}>
                <td style={tdStyle}>{item.product.name}</td>
                <td style={tdStyle}>{item.product.tax || 0}%</td>
                <td style={tdStyle}>{qty}</td>
                <td style={tdStyle}>{price.toFixed(2)}</td>
                <td style={tdStyle}>{total.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: "20px", textAlign: "right", fontSize: "14px" }}>
        <div>
          <strong>Total:</strong> ₹{bill.total.toFixed(2)}
        </div>

        {bill.advancePaid > 0 && (
          <>
            <div style={{ color: "green" }}>
              <strong>Advance Paid:</strong> − ₹
              {bill.advancePaid.toFixed(2)}
            </div>
            <div style={{ fontSize: "16px" }}>
              <strong>Balance Due:</strong> ₹
              {bill.balanceDue.toFixed(2)}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "60px",
        }}
      >
        <p style={{ fontSize: "13px" }}>
          THANK YOU FOR YOUR BUSINESS!
        </p>

        {qrSrc && (
          <div style={{ textAlign: "center" }}>
            <img
              src={qrSrc}
              alt="UPI QR"
              style={{
                width: "130px",
                height: "130px",
                border: "2px solid #cce6ea",
              }}
            />
            <p style={{ fontSize: "11px", marginTop: "6px" }}>
              QR CODE
              <br />
              SCAN TO PAY
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

const thStyle = {
  padding: "8px",
  border: "1px solid #999",
  textAlign: "center",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #999",
  textAlign: "center",
};

export default InvoiceImage;
