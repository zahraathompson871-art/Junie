<template>
  <div class="widget" :class="{ 'has-image': data.src }">
    <div v-if="data.src" class="photo-frame">
      <img :src="data.src" alt="Photo" class="photo" />
      <div class="photo-overlay">
        <label class="change-btn">
          <svg viewBox="0 0 16 16" fill="none"><path d="M13 10v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2M8 2v8M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Change
          <input type="file" @change="onFile" accept="image/*" />
        </label>
      </div>
    </div>

    <div v-else class="upload-zone">
      <label class="upload-label">
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="upload-title">Add a photo</span>
        <span class="upload-hint">Click to browse</span>
        <input type="file" @change="onFile" accept="image/*" />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Object, default: () => ({ src: '' }) } },
  emits: ['update:data'],
  methods: {
    onFile(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => this.$emit('update:data', { src: ev.target.result })
      reader.readAsDataURL(file)
    }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; border: 1px solid #eeecea; overflow: hidden; height: 100%; box-sizing: border-box; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; min-height: 200px; }
.photo-frame { position: relative; width: 100%; height: 100%; min-height: 200px; }
.photo { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%); display: flex; align-items: flex-end; padding: 16px; opacity: 0; transition: opacity 0.2s; }
.photo-frame:hover .photo-overlay { opacity: 1; }
.change-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(255,255,255,0.9); backdrop-filter: blur(6px); border-radius: 8px; font-size: 12.5px; font-weight: 600; color: #2e2c29; cursor: pointer; transition: background 0.15s; }
.change-btn:hover { background: #fff; }
.change-btn svg { width: 14px; height: 14px; }
.change-btn input { display: none; }
.upload-zone { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px; background: #faf9f7; }
.upload-label { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; padding: 32px; text-align: center; transition: all 0.15s; border-radius: 12px; }
.upload-label:hover { background: #f0ede8; }
.upload-label input { display: none; }
.upload-icon { width: 48px; height: 48px; border-radius: 14px; background: #eeecea; display: flex; align-items: center; justify-content: center; color: #8a867e; margin-bottom: 4px; }
.upload-icon svg { width: 24px; height: 24px; }
.upload-title { font-size: 14px; font-weight: 600; color: #3a3835; }
.upload-hint { font-size: 12px; color: #b0aba3; }
</style>