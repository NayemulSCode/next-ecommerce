import { create } from 'zustand'

type Product = {
  id: string
  name: string
  price: number
}

type CartState = {
  cart: Product[]
  addToCart: (product: Product) => void
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
}))
