<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Quick Notes</h5>
      <span class="meta">{{ notes.length }} notes</span>
    </div>

    <div class="add-row">
      <textarea v-model="draft" placeholder="Write a quick note..."></textarea>
      <button class="btn-add" @click="addNote">Save Note</button>
    </div>

    <ul class="items" v-if="notes.length">
      <li v-for="(note, index) in notes" :key="index">
        <p>{{ note.text }}</p>
        <div class="row2">
          <small>{{ note.date }}</small>
          <button class="btn-remove" @click="remove(index)">x</button>
        </div>
      </li>
    </ul>
    <p v-else class="empty">No notes yet.</p>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:data'],
  data() {
    return {
      notes: Array.isArray(this.data) ? [...this.data] : [],
      draft: ''
    }
  },
  watch: {
    data: {
      handler(value) {
        this.notes = Array.isArray(value) ? [...value] : []
      },
      deep: true
    },
    notes: {
      handler(value) {
        this.$emit('update:data', value)
      },
      deep: true
    }
  },
  methods: {
    addNote() {
      if (!this.draft.trim()) return
      this.notes.unshift({
        text: this.draft.trim(),
        date: new Date().toLocaleString()
      })
      this.draft = ''
    },
    remove(index) {
      this.notes.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.title { margin: 0; font-size: 15px; color: #37352f; }
.meta { font-size: 12px; color: #6f6b64; }
.add-row { display: grid; gap: 8px; margin-bottom: 10px; }
textarea { min-height: 80px; border: 1px solid #ddd8d0; border-radius: 6px; padding: 8px; background: #fbfaf8; color: #37352f; resize: vertical; }
.btn-add, .btn-remove { border: 1px solid #ddd8d0; background: #f7f5f2; border-radius: 6px; color: #37352f; padding: 6px 8px; }
.items { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
li { border: 1px solid #ebe7df; background: #fff; border-radius: 6px; padding: 8px; }
p { margin: 0 0 8px 0; font-size: 13px; color: #37352f; white-space: pre-wrap; }
.row2 { display: flex; justify-content: space-between; align-items: center; }
small { color: #8a867e; }
.empty { margin: 0; color: #8a867e; font-size: 13px; }
</style>
