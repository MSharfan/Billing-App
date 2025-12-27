import React, { useEffect, useState } from 'react'
import { load, save } from '../utils/localStorage'
import { useToast } from "../context/ToastContext"; 

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('')
  const [storedPin, setStoredPin] = useState(() => load('pin', null))
  const [newPin, setNewPin] = useState('')
  const { showToast } = useToast();
  useEffect(() => setStoredPin(load('pin', null)), [])

  const handleSetPin = () => {
    if (newPin.length < 4) return showToast('Enter at least 4 digits','error')
    save('pin', newPin)
    setStoredPin(newPin)
    setNewPin('')
    showToast('PIN saved','success')
  }

  const handleLogin = () => {
    if (!storedPin) return showToast('Set owner PIN first in settings (bottom of app).','error')
    if (pin === storedPin) onLogin()
    else showToast('Incorrect PIN','error')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4">Owner / Staff Login</h2>

        <label className="block text-sm text-slate-300">Enter PIN</label>

        {/* wrap in a form so browsers handle the password field correctly
            and so pressing Enter submits; disable autocomplete to reduce
            unwanted autofill from browser password managers during dev */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          autoComplete="off"
          noValidate
        >
          <input
            type="password"
            name="owner-pin"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-2 w-full p-3 rounded bg-slate-900 outline-none"
            placeholder="****"
          />

          <button type="submit" className="w-full mt-4 py-3 rounded bg-accent text-slate-900 font-semibold">
            Unlock
          </button>
        </form>

        
      </div>
    </div>
  )
}
