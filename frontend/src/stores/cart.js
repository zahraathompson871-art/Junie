import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    count: (state) => state.items.length,
    total: (state) => state.items.reduce((sum, item) => sum + item.price, 0)
  },
  actions: {
    addItem(product) {
      this.items.push(product)
    },
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    },
    clearCart() {
      this.items = []
    }
  }
})
