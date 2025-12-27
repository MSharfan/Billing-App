import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="w-full text-center py-4 text-slate-400 text-sm mt-10">
      © {year} Nexus-Qadr. All rights reserved.
    </div>
  );
}
