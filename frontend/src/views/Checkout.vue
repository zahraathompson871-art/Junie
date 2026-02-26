<template>
  <div class="checkout-block">
    <h2 class="text-glow">Checkout</h2>
    <form class="checkout-form">
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
          {{ item.title }} - R{{ item.price }}
        </li>
      </ul>
      <p class="total">Total: R{{ cart.total }}</p>

      <p v-if="paymentError" class="status error">{{ paymentError }}</p>

      <div class="actions" v-if="cart.items.length > 0">
        <button type="button" class="btn-glow" :disabled="startingCheckout" @click="startPayfastCheckout">
          {{ startingCheckout ? "Redirecting..." : "Pay with PayFast" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive } from "vue";
import { useCartStore } from "../stores/cart";

export default {
  name: "Checkout",
  setup() {
    const cart = useCartStore();
    const customer = reactive({ name: "", email: "", address: "" });
    return { cart, customer };
  },
  data() {
    return {
      startingCheckout: false,
      paymentError: "",
    };
  },
  mounted() {
    if (this.$route?.query?.canceled) {
      this.paymentError = "PayFast checkout was canceled.";
    }
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    },
    getToken() {
      return localStorage.getItem("token") || "";
    },
    async parseJson(response) {
      try {
        return await response.json();
      } catch {
        return {};
      }
    },
    validateCustomer() {
      if (!this.customer.name || !this.customer.email || !this.customer.address) {
        throw new Error("Please complete all customer fields before payment.");
      }
      if (!this.cart.items.length) {
        throw new Error("Your cart is empty.");
      }
    },
    async startPayfastCheckout() {
      try {
        this.validateCustomer();
        this.paymentError = "";
        this.startingCheckout = true;

        const response = await fetch(`${this.getApiBaseUrl()}/api/checkout/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`,
          },
          body: JSON.stringify({
            cartItems: this.cart.items,
            customer: this.customer,
          }),
        });

        const data = await this.parseJson(response);
        if (!response.ok || !data.paymentUrl || !data.fields) {
          throw new Error(data.message || "Failed to start PayFast checkout");
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;

        Object.entries(data.fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value ?? "");
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        this.paymentError = err.message || "Failed to start PayFast checkout";
      } finally {
        this.startingCheckout = false;
      }
    },
  },
};
</script>

<style scoped>
.checkout-block {
  background: #ffffff;
  color: #121212;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
}

.text-glow {
  color: #121212;
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
  background: #fdfdf6;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #121212;
}

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

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.btn-glow {
  background-color: #121212;
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-glow:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status.error {
  color: #a12424;
  font-weight: 600;
}
</style>
