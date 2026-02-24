<template>
  <div class="checkout-block">
    <h2 class="text-glow">Checkout</h2>
    <form @submit.prevent="placeOrder" class="checkout-form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input v-model="customer.name" id="name" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="customer.email" id="email" type="email" required />
      </div>

      <div class="form-group">
        <label for="address">Address</label>
        <input v-model="customer.address" id="address" required />
      </div>

      <h3 class="text-glow">Order Summary</h3>
      <ul>
        <li v-for="item in cart.items" :key="item.id">
          {{ item.title }} - R{{ item.price }} × {{ item.quantity }}
        </li>
      </ul>
      <p class="total">Total: R{{ cart.total }}</p>

      <button type="submit" class="btn-glow">Place Order</button>
    </form>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  name: "Checkout",
  setup() {
    const cart = useCartStore()
    const customer = { name: '', email: '', address: '' }

    const placeOrder = () => {
      console.log("Order placed:", customer, cart.items)

      window.location.href = "/thankyou"
    }

    return { cart, customer, placeOrder }
  }
}
</script>

<style scoped>
.checkout-block {
  background: #ffffff; /* white card */
  color: #121212;      /* black text */
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: auto;
}

.text-glow {
  color: #121212; /* black accent */
  font-weight: 600;
}

.checkout-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #121212;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  background: #fdfdf6; /* cream input background */
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #121212;
}

input:focus {
  border-color: #121212;
  outline: none;
}

/* Order Summary */
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 5px 0;
  color: #121212;
}

.total {
  font-weight: bold;
  margin-top: 10px;
  color: #121212;
}

/* Buttons */
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}
</style>
