import React from "react";
import {
  PlusCircleIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";
import { load } from "../utils/localStorage";


export default function Dashboard({ onGo }) {
  const logoImage = load("logoImage", "");

  return (
    <div className="p-4 max-w-lg mx-auto text-white space-y-6">
      {/* LOGO */}
      {logoImage && (
        <div className="flex justify-center mt-4">
          <div
            className="
              relative w-28 h-28
              flex items-center justify-center
              rounded-full
              shadow-[0_0_20px_rgba(56,189,248,0.6)]
              ring-2 ring-cyan-400
              ring-offset-2 ring-offset-slate-900
              hover:scale-105 transition"
          >
            <img
              src={logoImage}
              alt="Shop Logo"
              className="w-24 h-24 object-contain rounded-full"
            />
          </div>
        </div>
      )}

      {/* TITLE */}
      <div className="text-center">
        <h1 className="text-xl font-bold">High-Tech Two-Wheeler Care</h1>
        <p className="text-slate-400 text-sm mt-1">
          Fast & Easy Billing System
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* New Bill */}
        <DashboardCard
          icon={PlusCircleIcon}
          title="New Bill"
          gradient="from-blue-500 to-indigo-600"
          onClick={() => onGo("billing")}
        />

        {/* Products */}
        <DashboardCard
          icon={CubeIcon}
          title="Products"
          gradient="from-pink-500 to-rose-600"
          onClick={() => onGo("products")}
        />

        {/* Bills */}
        <DashboardCard
          icon={ClipboardDocumentListIcon}
          title="Bills"
          gradient="from-emerald-500 to-green-600"
          onClick={() => onGo("history")}
        />

        {/* Accounts */}
        <DashboardCard
          icon={BanknotesIcon}
          title="Accounts"
          gradient="from-yellow-500 to-orange-600"
          onClick={() => onGo("accounts")}
        />
      </div>

      {/* SETTINGS CARD */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => onGo("settings")}
          className="
      w-full max-w-sm
      p-5
      rounded-xl
      bg-gradient-to-br from-slate-600 to-slate-800
      shadow-lg
      hover:scale-105 active:scale-95
      transition transform"
        >
          <Cog6ToothIcon className="w-8 h-8 mx-auto mb-2 text-white" />
          <span className="font-semibold text-white">Settings</span>
        </button>
      </div>
    </div>
  );
}

/* 🔹 Reusable Card */
function DashboardCard({ icon: Icon, title, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-5 rounded-xl
        bg-gradient-to-br ${gradient}
        shadow-lg
        hover:scale-105 active:scale-95
        transition transform
        flex flex-col items-center
      `}
    >
      <Icon className="w-8 h-8 mb-2" />
      <span className="font-semibold">{title}</span>
    </button>
  );
}
