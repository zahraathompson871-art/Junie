<template>
  <div class="picture-widget">

    <!-- IMAGE CONTAINER -->
    <div class="image-wrapper">
      
      <img
        v-if="localData.src"
        :src="localData.src"
        alt="User Photo"
        class="picture-image"
      />

      <div v-else class="picture-placeholder">
        No photo uploaded
      </div>

    </div>

    <!-- BUTTONS -->
    <div class="button-group">

      <!-- CHOOSE -->
      <button class="choose-image-btn" @click="$refs.fileInput.click()">
        Choose Image
      </button>

      <!-- DELETE -->
      <button
        v-if="localData.src"
        class="delete-image-btn"
        @click="removeImage"
      >
        Delete Image
      </button>

    </div>

    <!-- HIDDEN INPUT -->
    <input
      type="file"
      accept="image/*"
      ref="fileInput"
      style="display:none"
      @change="onImageUpload"
    />

  </div>
</template>

<script>
export default {
  props: ['data'],
  emits: ['update:data'],

  data() {
    return {
      localData: {
        src: this.data?.src || ''
      }
    }
  },

  watch: {
    data: {
      deep: true,
      handler(newVal) {
        this.localData = { ...newVal }
      }
    }
  },

  methods: {
    onImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = (e) => {
        this.localData.src = e.target.result
        this.$emit('update:data', this.localData)
      }

      reader.readAsDataURL(file)
    },

    removeImage() {
      this.localData.src = ''
      this.$emit('update:data', this.localData)
    }
  }
}
</script>

<style scoped>
.picture-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-height: 300px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.picture-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
}

.picture-placeholder {
  width: 100%;
  height: 180px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(200,200,200,0.15);
  border-radius: 16px;
  font-weight:600;
  color:#555;
  font-size:14px;
}

/* BUTTON LAYOUT */
.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

/* CHOOSE BUTTON */
.choose-image-btn {
  background: linear-gradient(135deg,var(--dash-accent),var(--dash-accent-2));
  border: none;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
  box-shadow:0 4px 10px rgba(0,0,0,0.1);
}

.choose-image-btn:hover {
  transform: scale(1.03);
  filter: brightness(1.05);
}

/* DELETE BUTTON */
.delete-image-btn {
  background: #ff4b4b;
  border: none;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
  box-shadow:0 4px 10px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.delete-image-btn:hover {
  background: #ff2a2a;
  transform: scale(1.05);
}
</style>