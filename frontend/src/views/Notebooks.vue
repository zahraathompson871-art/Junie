<template>
  <div class="reader-home">
    <div class="reader-wrap">
      <header class="top-search">
        <h1>Search</h1>
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

        <div class="section-row all-docs">
          <h3>All Documents</h3>
          <button class="clear-btn" @click="createNotebook()">New Notebook</button>
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
                  v-html="documentHtml"
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
export default {
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
      this.isLoadingLibrary = false
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
      if (!this.books.length) await this.seedDemoBooks()
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
      const baseTitle = title || `Notebook ${this.books.length + 1}`
      const res = await fetch(`${this.getApiBaseUrl()}/api/books`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ workspaceId: this.selectedWorkspaceId, title: baseTitle })
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.error || 'Failed to create notebook'
        return null
      }
      await this.loadBooks(this.selectedWorkspaceId)
      this.notify('Notebook created')
      return data
    },
    async seedDemoBooks() {
      const seededKey = `notebookSeededWorkspace:${this.selectedWorkspaceId}`
      if (localStorage.getItem(seededKey) === '1') return
      const demoTitles = ['Chemistry 101', 'Homework', 'Maths', 'Biology', 'English Writing', 'Piano Notebook']
      for (const title of demoTitles) {
        await this.createNotebook(title)
      }
      localStorage.setItem(seededKey, '1')
      await this.loadBooks(this.selectedWorkspaceId)
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
  min-height: calc(100vh - 72px);
  background: var(--dash-bg, #f5faf1);
  color: var(--dash-title, #253629);
}

.reader-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 20px 84px;
}

.top-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 14px;
}

.top-search h1 {
  margin: 0;
  font-size: clamp(2rem, 4.2vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
}

.top-search input {
  width: 290px;
  border: 1px solid var(--dash-border, #d5e5cf);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 10px 13px;
  font-size: 0.98rem;
  color: var(--dash-title, #253629);
}

.top-search input:focus {
  outline: none;
  border-color: var(--dash-accent, #6f8f63);
  box-shadow: 0 0 0 3px rgba(111, 143, 99, 0.15);
}

.section-row {
  border-top: 1px solid var(--dash-border, #d5e5cf);
  padding-top: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-row h3 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 700;
}

.all-docs {
  margin-top: 20px;
}

.clear-btn {
  border: 1px solid var(--dash-border, #d5e5cf);
  background: #fff;
  color: var(--dash-title, #253629);
  font-weight: 700;
  border-radius: 10px;
  padding: 7px 12px;
}

.clear-btn:hover {
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 12%, #fff);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 18px;
}

.book-card {
  border: none;
  background: transparent;
  text-align: left;
  padding: 0;
  transition: transform 0.16s ease;
}

.book-card:hover {
  transform: translateY(-2px);
}

.cover {
  height: 214px;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(36, 56, 122, 0.14);
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--dash-border, #d5e5cf) 75%, #fff);
}

.cover-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 14px;
  background: var(--strip, #debed4);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.45);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-title {
  display: block;
  font-size: 0.92rem;
  line-height: 1.3;
  font-weight: 700;
  color: #392f25;
  padding: 14px;
}

.upload-cover {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(30, 30, 35, 0.7);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
}

.upload-cover input {
  display: none;
}

.book-name {
  display: block;
  margin-top: 9px;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--dash-title, #253629);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-window {
  margin-top: 18px;
  border-radius: 18px;
  background: var(--dash-card, rgba(255, 255, 255, 0.92));
  border: 1px solid var(--dash-border, #d5e5cf);
  padding: 14px;
  box-shadow: 0 14px 30px rgba(36, 56, 122, 0.12);
  transform-origin: top center;
}

.book-window.opening {
  animation: bookWindowOpen 0.6s ease;
}

@keyframes bookWindowOpen {
  0% {
    opacity: 0;
    transform: scale(0.98) translateY(-10px);
  }
  55% {
    opacity: 1;
    transform: scale(1.005) translateY(0);
  }
  100% {
    transform: scale(1);
  }
}

.window-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.window-top h4 {
  margin: 0;
  text-align: center;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-size: 1.22rem;
  color: var(--dash-title, #253629);
}

.window-actions {
  display: flex;
  gap: 6px;
}

.window-actions input,
.page-title {
  border: 1px solid var(--dash-border, #d5e5cf);
  background: #ffffff;
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--dash-title, #253629);
}

.back-btn,
.action-btn,
.toolbar button {
  border: 1px solid var(--dash-border, #d5e5cf);
  background: #fff;
  border-radius: 10px;
  padding: 7px 10px;
  font-weight: 700;
  color: var(--dash-title, #253629);
}

.action-btn {
  background: linear-gradient(135deg, var(--dash-accent, #6f8f63), var(--dash-accent-2, #9caf88));
  color: #fff;
  border-color: transparent;
}

.book-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 12px;
}

.pages-col {
  border: 1px solid var(--dash-border, #d5e5cf);
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 7%, #fff);
  border-radius: 12px;
  padding: 10px;
}

.page-pill {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 9px 10px;
  border-radius: 9px;
  color: var(--dash-title, #253629);
  margin-bottom: 4px;
  font-weight: 600;
}

.page-pill.active,
.page-pill:hover {
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 18%, #fff);
}

.page-col {
  border: 1px solid var(--dash-border, #d5e5cf);
  background: #fcfffb;
  border-radius: 12px;
  padding: 12px;
}

.lined-page {
  position: relative;
  border: 1px solid #dfe8de;
  border-radius: 12px;
  padding: 10px 10px 10px 46px;
  min-height: 1200px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  background:
    repeating-linear-gradient(
      to bottom,
      #fcfffb 0px,
      #fcfffb 34px,
      #deebdf 35px,
      #fcfffb 36px
    );
}

.lined-page::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 34px;
  width: 2px;
  background: rgba(214, 91, 91, 0.7);
}

.toolbar {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.page-title-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.page-index {
  white-space: nowrap;
  font-size: 0.85rem;
  color: #5d6e5f;
  font-weight: 700;
}

.page-title {
  width: 100%;
  font-weight: 700;
  font-family: "Plus Jakarta Sans", sans-serif;
}

.document-area {
  min-height: 1000px;
}

.doc-editor {
  min-height: 900px;
  border: 1px solid #dce8dd;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 14px 14px 40px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #2e3f32;
}

.doc-editor:focus {
  outline: 2px solid rgba(111, 143, 99, 0.35);
}

.empty {
  color: #676f92;
}

.inline-loading {
  font-size: 0.92rem;
  color: #5d6e5f;
  margin-bottom: 8px;
}

.empty-books {
  color: #686d82;
  margin-top: 10px;
}

.document-scroll {
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 8px;
}

.toast-msg {
  position: fixed;
  right: 18px;
  top: 88px;
  z-index: 3000;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.toast-msg.success {
  background: #e4f5e8;
  color: #20553a;
  border: 1px solid #c7e9d1;
}

.toast-msg.error {
  background: #f9e1e1;
  color: #8c2929;
  border: 1px solid #efc0c0;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 900px) {
  .top-search h1 {
    font-size: 2rem;
  }

  .top-search input {
    width: 100%;
  }

  .book-shell {
    grid-template-columns: 1fr;
  }

  .window-top {
    grid-template-columns: 1fr;
  }
}
</style>
