const InvoiceScreen = ({ bill, shop }) => {
  return (
    <div className="max-w-md mx-auto bg-white text-black rounded-xl shadow overflow-hidden">
      {/* SHOP HEADER */}
      <div className="text-center p-4 border-b">
        {shop.logoUrl && (
          <img
            src={shop.logoUrl}
            alt="Shop Logo"
            className="h-12 mx-auto object-contain mb-2"
          />
        )}

        <h2 className="font-bold text-lg">{shop.name}</h2>

        {shop.address && (
          <p className="text-xs text-gray-600">{shop.address}</p>
        )}

        {shop.phone && (
          <p className="text-xs text-gray-600">📞 {shop.phone}</p>
        )}
      </div>

      {/* BILL META */}
      <div className="flex justify-between text-xs px-4 py-2 border-b">
        <span>Bill #{bill.number}</span>
        <span>{new Date(bill.date).toLocaleDateString("en-IN")}</span>
      </div>

      {/* CUSTOMER INFO */}
      <div className="px-4 py-2 text-xs border-b space-y-1">
        {shop.customerName && (
          <div>
            <strong>Customer:</strong> {shop.customerName}
          </div>
        )}

        {shop.vehicleNo && (
          <div>
            <strong>Vehicle:</strong> {shop.vehicleNo}
          </div>
        )}

        {shop.customerPhone && (
          <div>
            <strong>Phone:</strong> {shop.customerPhone}
          </div>
        )}

        {(shop.currentKm || shop.nextOilKm) && (
          <div className="flex justify-between">
            {shop.currentKm && (
              <span>
                <strong>Present Km:</strong> {shop.currentKm}
              </span>
            )}
            {shop.nextOilKm && (
              <span>
                <strong>Oil Change At:</strong> {shop.nextOilKm}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ITEM TABLE HEADER */}
      <div className="grid grid-cols-5 gap-1 px-3 py-2 text-xs font-semibold bg-gray-100 border-b">
        <span className="col-span-2">Item</span>
        <span className="text-center">Tax</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {/* ITEMS */}
      <div className="px-3 text-xs">
        {bill.items.map((item, i) => {
          const price = item.product.price;
          const qty = item.qty;
          const tax = item.product.tax || 0;
          const lineTotal = price * qty;

          return (
            <div
              key={i}
              className="grid grid-cols-5 gap-1 py-2 border-b last:border-b-0"
            >
              <span className="col-span-2">{item.product.name}</span>
              <span className="text-center">{tax}%</span>
              <span className="text-center">{qty}</span>
              <span className="text-right">
                ₹{lineTotal.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* TOTALS */}
      <div className="px-4 py-3 border-t text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{bill.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹{bill.taxes.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{bill.total.toFixed(2)}</span>
        </div>

        {bill.advancePaid > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <span>Advance Paid</span>
              <span>- ₹{bill.advancePaid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-base">
              <span>Balance Due</span>
              <span>₹{bill.balanceDue.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* UPI */}
      {shop.upiId && (
        <div className="text-center text-xs p-3 border-t">
          Pay via UPI: {shop.upiId}
        </div>
      )}
    </div>
  );
};

export default InvoiceScreen;
