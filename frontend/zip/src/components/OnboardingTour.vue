<template>
  <teleport to="body">
    <div v-if="visible" class="tour-overlay" @click.self="nextStep">
      <div
        v-if="hasTarget"
        class="tour-focus"
        :style="focusStyle"
        aria-hidden="true"
      ></div>

      <div
        class="tour-card"
        :style="cardStyle"
        role="dialog"
        aria-modal="true"
        aria-label="App walkthrough"
      >
        <div class="tour-progress">Step {{ currentStep + 1 }} of {{ steps.length }}</div>
        <h3 class="tour-title">{{ step.title }}</h3>
        <p class="tour-text">{{ step.text }}</p>

        <p v-if="step.routeName" class="tour-route">
          Suggested page: <strong>{{ step.routeName }}</strong>
        </p>
        <p v-if="!canAdvance" class="tour-hint">{{ stepHint }}</p>

        <div class="tour-actions">
          <button type="button" class="tour-btn ghost" @click="skipTour">Skip</button>
          <button
            v-if="step.routeName && $route.name !== step.routeName"
            type="button"
            class="tour-btn secondary"
            @click="goToStepRoute"
          >
            Go There
          </button>
          <button
            v-if="!canAdvance"
            type="button"
            class="tour-btn secondary"
            @click="markStepDone"
          >
            I Did This
          </button>
          <button type="button" class="tour-btn primary" @click="nextStep">
            {{ isLastStep ? "Finish" : "Next" }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: "OnboardingTour",
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "completed"],
  data() {
    return {
      currentStep: 0,
      targetRect: null,
      stepActionDone: false,
      steps: [
        {
          title: "Welcome to Junie",
          text: "This is your productivity workspace. You can manage tasks, notes, notebooks, and template themes from one place.",
          routeName: "Dashboard",
          selector: '[data-tour="brand"]'
        },
        {
          title: "Dashboard Widgets",
          text: "Add widgets like To-Do, Calendar, Pomodoro, and Notes. Drag to reorder and your layout autosaves.",
          routeName: "Dashboard",
          selector: '[data-tour="dashboard-add-widget"]',
          requireRouteVisit: true,
          requireTargetClick: true
        },
        {
          title: "Digital Notebooks",
          text: "Create notebooks and pages for class notes. Free plan includes one notebook; extra slots and unlimited are purchasable.",
          routeName: "Notebooks",
          selector: '[data-tour="notebooks-actions"]',
          requireRouteVisit: true
        },
        {
          title: "Marketplace Templates",
          text: "Browse premium templates, add them to cart, then checkout. Purchased templates can be applied directly to your dashboard.",
          routeName: "Marketplace",
          selector: '[data-tour="marketplace-grid"]',
          requireRouteVisit: true
        },
        {
          title: "Cart and Checkout",
          text: "Review your selected template and notebook purchases in Cart, then complete checkout to unlock them.",
          routeName: "Cart",
          selector: '[data-tour="cart-summary"]',
          requireRouteVisit: true
        },
        {
          title: "Profile and Account",
          text: "Update your profile details and keep your workspace personalized.",
          routeName: "Profile",
          selector: '[data-tour="profile-settings"]',
          requireRouteVisit: true
        }
      ]
    }
  },
  computed: {
    visible() {
      return this.modelValue
    },
    step() {
      return this.steps[this.currentStep] || this.steps[0]
    },
    isLastStep() {
      return this.currentStep >= this.steps.length - 1
    },
    hasTarget() {
      return !!this.targetRect
    },
    focusStyle() {
      if (!this.targetRect) return {}
      const pad = 8
      return {
        left: `${Math.max(8, this.targetRect.left - pad)}px`,
        top: `${Math.max(8, this.targetRect.top - pad)}px`,
        width: `${this.targetRect.width + pad * 2}px`,
        height: `${this.targetRect.height + pad * 2}px`
      }
    },
    cardStyle() {
      if (!this.targetRect) return {}
      const cardWidth = Math.min(520, window.innerWidth - 24)
      const preferBelowTop = this.targetRect.bottom + 14
      const placeAboveTop = this.targetRect.top - 220
      const top = preferBelowTop + 220 < window.innerHeight
        ? preferBelowTop
        : Math.max(12, placeAboveTop)
      const left = Math.min(
        Math.max(12, this.targetRect.left),
        Math.max(12, window.innerWidth - cardWidth - 12)
      )
      return {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`
      }
    },
    canAdvance() {
      if (this.step?.requireRouteVisit && !this.onStepRoute) return false
      if (this.step?.requireTargetClick && !this.stepActionDone) return false
      return true
    },
    onStepRoute() {
      if (!this.step?.routeName) return true
      return this.$route?.name === this.step.routeName
    },
    stepHint() {
      if (this.step?.requireRouteVisit && !this.onStepRoute) {
        return "Open the suggested page to continue."
      }
      if (this.step?.requireTargetClick && !this.stepActionDone) {
        return "Click the highlighted area to continue."
      }
      return ""
    }
  },
  watch: {
    modelValue(next) {
      if (next) this.syncSpotlight()
    },
    currentStep() {
      this.stepActionDone = false
      this.syncSpotlight()
    },
    "$route.fullPath"() {
      this.syncSpotlight()
    }
  },
  mounted() {
    window.addEventListener("resize", this.syncSpotlight)
    window.addEventListener("scroll", this.syncSpotlight, true)
    document.addEventListener("click", this.handleDocumentClick, true)
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.syncSpotlight)
    window.removeEventListener("scroll", this.syncSpotlight, true)
    document.removeEventListener("click", this.handleDocumentClick, true)
  },
  methods: {
    nextStep() {
      if (!this.canAdvance) return
      if (this.isLastStep) {
        this.finishTour()
        return
      }
      this.currentStep += 1
      this.$nextTick(() => this.syncSpotlight())
    },
    skipTour() {
      this.finishTour()
    },
    finishTour() {
      this.$emit("update:modelValue", false)
      this.$emit("completed")
      this.currentStep = 0
      this.targetRect = null
      this.stepActionDone = false
    },
    goToStepRoute() {
      if (!this.step?.routeName) return
      this.$router.push({ name: this.step.routeName }).finally(() => {
        this.$nextTick(() => this.syncSpotlight())
      })
    },
    markStepDone() {
      this.stepActionDone = true
    },
    handleDocumentClick(event) {
      if (!this.visible) return
      if (!this.step?.requireTargetClick) return
      const selector = this.step?.selector
      if (!selector) return
      const target = document.querySelector(selector)
      if (!target) return
      if (target.contains(event.target)) {
        this.stepActionDone = true
      }
    },
    syncSpotlight() {
      if (!this.visible) return
      const selector = this.step?.selector
      if (!selector) {
        this.targetRect = null
        return
      }
      requestAnimationFrame(() => {
        const el = document.querySelector(selector)
        if (!el) {
          this.targetRect = null
          return
        }
        el.scrollIntoView({ block: "center", behavior: "smooth" })
        const rect = el.getBoundingClientRect()
        this.targetRect = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom
        }
      })
    }
  }
}
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(20, 28, 54, 0.45);
  display: block;
  padding: 16px;
}

.tour-card {
  border-radius: 16px;
  background: #fff;
  border: 1px solid #dce5ff;
  box-shadow: 0 24px 60px rgba(20, 38, 88, 0.3);
  padding: 18px;
  z-index: 2;
}

.tour-focus {
  position: fixed;
  border-radius: 12px;
  border: 2px solid rgba(151, 175, 255, 0.95);
  box-shadow: 0 0 0 9999px rgba(20, 28, 54, 0.45), 0 0 0 4px rgba(255, 255, 255, 0.32);
  pointer-events: none;
  z-index: 1;
}

.tour-progress {
  color: #6171a8;
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.tour-title {
  margin: 0 0 8px;
  color: #1b2345;
  font-size: 1.2rem;
}

.tour-text {
  margin: 0;
  color: #44517d;
  line-height: 1.5;
}

.tour-route {
  margin: 12px 0 0;
  color: #2f3f72;
}

.tour-hint {
  margin: 8px 0 0;
  color: #a4622c;
  font-weight: 700;
  font-size: 0.92rem;
}

.tour-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.tour-btn {
  border-radius: 10px;
  border: 1px solid transparent;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}

.tour-btn.ghost {
  background: #fff;
  border-color: #d2dcff;
  color: #4b5f98;
}

.tour-btn.secondary {
  background: #eef3ff;
  color: #3452a8;
  border-color: #c7d7ff;
}

.tour-btn.primary {
  background: linear-gradient(135deg, #4a6cff, #6f86ff);
  color: #fff;
}
</style>
