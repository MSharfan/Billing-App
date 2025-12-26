import React, { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from '../utils/localStorage'
import { v4 as uuidv4 } from 'uuid'

const ProductsContext = createContext()

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => load('products', []))

  useEffect(() => {
    save('products', products)
  }, [products])

  const addProduct = (data) => {
    const product = {
      id: uuidv4(),
      ...data
    }
    setProducts(prev => [product, ...prev])
  }

  const updateProduct = (id, changes) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
