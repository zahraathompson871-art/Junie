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
    getItemKey(item) {
      return String(item?.cartKey || `${item?.type || 'template'}:${item?.id}`)
    },
    addItem(product) {
      const newKey = this.getItemKey(product)
      if (this.items.some(item => this.getItemKey(item) === newKey)) return
      this.items.push(product)
    },
    removeItem(identifier) {
      this.items = this.items.filter(item => this.getItemKey(item) !== String(identifier))
    },
    clearCart() {
      this.items = []
    }
  }
})
