<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">✎</span>
        <h5 class="widget-title">Quick Notes</h5>
      </div>
      <span class="note-count">{{ notes.length }}</span>
    </div>

    <div class="compose-area">
      <textarea
        v-model="draft"
        @keydown.meta.enter="addNote"
        @keydown.ctrl.enter="addNote"
        placeholder="Jot something down..."
        class="compose-input"
        rows="3"
      ></textarea>
      <div class="compose-footer">
        <span class="hint">⌘↵ to save</span>
        <button class="save-btn" @click="addNote" :disabled="!draft.trim()">Save</button>
      </div>
    </div>

    <div class="notes-list" v-if="notes.length">
      <div class="note-card" v-for="(note, i) in notes" :key="i">
        <p class="note-text">{{ note.text }}</p>
        <div class="note-footer">
          <span class="note-time">{{ note.date }}</span>
          <button class="note-delete" @click="notes.splice(i, 1)">Delete</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">Your notes will appear here</div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Array, default: () => [] } },
  emits: ['update:data'],
  data() {
    return { notes: Array.isArray(this.data) ? [...this.data] : [], draft: '' }
  },
  watch: {
    data: { handler(v) { this.notes = Array.isArray(v) ? [...v] : [] }, deep: true },
    notes: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  methods: {
    addNote() {
      if (!this.draft.trim()) return
      this.notes.unshift({ text: this.draft.trim(), date: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })
      this.draft = ''
    }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #f0f7ff; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #3070c0; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.note-count { width: 22px; height: 22px; border-radius: 50%; background: #f0ede8; font-size: 11px; font-weight: 700; color: #8a867e; display: flex; align-items: center; justify-content: center; }
.compose-area { border: 1.5px solid #eeecea; border-radius: 12px; overflow: hidden; background: #faf9f7; transition: border-color 0.15s; }
.compose-area:focus-within { border-color: #3d3a35; background: #fff; }
.compose-input { width: 100%; border: none; background: transparent; padding: 12px 14px; font-size: 13.5px; color: #2e2c29; resize: none; outline: none; font-family: inherit; line-height: 1.5; box-sizing: border-box; }
.compose-input::placeholder { color: #c0bbb5; }
.compose-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-top: 1px solid #eeecea; }
.hint { font-size: 11px; color: #c0bbb5; }
.save-btn { padding: 5px 14px; background: #3d3a35; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.save-btn:disabled { background: #e0ddd8; color: #b0aba3; cursor: not-allowed; }
.save-btn:not(:disabled):hover { background: #2a2823; }
.notes-list { display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; }
.note-card { background: #faf9f7; border: 1px solid #eeecea; border-radius: 10px; padding: 12px; transition: background 0.15s; }
.note-card:hover { background: #f5f3f0; }
.note-text { margin: 0 0 8px 0; font-size: 13px; color: #3a3835; line-height: 1.5; white-space: pre-wrap; }
.note-footer { display: flex; align-items: center; justify-content: space-between; }
.note-time { font-size: 11px; color: #b0aba3; }
.note-delete { font-size: 11px; color: #c0bbb5; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.15s; }
.note-delete:hover { color: #b05050; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #c0bbb5; font-size: 13px; }
</style>