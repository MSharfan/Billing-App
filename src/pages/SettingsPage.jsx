import React, { useEffect, useState } from "react";
import { load, save, remove } from "../utils/localStorage";
import { useToast } from "../context/ToastContext";
import { updateFavicon } from "../utils/favicon";
import BackupPanel from "../components/Backup/BackupPanel";

export default function SettingsPage({ onBack, onPinChange }) {
  const { showToast } = useToast();

  const [shopName, setShopName] = useState(() => load("shopName", ""));
  const [shopAddress, setShopAddress] = useState(() => load("shopAddress", ""));
  const [shopPhone, setShopPhone] = useState(() => load("shopPhone", ""));
  const [shopGST, setShopGST] = useState(() => load("shopGST", ""));
  const [upiId, setUpiId] = useState(() => load("upiId", ""));
  // ownerPin is an optional 4+ digit PIN; store null when not set
  const [ownerPin, setOwnerPin] = useState(() => load("pin", null) || "");
  const [logoImage, setLogoImage] = useState(() => load("logoImage", ""));

  // Apply favicon on load / refresh
  useEffect(() => {
    if (logoImage) updateFavicon(logoImage);
  }, [logoImage]);

  // ------------------------
  // SAVE SETTINGS
  // ------------------------
  const saveSettings = () => {
    if (!shopName.trim()) {
      showToast("Shop name is required", "error");
      return;
    }

    if (shopPhone && !/^[0-9]{6,15}$/.test(shopPhone)) {
      showToast("Enter a valid phone number", "error");
      return;
    }

    if (ownerPin && !/^[0-9]{4,}$/.test(ownerPin)) {
      showToast("PIN must be 4+ digits", "error");
      return;
    }

    save("shopName", shopName.trim());
    save("shopAddress", shopAddress.trim());
    save("shopPhone", shopPhone);
    save("shopGST", shopGST.toUpperCase());
    save("upiId", upiId.trim());
    save("logoImage", logoImage);

    if (ownerPin) save("pin", ownerPin);
    else remove("pin");

    // notify parent (App) that pin presence changed so it can lock/unlock
    if (typeof onPinChange === "function") onPinChange(Boolean(ownerPin));

    showToast("Settings Saved Successfully", "success");
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

      {/* LOGO UPLOAD */}
      <div className="space-y-2 mb-4">
        <label className="text-sm">Shop Logo</label>

        <input
          type="file"
          accept="image/*"
          className="w-full p-3 rounded bg-slate-900"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            // ✅ CORRECT: Base64 (persistent)
            const reader = new FileReader();
            reader.onload = () => {
              setLogoImage(reader.result);
              updateFavicon(reader.result);
            };
            reader.readAsDataURL(file);
          }}
        />

        {logoImage && (
          <img
            src={logoImage}
            alt="Shop Logo"
            className="h-20 mt-2 object-contain border border-slate-700 rounded"
          />
        )}
      </div>

      <div className="space-y-4">
        <input
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Shop Name"
        />

        <textarea
          value={shopAddress}
          onChange={(e) => setShopAddress(e.target.value)}
          className="w-full p-3 h-20 rounded bg-slate-900"
          placeholder="Shop Address"
        />

        <input
          value={shopPhone}
          onChange={(e) =>
            setShopPhone(e.target.value.replace(/\D/g, ""))
          }
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Phone Number"
        />

        <input
          value={shopGST}
          onChange={(e) => setShopGST(e.target.value.toUpperCase())}
          className="w-full p-3 rounded bg-slate-900"
          placeholder="GST Number (Optional)"
        />

        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full p-3 rounded bg-slate-900"
          placeholder="UPI ID"
        />

        <input
          value={ownerPin}
          onChange={(e) =>
            setOwnerPin(e.target.value.replace(/\D/g, ""))
          }
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Owner PIN"
        />

        <button
          onClick={saveSettings}
          className="w-full py-3 rounded bg-accent text-slate-900 font-semibold"
        >
          Save Settings
        </button>
      </div>

      {/* BACKUP PANEL */}
      <BackupPanel />
    </div>
  );
}
