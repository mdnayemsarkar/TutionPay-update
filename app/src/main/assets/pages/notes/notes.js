// ============================================================
// NOTES & CHECKLIST MANAGEMENT MODULE FOR TUITIONPAY
// ============================================================

window.NotesModule = {

  // Current view state: 'dashboard' | 'note_editor' | 'list_editor'
  currentView: "dashboard",

  // Active note or list ID when editing
  activeId: null,

  // Search filter query
  searchQuery: "",

  // Tab filter: 'all' | 'pages' | 'lists'
  filterTab: "all",

  // Auto-save debounce timer
  autoSaveTimer: null,

  // Save status text: 'saved' | 'saving' | 'dirty'
  saveStatus: "saved",

  // ==========================================================
  // INITIALIZATION & DATA HELPERS
  // ==========================================================

  getNotes: function () {
    if (!window.APP) return [];
    if (!Array.isArray(APP.notes)) {
      APP.notes = [];
    }
    return APP.notes;
  },

  getLists: function () {
    if (!window.APP) return [];
    if (!Array.isArray(APP.noteLists)) {
      APP.noteLists = [];
    }
    return APP.noteLists;
  },

  saveData: function () {
    if (window.APP && typeof APP.save === "function") {
      APP.save();
    }
  },

  formatDate: function (isoString) {
    if (!isoString) return "";
    try {
      var d = new Date(isoString);
      if (isNaN(d.getTime())) return "";

      var now = new Date();
      var isToday = d.toDateString() === now.toDateString();

      var timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (isToday) {
        return "আজ, " + timeStr;
      }

      var day = d.getDate();
      var monthName = (window.U && U.months && U.months[d.getMonth()]) || (d.getMonth() + 1);
      return day + " " + monthName + ", " + timeStr;
    } catch (e) {
      return "";
    }
  },

  // ==========================================================
  // VIEW SWITCHING
  // ==========================================================

  openDashboard: function () {
    this.currentView = "dashboard";
    this.activeId = null;
    this.render();
  },

  openNoteEditor: function (id) {
    this.currentView = "note_editor";
    this.activeId = id || null;
    this.saveStatus = "saved";
    this.render();
  },

  openListEditor: function (id) {
    this.currentView = "list_editor";
    this.activeId = id || null;
    this.saveStatus = "saved";
    this.render();
  },

  // ==========================================================
  // NOTE (PAGES) CRUD
  // ==========================================================

  createNote: function () {
    var notes = this.getNotes();
    var newId = "note_" + Date.now();
    var newNote = {
      id: newId,
      type: "page",
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    this.saveData();
    this.openNoteEditor(newId);
  },

  getNoteById: function (id) {
    var notes = this.getNotes();
    return notes.find(function (n) { return n.id === id; });
  },

  updateNote: function (id, title, content, isManual) {
    var note = this.getNoteById(id);
    if (!note) return;

    note.title = (title !== undefined) ? title : note.title;
    note.content = (content !== undefined) ? content : note.content;
    note.updatedAt = new Date().toISOString();

    this.saveData();

    var statusEl = document.getElementById("noteSaveStatus");
    if (statusEl) {
      statusEl.innerHTML = '<span style="color:#34d399; font-weight:700;">✓ সংরক্ষিত</span>';
    }

    if (isManual && window.APP && typeof APP.showNotification === "function") {
      APP.showNotification("নোট সংরক্ষিত হয়েছে");
    }
  },

  handleNoteInput: function (id) {
    var titleEl = document.getElementById("noteTitleInput");
    var contentEl = document.getElementById("noteContentTextarea");
    var statusEl = document.getElementById("noteSaveStatus");

    if (statusEl) {
      statusEl.innerHTML = '<span style="color:#fbbf24; font-weight:700;">সংরক্ষণ হচ্ছে...</span>';
    }

    var self = this;
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(function () {
      var title = titleEl ? titleEl.value : "";
      var content = contentEl ? contentEl.value : "";
      self.updateNote(id, title, content, false);
    }, 400);
  },

  confirmDeleteNote: function (id) {
    var note = this.getNoteById(id);
    var title = (note && note.title.trim()) || "এই নোটটি";

    var self = this;
    APP.modal(`
      <div style="text-align:center; padding:12px 6px;">
        <div style="font-size:38px; line-height:1; margin-bottom:12px;">🗑️</div>
        <div style="font-size:17px; font-weight:800; color:#fb7185; margin-bottom:8px;">
          নোট মুছে ফেলতে চান?
        </div>
        <div style="font-size:13px; color:#cbd5e1; margin-bottom:18px; line-height:1.5;">
          "<b>${window.U ? U.esc(title) : title}</b>" স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
        </div>
        <div style="display:flex; justify-content:center; gap:10px;">
          <button
            type="button"
            class="btn btn-soft"
            style="padding:9px 18px; font-size:13px;"
            onclick="APP.closeModal()"
          >
            বাতিল
          </button>
          <button
            type="button"
            class="btn btn-danger"
            style="padding:9px 20px; font-size:13px; font-weight:700;"
            onclick="NotesModule.executeDeleteNote('${id}')"
          >
            হ্যাঁ, মুছুন
          </button>
        </div>
      </div>
    `);
  },

  executeDeleteNote: function (id) {
    var notes = this.getNotes();
    var idx = notes.findIndex(function (n) { return n.id === id; });
    if (idx !== -1) {
      notes.splice(idx, 1);
      this.saveData();
    }
    APP.closeModal();
    if (typeof APP.showNotification === "function") {
      APP.showNotification("নোট মুছে ফেলা হয়েছে");
    }
    this.openDashboard();
  },

  // ==========================================================
  // LIST (CHECKLIST) CRUD
  // ==========================================================

  createList: function () {
    var lists = this.getLists();
    var newId = "list_" + Date.now();
    var newList = {
      id: newId,
      type: "list",
      title: "",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    lists.unshift(newList);
    this.saveData();
    this.openListEditor(newId);
  },

  getListById: function (id) {
    var lists = this.getLists();
    return lists.find(function (l) { return l.id === id; });
  },

  updateListTitle: function (id, title) {
    var list = this.getListById(id);
    if (!list) return;
    list.title = title || "";
    list.updatedAt = new Date().toISOString();
    this.saveData();

    var statusEl = document.getElementById("listSaveStatus");
    if (statusEl) {
      statusEl.innerHTML = '<span style="color:#34d399; font-weight:700;">✓ সংরক্ষিত</span>';
    }
  },

  addListItem: function (id) {
    var input = document.getElementById("newListItemInput");
    if (!input) return;
    var text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }

    var list = this.getListById(id);
    if (!list) return;

    if (!Array.isArray(list.items)) {
      list.items = [];
    }

    list.items.push({
      id: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      text: text,
      completed: false
    });

    list.updatedAt = new Date().toISOString();
    this.saveData();
    input.value = "";
    this.renderListEditor(id);
  },

  toggleListItem: function (listId, itemId) {
    var list = this.getListById(listId);
    if (!list || !Array.isArray(list.items)) return;

    var item = list.items.find(function (it) { return it.id === itemId; });
    if (item) {
      item.completed = !item.completed;
      list.updatedAt = new Date().toISOString();
      this.saveData();
      this.renderListEditor(listId);
    }
  },

  deleteListItem: function (listId, itemId) {
    var list = this.getListById(listId);
    if (!list || !Array.isArray(list.items)) return;

    var idx = list.items.findIndex(function (it) { return it.id === itemId; });
    if (idx !== -1) {
      list.items.splice(idx, 1);
      list.updatedAt = new Date().toISOString();
      this.saveData();
      this.renderListEditor(listId);
    }
  },

  moveListItem: function (listId, itemId, direction) {
    var list = this.getListById(listId);
    if (!list || !Array.isArray(list.items)) return;

    var idx = list.items.findIndex(function (it) { return it.id === itemId; });
    if (idx === -1) return;

    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= list.items.length) return;

    var temp = list.items[idx];
    list.items[idx] = list.items[newIdx];
    list.items[newIdx] = temp;

    list.updatedAt = new Date().toISOString();
    this.saveData();
    this.renderListEditor(listId);
  },

  updateListItemText: function (listId, itemId, newText) {
    var list = this.getListById(listId);
    if (!list || !Array.isArray(list.items)) return;

    var item = list.items.find(function (it) { return it.id === itemId; });
    if (item) {
      item.text = newText;
      list.updatedAt = new Date().toISOString();
      this.saveData();
    }
  },

  confirmDeleteList: function (id) {
    var list = this.getListById(id);
    var title = (list && list.title.trim()) || "এই তালিকাটি";

    var self = this;
    APP.modal(`
      <div style="text-align:center; padding:12px 6px;">
        <div style="font-size:38px; line-height:1; margin-bottom:12px;">🗑️</div>
        <div style="font-size:17px; font-weight:800; color:#fb7185; margin-bottom:8px;">
          তালিকা মুছে ফেলতে চান?
        </div>
        <div style="font-size:13px; color:#cbd5e1; margin-bottom:18px; line-height:1.5;">
          "<b>${window.U ? U.esc(title) : title}</b>" এবং এর অন্তর্ভুক্ত সকল আইটেম স্থায়ীভাবে মুছে ফেলা হবে।
        </div>
        <div style="display:flex; justify-content:center; gap:10px;">
          <button
            type="button"
            class="btn btn-soft"
            style="padding:9px 18px; font-size:13px;"
            onclick="APP.closeModal()"
          >
            বাতিল
          </button>
          <button
            type="button"
            class="btn btn-danger"
            style="padding:9px 20px; font-size:13px; font-weight:700;"
            onclick="NotesModule.executeDeleteList('${id}')"
          >
            হ্যাঁ, মুছুন
          </button>
        </div>
      </div>
    `);
  },

  executeDeleteList: function (id) {
    var lists = this.getLists();
    var idx = lists.findIndex(function (l) { return l.id === id; });
    if (idx !== -1) {
      lists.splice(idx, 1);
      this.saveData();
    }
    APP.closeModal();
    if (typeof APP.showNotification === "function") {
      APP.showNotification("তালিকা মুছে ফেলা হয়েছে");
    }
    this.openDashboard();
  },

  // ==========================================================
  // RENDER CONTROLLER
  // ==========================================================

  render: function () {
    if (this.currentView === "note_editor" && this.activeId) {
      this.renderNoteEditor(this.activeId);
    } else if (this.currentView === "list_editor" && this.activeId) {
      this.renderListEditor(this.activeId);
    } else {
      this.renderDashboard();
    }
  },

  // ==========================================================
  // VIEW: DASHBOARD
  // ==========================================================

  renderDashboard: function () {
    var notes = this.getNotes();
    var lists = this.getLists();
    var query = (this.searchQuery || "").trim().toLowerCase();
    var tab = this.filterTab || "all";

    // Filtering notes
    var filteredNotes = notes.filter(function (n) {
      if (tab === "lists") return false;
      if (!query) return true;
      var title = (n.title || "").toLowerCase();
      var content = (n.content || "").toLowerCase();
      return title.indexOf(query) !== -1 || content.indexOf(query) !== -1;
    });

    // Filtering lists
    var filteredLists = lists.filter(function (l) {
      if (tab === "pages") return false;
      if (!query) return true;
      var title = (l.title || "").toLowerCase();
      if (title.indexOf(query) !== -1) return true;
      if (Array.isArray(l.items)) {
        return l.items.some(function (it) {
          return (it.text || "").toLowerCase().indexOf(query) !== -1;
        });
      }
      return false;
    });

    var totalItems = filteredNotes.length + filteredLists.length;
    var allCount = notes.length + lists.length;

    var content = `
      <!-- TOP HEADER / ACTION ROW -->
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-xl font-extrabold" style="letter-spacing:-0.2px;">
            📝 Notes & Checklist
          </div>
          <div class="text-xs text-slate-500" style="margin-top:2px;">
            ব্যক্তিগত নোট, কাজের তালিকা ও বকেয়া ফি ট্র্যাকিং
          </div>
        </div>

        <button
          type="button"
          class="btn btn-soft"
          style="padding:6px 12px; font-size:12px; font-weight:700; border-radius:10px;"
          onclick="APP.toggleTheme()"
          title="থিম পরিবর্তন করুন"
        >
          ${APP.getTheme && APP.getTheme() === 'light' ? '🌙 ডার্ক' : '☀️ লাইট'}
        </button>
      </div>

      <!-- CREATE ACTION BUTTONS -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <button
          type="button"
          class="btn btn-primary"
          style="padding:12px 14px; border-radius:14px; font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="NotesModule.createNote()"
        >
          <span style="font-size:18px;">📄</span>
          <span>+ নতুন নোট</span>
        </button>

        <button
          type="button"
          class="btn btn-soft"
          style="padding:12px 14px; border-radius:14px; font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;"
          onclick="NotesModule.createList()"
        >
          <span style="font-size:18px;">☑️</span>
          <span>+ নতুন চেকলিস্ট</span>
        </button>
      </div>

      <!-- SEARCH BOX -->
      <div style="margin-bottom:12px;">
        <div style="position:relative;">
          <input
            type="text"
            id="notesSearchInput"
            class="input"
            placeholder="নোট বা তালিকার বিষয়বস্তু দিয়ে খুঁজুন..."
            value="${window.U ? U.esc(this.searchQuery) : this.searchQuery}"
            oninput="NotesModule.searchQuery = this.value; NotesModule.renderDashboard();"
            style="padding-left:36px; border-radius:12px;"
          >
          <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; opacity:0.6; pointer-events:none;">
            🔍
          </span>
          ${this.searchQuery ? `
            <button
              type="button"
              onclick="NotesModule.searchQuery = ''; NotesModule.renderDashboard();"
              style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer;"
            >
              ✕
            </button>
          ` : ""}
        </div>
      </div>

      <!-- FILTER TABS (All / Notes / Lists) -->
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px;">
        <button
          type="button"
          class="btn ${tab === 'all' ? 'btn-primary' : 'btn-soft'}"
          style="padding:6px 12px; font-size:12px; border-radius:10px; font-weight:700;"
          onclick="NotesModule.filterTab = 'all'; NotesModule.renderDashboard();"
        >
          সব (${allCount})
        </button>

        <button
          type="button"
          class="btn ${tab === 'pages' ? 'btn-primary' : 'btn-soft'}"
          style="padding:6px 12px; font-size:12px; border-radius:10px; font-weight:700;"
          onclick="NotesModule.filterTab = 'pages'; NotesModule.renderDashboard();"
        >
          📄 সাধারণ নোট (${notes.length})
        </button>

        <button
          type="button"
          class="btn ${tab === 'lists' ? 'btn-primary' : 'btn-soft'}"
          style="padding:6px 12px; font-size:12px; border-radius:10px; font-weight:700;"
          onclick="NotesModule.filterTab = 'lists'; NotesModule.renderDashboard();"
        >
          ☑️ চেকলিস্ট (${lists.length})
        </button>
      </div>

      <!-- CONTENT DISPLAY -->
      ${totalItems === 0 ? this.renderEmptyState(query) : this.renderItemsGrid(filteredNotes, filteredLists, tab)}
    `;

    APP.shell(content, "Notes & Checklist");
  },

  renderEmptyState: function (query) {
    if (query) {
      return `
        <div class="card" style="text-align:center; padding:35px 16px;">
          <div style="font-size:42px; margin-bottom:12px;">🔍</div>
          <div style="font-size:16px; font-weight:800; margin-bottom:6px;">
            কোনো মিল পাওয়া যায়নি
          </div>
          <div class="text-xs text-slate-500" style="margin-bottom:16px;">
            "${window.U ? U.esc(query) : query}" দিয়ে কোনো নোট বা চেকলিস্ট পাওয়া যায়নি।
          </div>
          <button
            type="button"
            class="btn btn-soft"
            onclick="NotesModule.searchQuery = ''; NotesModule.renderDashboard();"
          >
            সার্চ ফিল্টার মুছুন
          </button>
        </div>
      `;
    }

    return `
      <div class="card" style="text-align:center; padding:40px 18px;">
        <div style="font-size:48px; line-height:1; margin-bottom:14px;">📝</div>
        <div style="font-size:18px; font-weight:800; margin-bottom:6px; color:#38bdf8; text-shadow:0 0 12px rgba(56,189,248,0.35);">
          এখনো কোনো নোট বা চেকলিস্ট নেই
        </div>
        <div class="text-xs text-slate-500" style="max-width:320px; margin:0 auto 22px; line-height:1.5;">
          টিউশন পরিচালনা, শিক্ষার্থীর ফি সংক্রান্ত তথ্য, বা দৈনন্দিন কাজের তালিকা সহজেই লিখে রাখুন।
        </div>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button
            type="button"
            class="btn btn-primary"
            style="padding:10px 18px; font-size:13px; font-weight:700;"
            onclick="NotesModule.createNote()"
          >
            📄 প্রথম নোট লিখুন
          </button>
          <button
            type="button"
            class="btn btn-soft"
            style="padding:10px 18px; font-size:13px; font-weight:700;"
            onclick="NotesModule.createList()"
          >
            ☑️ চেকলিস্ট তৈরি করুন
          </button>
        </div>
      </div>
    `;
  },

  renderItemsGrid: function (notes, lists, tab) {
    var html = "";

    // 1. Text Notes Section
    if (tab !== "lists" && notes.length > 0) {
      html += `
        <div class="sectionhead">
          <h3>📄 সাধারণ নোট (${notes.length})</h3>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; margin-bottom:20px;">
          ${notes.map(this.renderNoteCard.bind(this)).join("")}
        </div>
      `;
    }

    // 2. Checklist Section
    if (tab !== "pages" && lists.length > 0) {
      html += `
        <div class="sectionhead">
          <h3>☑️ চেকলিস্ট ও তালিকা (${lists.length})</h3>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; margin-bottom:20px;">
          ${lists.map(this.renderListCard.bind(this)).join("")}
        </div>
      `;
    }

    return html;
  },

  renderNoteCard: function (note) {
    var title = (note.title && note.title.trim()) || "শিরোনামহীন নোট";
    var content = (note.content && note.content.trim()) || "কোনো বিস্তারিত বিবরণ নেই...";
    var dateText = this.formatDate(note.updatedAt || note.createdAt);

    return `
      <div
        class="card"
        style="
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          padding:14px;
          cursor:pointer;
          transition:transform 0.15s ease, border-color 0.15s ease;
        "
        onclick="NotesModule.openNoteEditor('${note.id}')"
      >
        <div>
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px;">
            <div style="font-size:15px; font-weight:800; line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
              ${window.U ? U.esc(title) : title}
            </div>
            <span style="font-size:12px; opacity:0.6; flex-shrink:0;">📄</span>
          </div>

          <div
            class="text-xs text-slate-500"
            style="
              line-height:1.5;
              overflow:hidden;
              text-overflow:ellipsis;
              display:-webkit-box;
              -webkit-line-clamp:3;
              -webkit-box-orient:vertical;
              margin-bottom:12px;
            "
          >
            ${window.U ? U.esc(content) : content}
          </div>
        </div>

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            border-top:1px solid rgba(255,255,255,0.06);
            padding-top:8px;
            margin-top:auto;
          "
        >
          <span class="text-xs text-slate-500" style="font-size:11px;">
            ${dateText}
          </span>

          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation();">
            <button
              type="button"
              class="action-icon"
              style="width:30px; height:30px; font-size:12px;"
              onclick="NotesModule.openNoteEditor('${note.id}')"
              title="সম্পাদনা করুন"
            >
              ✏️
            </button>
            <button
              type="button"
              class="action-icon"
              style="width:30px; height:30px; font-size:12px; color:#fb7185;"
              onclick="NotesModule.confirmDeleteNote('${note.id}')"
              title="মুছে ফেলুন"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderListCard: function (list) {
    var title = (list.title && list.title.trim()) || "শিরোনামহীন তালিকা";
    var items = Array.isArray(list.items) ? list.items : [];
    var total = items.length;
    var completed = items.filter(function (it) { return it.completed; }).length;
    var pending = total - completed;
    var percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    var dateText = this.formatDate(list.updatedAt || list.createdAt);

    return `
      <div
        class="card"
        style="
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          padding:14px;
          cursor:pointer;
          transition:transform 0.15s ease, border-color 0.15s ease;
        "
        onclick="NotesModule.openListEditor('${list.id}')"
      >
        <div>
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px;">
            <div style="font-size:15px; font-weight:800; line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
              ${window.U ? U.esc(title) : title}
            </div>
            <span style="font-size:12px; opacity:0.6; flex-shrink:0;">☑️</span>
          </div>

          <!-- Progress summary -->
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; margin-bottom:6px;">
            <span style="color:#34d399; font-weight:700;">
              ${completed}টি সম্পন্ন
            </span>
            <span class="text-xs text-slate-500">
              ${pending}টি বাকি • মোট ${total}টি
            </span>
          </div>

          <!-- Mini Progress Bar -->
          <div class="progress" style="height:6px; margin-bottom:12px;">
            <span style="width:${percent}%; background:linear-gradient(90deg, #10b981, #34d399);"></span>
          </div>

          <!-- Preview of top items -->
          <div style="font-size:12px; margin-bottom:12px; line-height:1.6;">
            ${items.length === 0 ? `
              <span class="text-slate-500" style="font-style:italic;">কোনো আইটেম যোগ করা হয়নি</span>
            ` : items.slice(0, 3).map(function (it) {
              return `
                <div style="display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:${it.completed ? '0.6' : '0.9'};">
                  <span>${it.completed ? '☑' : '☐'}</span>
                  <span style="${it.completed ? 'text-decoration:line-through;' : ''}">${window.U ? U.esc(it.text) : it.text}</span>
                </div>
              `;
            }).join("")}
            ${items.length > 3 ? `<div class="text-slate-500" style="font-size:11px; margin-top:2px;">+ আরও ${items.length - 3}টি আইটেম...</div>` : ""}
          </div>
        </div>

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            border-top:1px solid rgba(255,255,255,0.06);
            padding-top:8px;
            margin-top:auto;
          "
        >
          <span class="text-xs text-slate-500" style="font-size:11px;">
            ${dateText}
          </span>

          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation();">
            <button
              type="button"
              class="action-icon"
              style="width:30px; height:30px; font-size:12px;"
              onclick="NotesModule.openListEditor('${list.id}')"
              title="আইটেম পরিচালনা করুন"
            >
              ✏️
            </button>
            <button
              type="button"
              class="action-icon"
              style="width:30px; height:30px; font-size:12px; color:#fb7185;"
              onclick="NotesModule.confirmDeleteList('${list.id}')"
              title="মুছে ফেলুন"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================
  // VIEW: NOTE EDITOR
  // ==========================================================

  renderNoteEditor: function (id) {
    var note = this.getNoteById(id);
    if (!note) {
      this.openDashboard();
      return;
    }

    var content = `
      <div style="padding-bottom:20px;">
        <!-- TOP TOOLBAR -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:14px;">
          <button
            type="button"
            class="btn btn-soft"
            style="padding:6px 14px; font-size:13px; font-weight:700; border-radius:10px;"
            onclick="NotesModule.openDashboard()"
          >
            ← ফিরে যান
          </button>

          <div id="noteSaveStatus" style="font-size:12px;">
            <span style="color:#34d399; font-weight:700;">✓ সংরক্ষিত</span>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <button
              type="button"
              class="btn btn-primary"
              style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:10px;"
              onclick="NotesModule.updateNote('${note.id}', document.getElementById('noteTitleInput').value, document.getElementById('noteContentTextarea').value, true)"
            >
              💾 সংরক্ষণ
            </button>
            <button
              type="button"
              class="btn btn-danger"
              style="padding:6px 10px; font-size:12px; font-weight:700; border-radius:10px;"
              onclick="NotesModule.confirmDeleteNote('${note.id}')"
              title="নোটটি মুছুন"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- EDITOR CARD -->
        <div class="card" style="padding:16px;">
          <!-- TITLE INPUT -->
          <div style="margin-bottom:12px;">
            <input
              type="text"
              id="noteTitleInput"
              class="input"
              placeholder="নোটের শিরোনাম লিখুন..."
              value="${window.U ? U.esc(note.title || '') : (note.title || '')}"
              oninput="NotesModule.handleNoteInput('${note.id}')"
              style="
                font-size:18px;
                font-weight:800;
                border-radius:12px;
                border:1px solid rgba(56, 189, 248, 0.25);
                padding:12px 14px;
              "
            >
          </div>

          <!-- CONTENT TEXTAREA -->
          <div style="margin-bottom:12px;">
            <textarea
              id="noteContentTextarea"
              class="textarea"
              placeholder="এখানে বিস্তারিত নোট লিখুন... (বাংলা বা ইংরেজি, সংখ্যা ইত্যাদি লিখতে পারেন)"
              rows="14"
              oninput="NotesModule.handleNoteInput('${note.id}')"
              style="
                font-size:14px;
                line-height:1.6;
                border-radius:12px;
                padding:14px;
                min-height:260px;
                resize:vertical;
              "
            >${window.U ? U.esc(note.content || '') : (note.content || '')}</textarea>
          </div>

          <!-- FOOTER META -->
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#94a3b8; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
            <span>
              সর্বশেষ পরিবর্তন: ${this.formatDate(note.updatedAt)}
            </span>
            <span>
              তৈরি: ${this.formatDate(note.createdAt)}
            </span>
          </div>
        </div>
      </div>
    `;

    APP.shell(content, "নোট সম্পাদনা");
  },

  // ==========================================================
  // VIEW: CHECKLIST EDITOR
  // ==========================================================

  renderListEditor: function (id) {
    var list = this.getListById(id);
    if (!list) {
      this.openDashboard();
      return;
    }

    var items = Array.isArray(list.items) ? list.items : [];
    var total = items.length;
    var completed = items.filter(function (it) { return it.completed; }).length;
    var pending = total - completed;
    var percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    var content = `
      <div style="padding-bottom:20px;">
        <!-- TOP TOOLBAR -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:14px;">
          <button
            type="button"
            class="btn btn-soft"
            style="padding:6px 14px; font-size:13px; font-weight:700; border-radius:10px;"
            onclick="NotesModule.openDashboard()"
          >
            ← ফিরে যান
          </button>

          <div id="listSaveStatus" style="font-size:12px;">
            <span style="color:#34d399; font-weight:700;">✓ সংরক্ষিত</span>
          </div>

          <button
            type="button"
            class="btn btn-danger"
            style="padding:6px 12px; font-size:12px; font-weight:700; border-radius:10px;"
            onclick="NotesModule.confirmDeleteList('${list.id}')"
            title="তালিকাটি মুছুন"
          >
            🗑️ তালিকা মুছুন
          </button>
        </div>

        <!-- LIST HEADER & TITLE -->
        <div class="card" style="padding:16px; margin-bottom:14px;">
          <div style="margin-bottom:10px;">
            <input
              type="text"
              id="listTitleInput"
              class="input"
              placeholder="তালিকার শিরোনাম দিন (যেমন: মাসিক কাজের তালিকা)..."
              value="${window.U ? U.esc(list.title || '') : (list.title || '')}"
              oninput="NotesModule.updateListTitle('${list.id}', this.value)"
              style="
                font-size:18px;
                font-weight:800;
                border-radius:12px;
                border:1px solid rgba(56, 189, 248, 0.25);
                padding:12px 14px;
              "
            >
          </div>

          <!-- SUMMARY & PROGRESS -->
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; margin-bottom:6px;">
            <span style="color:#34d399; font-weight:700;">
              ${completed}টি সম্পন্ন (${percent}%)
            </span>
            <span class="text-xs text-slate-500">
              ${pending}টি বাকি • মোট ${total}টি আইটেম
            </span>
          </div>

          <div class="progress" style="height:8px;">
            <span style="width:${percent}%; background:linear-gradient(90deg, #10b981, #34d399);"></span>
          </div>
        </div>

        <!-- ADD ITEM BAR -->
        <div class="card" style="padding:12px; margin-bottom:14px;">
          <form onsubmit="event.preventDefault(); NotesModule.addListItem('${list.id}');" style="display:flex; gap:8px;">
            <input
              type="text"
              id="newListItemInput"
              class="input"
              placeholder="নতুন আইটেম লিখুন..."
              style="flex:1; border-radius:10px;"
              autocomplete="off"
            >
            <button
              type="submit"
              class="btn btn-primary"
              style="padding:8px 16px; font-size:13px; font-weight:700; border-radius:10px; flex-shrink:0;"
            >
              + যোগ করুন
            </button>
          </form>
        </div>

        <!-- ITEMS LIST -->
        <div class="card" style="padding:6px 12px;">
          ${items.length === 0 ? `
            <div class="empty" style="padding:30px 10px;">
              <div style="font-size:32px; margin-bottom:8px;">📋</div>
              <div>এখনো কোনো আইটেম যোগ করা হয়নি।</div>
              <div class="text-xs text-slate-500" style="margin-top:4px;">উপরের বক্সে লিখে "+ যোগ করুন" চাপুন।</div>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column;">
              ${items.map(function (it, idx) {
                return `
                  <div
                    style="
                      display:flex;
                      align-items:center;
                      justify-content:space-between;
                      gap:10px;
                      padding:11px 4px;
                      border-bottom:${idx === items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)'};
                      transition:background 0.15s ease;
                    "
                  >
                    <!-- CHECKBOX & TEXT -->
                    <div
                      style="display:flex; align-items:center; gap:10px; flex:1; min-width:0; cursor:pointer;"
                      onclick="NotesModule.toggleListItem('${list.id}', '${it.id}')"
                    >
                      <input
                        type="checkbox"
                        ${it.completed ? 'checked' : ''}
                        onclick="event.stopPropagation(); NotesModule.toggleListItem('${list.id}', '${it.id}')"
                        style="width:20px; height:20px; cursor:pointer; accent-color:#0ea5e9; flex-shrink:0;"
                      >
                      <span
                        style="
                          font-size:14px;
                          line-height:1.4;
                          word-break:break-word;
                          ${it.completed ? 'text-decoration:line-through; opacity:0.6; color:#94a3b8;' : 'font-weight:600; color:#f8fafc;'}
                        "
                      >
                        ${window.U ? U.esc(it.text) : it.text}
                      </span>
                    </div>

                    <!-- ACTION CONTROLS: MOVE UP / DOWN & DELETE -->
                    <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                      <button
                        type="button"
                        class="action-icon"
                        style="width:26px; height:26px; font-size:10px; padding:0;"
                        onclick="NotesModule.moveListItem('${list.id}', '${it.id}', -1)"
                        title="উপরে নিন"
                        ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        class="action-icon"
                        style="width:26px; height:26px; font-size:10px; padding:0;"
                        onclick="NotesModule.moveListItem('${list.id}', '${it.id}', 1)"
                        title="নিচে নিন"
                        ${idx === items.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        class="action-icon"
                        style="width:26px; height:26px; font-size:11px; padding:0; color:#fb7185;"
                        onclick="NotesModule.deleteListItem('${list.id}', '${it.id}')"
                        title="আইটেম মুছুন"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        </div>
      </div>
    `;

    APP.shell(content, "চেকলিস্ট পরিচালনা");
  }

};
