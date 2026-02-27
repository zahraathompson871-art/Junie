<template>
  <div class="reader-home">
    <div class="reader-wrap">
      <header class="top-search">
        <input v-model="searchQuery" placeholder="Search" />
      </header>

      <p v-if="error" class="text-danger">{{ error }}</p>
      <p v-if="isLoadingLibrary" class="text-muted">Loading notebooks...</p>

      <section v-if="!bookWindowOpen && !isLoadingLibrary">
        <div class="section-row">
          <h3>Recently Opened Documents</h3>
          <button class="clear-btn" @click="clearRecent">Clear</button>
        </div>

        <section class="book-grid" v-if="recentBooks.length">
          <button
            v-for="book in recentBooks"
            :key="`recent-${book.id}`"
            class="book-card"
            @click="openBookWindow(book.id)"
          >
            <div class="cover" :style="coverStyle(book)">
              <span class="cover-strip"></span>
              <img v-if="bookCoverImage(book.id)" :src="bookCoverImage(book.id)" alt="" />
              <span v-else class="cover-title">{{ book.title }}</span>
              <label class="upload-cover">
                +
                <input type="file" accept="image/*" @change.stop="onCoverPicked($event, book.id)" />
              </label>
            </div>
            <span class="book-name">{{ book.title }}</span>
          </button>
        </section>

        <div class="section-row all-docs" data-tour="notebooks-actions">
          <h3>All Documents</h3>
          <div class="notebook-actions">
            <span class="limit-pill">{{ notebookLimitLabel }}</span>
            <button class="clear-btn" :disabled="!canCreateMore" @click="createNotebook()">
              {{ canCreateMore ? 'New Notebook' : 'Limit Reached' }}
            </button>
            <button v-if="!entitlement.isUnlimited" class="action-btn" @click="upgradeToPremium">Upgrade to Premium</button>
          </div>
        </div>

        <section class="book-grid">
          <button
            v-for="book in otherBooks"
            :key="book.id"
            class="book-card"
            @click="openBookWindow(book.id)"
          >
            <div class="cover" :style="coverStyle(book)">
              <span class="cover-strip"></span>
              <img v-if="bookCoverImage(book.id)" :src="bookCoverImage(book.id)" alt="" />
              <span v-else class="cover-title">{{ book.title }}</span>
              <label class="upload-cover">
                +
                <input type="file" accept="image/*" @change.stop="onCoverPicked($event, book.id)" />
              </label>
            </div>
            <span class="book-name">{{ book.title }}</span>
          </button>
        </section>

        <p v-if="!searchedBooks.length" class="empty-books">
          No notebooks yet. Click <b>New Notebook</b> to create your first one.
        </p>
      </section>

      <section v-else class="book-window" :class="{ opening: bookOpening }" :style="bookThemeVars">
        <div class="window-top">
          <button class="back-btn" @click="closeBookWindow">Back to Library</button>
          <h4>{{ selectedBookTitle }}</h4>
          <div class="window-actions">
            <input v-model="newPageTitle" placeholder="New page" @keydown.enter.prevent="createPage" />
            <button class="action-btn" @click="createPage">Add Page</button>
          </div>
        </div>

        <div class="book-shell">
          <aside class="pages-col">
            <button
              v-for="(page, index) in pages"
              :key="page.id"
              class="page-pill"
              :class="{ active: index === currentPageIndex }"
              @click="openPageByIndex(index)"
            >
              {{ page.title }}
            </button>
          </aside>

          <main ref="documentScroll" class="page-col document-scroll" @scroll.passive="onDocumentScroll">
            <div class="lined-page" :key="`page-${selectedPageId}`">
                <div v-if="isOpeningBook || isLoadingPage" class="inline-loading">
                  {{ isOpeningBook ? 'Opening notebook...' : 'Loading page...' }}
                </div>
                <div class="toolbar">
                  <button @click="applyFormat('bold')"><b>B</b></button>
                  <button @click="applyFormat('italic')"><i>I</i></button>
                  <button @click="applyFormat('underline')"><u>U</u></button>
                  <button @click="applyFormat('justifyLeft')">L</button>
                  <button @click="applyFormat('justifyCenter')">C</button>
                  <button @click="applyFormat('justifyRight')">R</button>
                </div>

              <div class="page-title-row">
                <input class="page-title" v-model="selectedPageTitle" @blur="savePageTitle" />
                <span class="page-index">Page {{ currentPageIndex + 1 }} / {{ pages.length || 1 }}</span>
              </div>

                <div class="document-area" v-if="selectedPageId">
                  <div
                    class="doc-editor"
                    ref="docEditor"
                    contenteditable="true"
                    :style="{ textAlign: documentAlignment }"
                    @focus="activeEditorIndex = 0"
                    @input="onDocumentInput($event)"
                    @blur="saveDocument"
                  ></div>
              </div>
              <p v-else class="empty">Create or select a page.</p>
            </div>
          </main>
        </div>
      </section>

      <transition name="toast-fade">
        <div v-if="toast.visible" class="toast-msg" :class="toast.type">{{ toast.message }}</div>
      </transition>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    return { cart }
  },
  data() {
    return {
      searchQuery: '',
      workspaces: [],
      books: [],
      pages: [],
      blocks: [],
      selectedWorkspaceId: null,
      selectedBookId: null,
      selectedPageId: null,
      selectedPageTitle: '',
      newPageTitle: '',
      error: '',
      recentBookIds: [],
      bookCovers: {},
      bookWindowOpen: false,
      bookOpening: false,
      currentPageIndex: 0,
      activeEditorIndex: null,
      pageScrollPositions: {},
      documentHtml: '',
      primaryBlockId: null,
      documentAlignment: 'left',
      isLoadingLibrary: false,
      isOpeningBook: false,
      isLoadingPage: false,
      entitlement: {
        used: 0,
        baseLimit: 1,
        extraSlots: 0,
        isUnlimited: false,
        totalLimit: 1,
        remaining: 1
      },
      toast: {
        visible: false,
        message: '',
        type: 'success'
      },
      toastTimer: null
    }
  },
  beforeUnmount() {
    if (this.toastTimer) clearTimeout(this.toastTimer)
  },
  computed: {
    searchedBooks() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return this.books
      return this.books.filter(b => String(b.title || '').toLowerCase().includes(q))
    },
    recentBooks() {
      if (!this.recentBookIds.length) return []
      const idSet = new Set(this.recentBookIds.map(Number))
      return this.searchedBooks.filter(b => idSet.has(Number(b.id)))
    },
    otherBooks() {
      const recentSet = new Set(this.recentBooks.map(b => Number(b.id)))
      return this.searchedBooks.filter(b => !recentSet.has(Number(b.id)))
    },
    selectedBookTitle() {
      const book = this.books.find(b => Number(b.id) === Number(this.selectedBookId))
      return book?.title || 'Notebook'
    },
    canCreateMore() {
      if (this.entitlement.isUnlimited) return true
      return Number(this.entitlement.remaining || 0) > 0
    },
    notebookLimitLabel() {
      if (this.entitlement.isUnlimited) {
        return `Premium: Unlimited notebooks`
      }
      return `Free Plan: ${this.entitlement.used}/1 notebook`
    },
    bookThemeVars() {
      const book = this.books.find(b => Number(b.id) === Number(this.selectedBookId))
      const [c1, c2, c3] = this.getBookPalette(book)
      return {
        '--nb-shell-bg': c2,
        '--nb-shell-border': c3,
        '--nb-side-bg': c1,
        '--nb-side-border': c3,
        '--nb-side-active': c2
      }
    }
  },
  async mounted() {
    this.loadLocalPrefs()
    await this.bootstrap()
  },
  methods: {
    upgradeToPremium() {
      this.cart.addItem({
        id: 'premium-monthly',
        cartKey: 'premium_subscription:premium-monthly',
        type: 'premium_subscription',
        title: 'Premium Plan (Monthly)',
        price: 149,
        image: ''
      })
      this.$router.push('/checkout')
    },
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    getToken() {
      return localStorage.getItem('token') || ''
    },
    authHeaders() {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`
      }
    },
    async parseJson(res) {
      try {
        return await res.json()
      } catch {
        return {}
      }
    },
    loadLocalPrefs() {
      const recent = localStorage.getItem('notebookRecentBookIds')
      if (recent) {
        try {
          this.recentBookIds = JSON.parse(recent)
        } catch {
          this.recentBookIds = []
        }
      }
      const covers = localStorage.getItem('notebookBookCovers')
      if (covers) {
        try {
          this.bookCovers = JSON.parse(covers)
        } catch {
          this.bookCovers = {}
        }
      }
      const scrollMap = localStorage.getItem('notebookPageScrollPositions')
      if (scrollMap) {
        try {
          this.pageScrollPositions = JSON.parse(scrollMap)
        } catch {
          this.pageScrollPositions = {}
        }
      }
    },
    saveLocalPrefs() {
      localStorage.setItem('notebookRecentBookIds', JSON.stringify(this.recentBookIds.slice(0, 12)))
      localStorage.setItem('notebookBookCovers', JSON.stringify(this.bookCovers))
      localStorage.setItem('notebookPageScrollPositions', JSON.stringify(this.pageScrollPositions))
    },
    notify(message, type = 'success') {
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toast = { visible: true, message, type }
      this.toastTimer = setTimeout(() => {
        this.toast.visible = false
      }, 1800)
    },
    async bootstrap() {
      if (!this.getToken()) {
        this.error = 'Please login to use notebooks.'
        return
      }
      this.isLoadingLibrary = true
      await this.loadWorkspaces()
      if (!this.workspaces.length) await this.createDefaultWorkspace()
      if (this.workspaces.length) await this.selectWorkspace(this.workspaces[0].id)
      await this.loadNotebookEntitlement()
      this.isLoadingLibrary = false
    },
    async loadNotebookEntitlement() {
      const res = await fetch(`${this.getApiBaseUrl()}/api/books/entitlements/me`, { headers: this.authHeaders() })
      const data = await this.parseJson(res)
      if (!res.ok) return
      const isUnlimited = Boolean(data.isUnlimited)
      const used = Number(data.used || 0)
      const totalLimit = isUnlimited ? null : 1
      this.entitlement = {
        used,
        baseLimit: 1,
        extraSlots: 0,
        isUnlimited,
        totalLimit,
        remaining: isUnlimited ? null : Math.max(0, 1 - used)
      }
    },
    async createDefaultWorkspace() {
      const res = await fetch(`${this.getApiBaseUrl()}/api/workspaces`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ name: 'My Notebooks', plan: 'free' })
      })
      if (res.ok) await this.loadWorkspaces()
    },
    async loadWorkspaces() {
      this.error = ''
      const res = await fetch(`${this.getApiBaseUrl()}/api/workspaces`, { headers: this.authHeaders() })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to load workspaces'
        return
      }
      this.workspaces = Array.isArray(data) ? data : []
    },
    async selectWorkspace(id) {
      this.selectedWorkspaceId = id
      this.selectedBookId = null
      this.selectedPageId = null
      this.pages = []
      this.blocks = []
      await this.loadBooks(id)
      await this.loadNotebookEntitlement()
    },
    async loadBooks(workspaceId) {
      const res = await fetch(`${this.getApiBaseUrl()}/api/books/workspace/${workspaceId}`, { headers: this.authHeaders() })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to load books'
        return
      }
      this.books = Array.isArray(data) ? data : []
    },
    async openBookWindow(id) {
      this.selectedBookId = id
      this.selectedPageId = null
      this.blocks = []
      this.currentPageIndex = 0
      this.bookWindowOpen = true
      this.bookOpening = true
      this.isOpeningBook = true
      setTimeout(() => {
        this.bookOpening = false
      }, 850)
      this.recentBookIds = [Number(id), ...this.recentBookIds.filter(x => Number(x) !== Number(id))]
      this.saveLocalPrefs()
      await this.loadPages(id)
      if (this.pages.length) await this.openPageByIndex(0)
      this.isOpeningBook = false
    },
    closeBookWindow() {
      this.storeCurrentPageScroll()
      this.bookWindowOpen = false
      this.selectedPageId = null
      this.blocks = []
      this.activeEditorIndex = null
    },
    async createNotebook(title = '') {
      if (!this.selectedWorkspaceId) return
      const baseTitle = title?.trim() || this.getNextNotebookTitle()
      const res = await fetch(`${this.getApiBaseUrl()}/api/books`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ workspaceId: this.selectedWorkspaceId, title: baseTitle })
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        if (data?.code === 'NOTEBOOK_LIMIT_REACHED') {
          this.error = data.error || 'Notebook limit reached'
          if (data.entitlement) this.entitlement = data.entitlement
          this.notify('Free plan allows 1 notebook. Upgrade to Premium for unlimited notebooks.', 'error')
        } else {
          this.error = data.error || 'Failed to create notebook'
        }
        return null
      }
      await this.loadBooks(this.selectedWorkspaceId)
      await this.loadNotebookEntitlement()
      this.notify('Notebook created')
      return data
    },
    getNextNotebookTitle() {
      const usedNumbers = this.books
        .map(book => {
          const match = String(book?.title || '').match(/^Notebook\s+(\d+)$/i)
          return match ? Number(match[1]) : null
        })
        .filter(n => Number.isFinite(n) && n > 0)

      const max = usedNumbers.length ? Math.max(...usedNumbers) : 0
      return `Notebook ${max + 1}`
    },
    async loadPages(bookId) {
      const res = await fetch(`${this.getApiBaseUrl()}/api/pages/book/${bookId}`, { headers: this.authHeaders() })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to load pages'
        return
      }
      this.pages = Array.isArray(data) ? data : []
    },
    async openPageByIndex(index) {
      if (index < 0 || index >= this.pages.length) return
      this.storeCurrentPageScroll()
      this.isLoadingPage = true
      this.currentPageIndex = index
      const id = this.pages[index].id
      this.selectedPageId = id
      this.selectedPageTitle = this.pages[index]?.title || ''
      await this.loadBlocks(id)
      this.$nextTick(() => {
        this.activeEditorIndex = null
        this.syncEditorFromState()
        this.restoreCurrentPageScroll()
      })
      this.isLoadingPage = false
    },
    async loadBlocks(pageId) {
      const res = await fetch(`${this.getApiBaseUrl()}/api/blocks/page/${pageId}`, { headers: this.authHeaders() })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to load blocks'
        return
      }
      this.blocks = (Array.isArray(data) ? data : []).map(b => ({
        ...b,
        content: this.normalizeContent(b.content)
      }))
      if (!this.blocks.length) {
        const created = await this.createPrimaryBlock()
        if (created) {
          this.blocks = [{ ...created, content: this.normalizeContent(created.content) }]
        }
      }
      const first = this.blocks[0]
      this.primaryBlockId = first?.id || null
      this.documentHtml = first?.content?.html || ''
      this.documentAlignment = first?.content?.align || 'left'
      this.$nextTick(() => this.syncEditorFromState())
    },
    normalizeContent(content) {
      if (typeof content === 'string') return { html: content, align: 'left' }
      if (content && typeof content === 'object' && typeof content.html === 'string') {
        return { html: content.html, align: content.align || 'left' }
      }
      if (content && typeof content === 'object' && typeof content.text === 'string') {
        return { html: content.text, align: content.align || 'left' }
      }
      return { html: '', align: 'left' }
    },
    async createPage() {
      if (!this.selectedBookId) return
      const baseTitle = this.newPageTitle.trim() || `Untitled Page ${this.pages.length + 1}`
      const res = await fetch(`${this.getApiBaseUrl()}/api/pages`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ bookId: this.selectedBookId, title: baseTitle })
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to create page'
        return
      }
      this.newPageTitle = ''
      await this.loadPages(this.selectedBookId)
      const createdIndex = this.pages.findIndex(p => Number(p.id) === Number(data.id))
      await this.openPageByIndex(createdIndex >= 0 ? createdIndex : this.pages.length - 1)
      this.notify('Page added')
    },
    async savePageTitle() {
      if (!this.selectedPageId) return
      const page = this.pages.find(p => Number(p.id) === Number(this.selectedPageId))
      if (!page) return
      const res = await fetch(`${this.getApiBaseUrl()}/api/pages/${this.selectedPageId}`, {
        method: 'PUT',
        headers: this.authHeaders(),
        body: JSON.stringify({ title: this.selectedPageTitle.trim() || 'Untitled Page', content: page.content || '' })
      })
      if (res.ok) {
        page.title = this.selectedPageTitle.trim() || 'Untitled Page'
        this.notify('Page title saved')
      }
    },
    async createPrimaryBlock() {
      if (!this.selectedPageId) return
      const res = await fetch(`${this.getApiBaseUrl()}/api/blocks`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          pageId: this.selectedPageId,
          type: 'paragraph',
          content: { html: '' },
          position: 0
        })
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to create block'
        return null
      }
      return data
    },
    onDocumentInput(event) {
      this.documentHtml = event.target.innerHTML
    },
    syncEditorFromState() {
      const editor = this.$refs.docEditor
      if (!editor) return
      if (editor.innerHTML !== (this.documentHtml || '')) {
        editor.innerHTML = this.documentHtml || ''
      }
    },
    async onDocumentScroll(event) {
      this.storeCurrentPageScroll(event.target)
    },
    storeCurrentPageScroll(el = null) {
      if (!this.selectedPageId) return
      const container = el || this.$refs.documentScroll
      if (!container) return
      this.pageScrollPositions[String(this.selectedPageId)] = container.scrollTop
      this.saveLocalPrefs()
    },
    restoreCurrentPageScroll() {
      if (!this.selectedPageId) return
      const container = this.$refs.documentScroll
      if (!container) return
      const y = Number(this.pageScrollPositions[String(this.selectedPageId)] || 0)
      container.scrollTop = y
    },
    async saveDocument() {
      if (!this.selectedPageId) return
      let blockId = this.primaryBlockId
      if (!blockId) {
        const created = await this.createPrimaryBlock()
        if (!created?.id) return
        blockId = created.id
        this.primaryBlockId = blockId
      }
      const res = await fetch(`${this.getApiBaseUrl()}/api/blocks/${blockId}`, {
        method: 'PUT',
        headers: this.authHeaders(),
        body: JSON.stringify({
          type: 'paragraph',
          content: { html: this.documentHtml || '', align: this.documentAlignment || 'left' },
          position: 0
        })
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to save block'
      } else {
        this.notify('Saved')
      }
    },
    applyFormat(cmd) {
      if (cmd === 'bold') this.wrapSelectionWithTag('strong')
      if (cmd === 'italic') this.wrapSelectionWithTag('em')
      if (cmd === 'underline') this.wrapSelectionWithTag('u')
      if (cmd === 'justifyLeft') this.setDocumentAlignment('left')
      if (cmd === 'justifyCenter') this.setDocumentAlignment('center')
      if (cmd === 'justifyRight') this.setDocumentAlignment('right')
      this.$nextTick(() => this.saveDocument())
    },
    wrapSelectionWithTag(tag) {
      const editor = this.$refs.docEditor
      const sel = window.getSelection()
      if (!editor || !sel || sel.rangeCount === 0) return
      if (!editor.contains(sel.anchorNode)) return
      const range = sel.getRangeAt(0)
      if (range.collapsed) return
      const text = range.toString()
      if (!text.trim()) return
      const node = document.createElement(tag)
      node.textContent = text
      range.deleteContents()
      range.insertNode(node)
      sel.removeAllRanges()
      const newRange = document.createRange()
      newRange.selectNodeContents(node)
      sel.addRange(newRange)
      this.documentHtml = editor.innerHTML
    },
    setDocumentAlignment(align) {
      this.documentAlignment = align
    },
    clearRecent() {
      this.recentBookIds = []
      this.saveLocalPrefs()
    },
    coverStyle(book) {
      const pair = this.getBookPalette(book)
      return {
        background: `linear-gradient(145deg, ${pair[0]}, ${pair[1]})`,
        '--strip': pair[2]
      }
    },
    getBookPalette(book) {
      const palettes = [
        ['#f5e8cf', '#dec3a0', '#debed4'],
        ['#f2dce3', '#d7adb9', '#c8b6dc'],
        ['#e7eed8', '#bcd2a0', '#b8c9e7'],
        ['#dce8f3', '#b1c7dd', '#c7d8b9'],
        ['#f1dfd6', '#d8b5a7', '#d6bfdc']
      ]
      const id = Number(book?.id || 0)
      return palettes[id % palettes.length]
    },
    onCoverPicked(event, bookId) {
      const file = event?.target?.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        this.bookCovers[String(bookId)] = reader.result
        this.saveLocalPrefs()
        this.notify('Cover updated')
      }
      reader.readAsDataURL(file)
      event.target.value = ''
    },
    bookCoverImage(bookId) {
      return this.bookCovers[String(bookId)] || ''
    }
  }
}
</script>

<style scoped>
.reader-home {
  min-height: calc(100vh - 60px);
  background: #f7f6f3;
  color: #1a1917;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
}

.reader-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.top-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.top-search h1 {
  margin: 0;
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1a1917;
}

.top-search input {
  width: 260px;
  border: 1.5px solid #eeecea;
  background: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.94rem;
  color: #2e2c29;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.top-search input:focus {
  border-color: #3d3a35;
}

.top-search input::placeholder { color: #c0bbb5; }

.section-row {
  border-top: 1px solid #eeecea;
  padding-top: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-row h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #a0998f;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.all-docs { margin-top: 28px; }

.notebook-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.limit-pill {
  font-size: 11.5px;
  font-weight: 600;
  color: #8a867e;
  background: #f0ede8;
  border: none;
  border-radius: 99px;
  padding: 5px 12px;
}

.clear-btn {
  font-size: 13px;
  font-weight: 600;
  color: #3d3a35;
  background: #fff;
  border: 1.5px solid #eeecea;
  border-radius: 10px;
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.clear-btn:hover:not(:disabled) {
  background: #f5f3f0;
  border-color: #d0cdc8;
}

.clear-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn {
  font-size: 13px;
  font-weight: 600;
  background: #1a1917;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.action-btn:hover { background: #2d2b28; }

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
}

.book-card {
  border: 1.5px solid #eeecea;
  background: #fff;
  border-radius: 14px;
  text-align: left;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.book-card:hover {
  transform: translateY(-3px);
  border-color: #d0cdc8;
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
}

.cover {
  height: 210px;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 1px solid #eeecea;
  background: #faf9f7;
}

.cover-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 12px;
  background: var(--strip, #c8b8a8);
  box-shadow: inset -1px 0 0 rgba(255,255,255,0.3);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-title {
  display: block;
  font-size: 0.88rem;
  line-height: 1.35;
  font-weight: 600;
  color: #2e2c29;
  padding: 14px 12px 12px 22px;
}

.upload-cover {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 22px;
  height: 22px;
  border-radius: 99px;
  background: rgba(26,25,23,0.65);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.upload-cover:hover { background: rgba(26,25,23,0.85); }
.upload-cover input { display: none; }

.book-name {
  display: block;
  margin-top: 9px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #2e2c29;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
}

.book-window {
  margin-top: 20px;
  border-radius: 16px;
  background: #fff;
  border: 1.5px solid #eeecea;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transform-origin: top center;
}

.book-window.opening {
  animation: bookWindowOpen 0.45s ease;
}

@keyframes bookWindowOpen {
  0% { opacity: 0; transform: scale(0.985) translateY(-8px); }
  60% { opacity: 1; transform: scale(1.003) translateY(0); }
  100% { transform: scale(1); }
}

.window-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eeecea;
}

.window-top h4 {
  margin: 0;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1917;
  letter-spacing: -0.01em;
}

.window-actions {
  display: flex;
  gap: 8px;
}

.window-actions input,
.page-title {
  border: 1.5px solid #eeecea;
  background: #faf9f7;
  border-radius: 9px;
  padding: 7px 11px;
  color: #2e2c29;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.window-actions input:focus,
.page-title:focus { border-color: #3d3a35; background: #fff; }

.back-btn {
  font-size: 13px;
  font-weight: 600;
  color: #6b6760;
  background: #f5f3f0;
  border: 1.5px solid #eeecea;
  border-radius: 9px;
  padding: 7px 13px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.back-btn:hover { background: #ece9e4; color: #3d3a35; }

.book-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
}

.pages-col {
  border: 1.5px solid #eeecea;
  background: #faf9f7;
  border-radius: 12px;
  padding: 10px;
}

.page-pill {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 8px 10px;
  border-radius: 8px;
  color: #5c5650;
  margin-bottom: 2px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}

.page-pill:hover { background: #eeecea; color: #2e2c29; }
.page-pill.active { background: #1a1917; color: #fff; font-weight: 600; }

.page-col {
  border: 1.5px solid #eeecea;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
}

.lined-page {
  position: relative;
  border: 1px solid #e8e5e0;
  border-radius: 10px;
  padding: 10px 10px 10px 46px;
  min-height: 1200px;
  background:
    repeating-linear-gradient(
      to bottom,
      #fff 0px,
      #fff 34px,
      #eeecea 35px,
      #fff 36px
    );
}

.lined-page::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 34px;
  width: 1.5px;
  background: rgba(200, 80, 80, 0.5);
}

.toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.toolbar button {
  border: 1.5px solid #eeecea;
  background: #fff;
  border-radius: 7px;
  padding: 5px 10px;
  font-size: 13px;
  color: #3d3a35;
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}

.toolbar button:hover { background: #f0ede8; border-color: #d0cdc8; }

.page-title-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.page-index {
  white-space: nowrap;
  font-size: 11.5px;
  color: #b0aba3;
  font-weight: 600;
}

.page-title {
  flex: 1;
  font-weight: 700;
  font-size: 14px;
}

.document-area { min-height: 1000px; }

.doc-editor {
  min-height: 900px;
  border: 1px solid #eeecea;
  border-radius: 9px;
  background: #fff;
  padding: 14px 16px 40px;
  font-family: 'Georgia', serif;
  font-size: 15.5px;
  line-height: 1.75;
  color: #2e2c29;
  outline: none;
}

.doc-editor:focus { border-color: #3d3a35; }

.empty { color: #b0aba3; font-size: 13.5px; }
.inline-loading { font-size: 13px; color: #b0aba3; margin-bottom: 10px; }
.empty-books { color: #a0998f; margin-top: 14px; font-size: 13.5px; }

.document-scroll {
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 6px;
}

.toast-msg {
  position: fixed;
  right: 20px;
  top: 80px;
  z-index: 3000;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.toast-msg.success { background: #e8f5ee; color: #1e5c3a; border: 1px solid #bce6cb; }
.toast-msg.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fca5a5; }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }

.toast-fade-enter-from,
.toast-fade-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 900px) {
  .top-search input { width: 100%; }
  .book-shell { grid-template-columns: 1fr; }
  .window-top { grid-template-columns: 1fr; text-align: center; }
}
</style>
