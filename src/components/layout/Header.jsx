import React from 'react'

export default function Header({ title, right }) {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 p-4 sticky top-0 z-20">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <h1 className="text-white text-lg font-semibold">{title}</h1>
        <div>{right}</div>
      </div>
    </div>
  )
}
