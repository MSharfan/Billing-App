import React, { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from '../utils/localStorage'
import { v4 as uuidv4 } from 'uuid'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => load('cart', []))
  useEffect(() => save('cart', cart), [cart])

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const found = prev.find(i => i.product.id === product.id)
      if (found) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [{ id: uuidv4(), product, qty }, ...prev]
    })
  }

  const updateQty = (itemId, qty) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i))
  }

  const removeItem = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
