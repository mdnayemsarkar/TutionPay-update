// ============================================================
// APP CORE
// ============================================================

window.APP = {

  ...Store.load(),

  page: "home",

  search: "",

  // ==========================================================
  // PAGE HISTORY
  // ==========================================================

  pageHistory: [],


  // ==========================================================
  // RENDER
  // ==========================================================

  render() {

    const fn = {

      home:
        this.home,

      payments:
        this.paymentsPage,

      students:
        this.studentsPage,

      reports:
        this.reports,

      notes:
        this.notesPage,

      backup:
        this.backup,

      batches:
        this.batchesPage

    }[this.page] || this.home;


    if (typeof fn !== "function") {

      this.page = "home";

      return this.home.call(this);

    }


    fn.call(this);
  },


  // ==========================================================
  // SAVE
  // ==========================================================

  save() {

    Store.save(this);
  },


  // ==========================================================
  // NOTES & CHECKLIST PAGE
  // ==========================================================

  notesPage() {
    if (window.NotesModule && typeof NotesModule.render === "function") {
      NotesModule.render();
    }
  },


  // ==========================================================
  // THEME MANAGEMENT (DARK & LIGHT)
  // ==========================================================

  getTheme() {
    try {
      var stored = localStorage.getItem("app_theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch (e) {}

    if (this.settings && (this.settings.theme === "light" || this.settings.theme === "dark")) {
      return this.settings.theme;
    }

    return "dark";
  },

  applyTheme(theme) {
    var current = theme || this.getTheme();
    var isLight = current === "light";

    if (isLight) {
      document.body.classList.remove("dark-neon");
      document.body.classList.add("light-theme");
      document.documentElement.classList.remove("dark-neon");
      document.documentElement.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-neon");
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-neon");
    }

    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", isLight ? "#2563eb" : "#070b14");
    }
  },

  toggleTheme() {
    var current = this.getTheme();
    var next = current === "light" ? "dark" : "light";

    try {
      localStorage.setItem("app_theme", next);
    } catch (e) {}

    if (this.settings) {
      this.settings.theme = next;
      this.save();
    }

    this.applyTheme(next);
    this.render();

    if (typeof this.showNotification === "function") {
      this.showNotification(
        next === "light" ? "☀️ লাইট মোড চালু হয়েছে" : "🌙 ডার্ক মোড চালু হয়েছে"
      );
    }
  },


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  go(page) {

    if (!page) {
      return;
    }


    // একই page হলে আবার history-তে যোগ করবে না
    if (this.page !== page) {

      this.pageHistory.push(this.page);

    }


    this.page = page;

    this.render();
  },


  // ==========================================================
  // BACK
  // ==========================================================

  back() {

    if (
      this.pageHistory &&
      this.pageHistory.length > 0
    ) {

      const previous =
        this.pageHistory.pop();


      this.page =
        previous;


      this.render();

      return true;
    }


    // History না থাকলে Home-এ যাবে
    if (this.page !== "home") {

      this.page =
        "home";


      this.render();

      return true;

    }


    return false;
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  header(title) {

    return `

      <div
        class="topbar"
        style="
          background:
            linear-gradient(
              135deg,
              #1d4ed8 0%,
              #2563eb 48%,
              #4f46e5 100%
            );

          box-shadow:
            0 4px 14px rgba(37,99,235,.20);

          position:relative;
          overflow:hidden;
        "
      >

        <!-- Decorative Glow -->

        <div
          style="
            position:absolute;
            width:110px;
            height:110px;
            right:-35px;
            top:-55px;
            border-radius:50%;
            background:rgba(255,255,255,.10);
            pointer-events:none;
          "
        ></div>


        <div
          style="
            position:absolute;
            width:70px;
            height:70px;
            right:80px;
            bottom:-45px;
            border-radius:50%;
            background:rgba(255,255,255,.07);
            pointer-events:none;
          "
        ></div>


        <div
          class="container"
          style="
            padding-top:0;
            padding-bottom:0;
            position:relative;
            z-index:2;
          "
        >

          <div
            class="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <div
                class="brand"
                style="
                  color:#fff;
                  font-weight:800;
                "
              >
                📘 Tuition Fee Collection
              </div>


              <div
                class="sub"
                style="
                  color:rgba(255,255,255,.82);
                "
              >
                ${U.esc(title)}
              </div>

            </div>


            <div
              style="
                display:flex;
                align-items:center;
                gap:8px;
              "
            >

              <button
                type="button"
                class="btn"
                style="
                  background:rgba(255,255,255,.18);
                  color:#fff;
                  border:1px solid rgba(255,255,255,.24);
                  backdrop-filter:blur(8px);
                  -webkit-backdrop-filter:blur(8px);
                  font-size:12px;
                  font-weight:700;
                  padding:6px 11px;
                  border-radius:10px;
                "
                onclick="APP.toggleTheme()"
                title="${(this.getTheme && this.getTheme() === 'light') ? 'ডার্ক মোড' : 'লাইট মোড'}"
                aria-label="Toggle Theme"
              >
                ${(this.getTheme && this.getTheme() === 'light') ? '🌙 ডার্ক' : '☀️ লাইট'}
              </button>

              <button
                type="button"
                class="btn"
                style="
                  background:rgba(255,255,255,.16);
                  color:#fff;
                  border:1px solid rgba(255,255,255,.16);
                  backdrop-filter:blur(8px);
                  -webkit-backdrop-filter:blur(8px);
                  padding:6px 10px;
                  border-radius:10px;
                "
                onclick="APP.backup()"
                title="ব্যাকআপ ও সেটিংস"
              >
                ⋮
              </button>

            </div>

          </div>

        </div>

      </div>

    `;
  },


  // ==========================================================
  // BOTTOM NAVIGATION
  // ==========================================================

  nav() {

    const items = [

      ["home", "🏠", "Home"],

      ["payments", "💰", "Payments"],

      ["students", "👨‍🎓", "Students"],

      ["notes", "📝", "Notes"],

      ["reports", "📊", "Reports"]

    ];


    return `

      <div class="nav">

        <div class="navin">

          ${items.map(x => `

            <button
              class="
                ${this.page === x[0]
                  ? "active"
                  : ""}
              "
              onclick="
                APP.go('${x[0]}')
              "
            >

              <span class="navicon">
                ${x[1]}
              </span>

              ${x[2]}

            </button>

          `).join("")}

        </div>

      </div>

    `;
  },


  // ==========================================================
  // PAGE SHELL
  // ==========================================================

  shell(content, title) {

    const app =
      document.getElementById("app");


    if (!app) {
      return;
    }


    app.innerHTML =

      this.header(title)

      +

      `

        <main
          class="
            container
            bottomspace
          "
        >

          ${content}

        </main>

      `

      +

      this.nav();
  },


  // ==========================================================
  // MONTH BAR
  // ==========================================================

  monthBar() {

    return `

      <div class="monthbar">

        <button
          class="btn btn-soft"
          onclick="
            APP.shiftMonth(-1)
          "
        >
          ‹
        </button>


        <div class="monthname">

          ${U.months[
            this.settings.month - 1
          ]}

          ${this.settings.year}

        </div>


        <button
          class="btn btn-soft"
          onclick="
            APP.shiftMonth(1)
          "
        >
          ›
        </button>

      </div>

    `;
  },


  // ==========================================================
  // YEAR SELECT
  // ==========================================================

  yearSelect() {

    const y =
      this.settings.year;


    return `

      <select
        class="select"
        style="width:auto"
        onchange="
          APP.changeYear(this.value)
        "
      >

        ${[
          y - 1,
          y,
          y + 1,
          y + 2
        ].map(v => `

          <option
            value="${v}"
            ${v == y
              ? "selected"
              : ""}
          >

            ${v}

          </option>

        `).join("")}

      </select>

    `;
  },


  // ==========================================================
  // CHANGE YEAR
  // ==========================================================

  changeYear(v) {

    this.settings.year =
      Number(v);


    this.save();

    this.render();
  },


  // ==========================================================
  // CHANGE MONTH
  // ==========================================================

  shiftMonth(delta) {

    let month =
      this.settings.month + delta;


    let year =
      this.settings.year;


    if (month < 1) {

      month = 12;

      year--;

    }


    if (month > 12) {

      month = 1;

      year++;

    }


    this.settings.month =
      month;

    this.settings.year =
      year;


    this.save();

    this.render();
  },


  // ==========================================================
  // COMMON MODAL
  // ==========================================================

  modal(html) {

    this.closeModal();


    const el =
      document.createElement("div");


    el.className =
      "modalback";


    el.id =
      "modal";


    el.innerHTML = `

      <div class="modal">

        ${html}

      </div>

    `;


    document.body.appendChild(el);
  },


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  closeModal() {

    const modal =
      document.getElementById("modal");


    if (modal) {
      modal.remove();
    }
  },


  // ==========================================================
  // BATCH MANAGEMENT PAGE
  // ==========================================================
  //
  // Home → Batch
  //
  // এখানে Students page-এর design বা content ব্যবহার করা হবে না।
  // আলাদা Batch Management screen থাকবে।
  //
  // Existing:
  // - BatchModule
  // - batchModal()
  // - openBatch()
  //
  // এগুলো students.js / batches.js থেকেই ব্যবহার করা হচ্ছে।
  // ==========================================================

  batchesPage() {

    const batches =
      this.batches || [];


    const currentYear =
      this.settings.year;


    const currentMonth =
      this.settings.month;


    this.shell(`

      <div
        class="
          flex
          items-center
          justify-between
          mb-3
        "
      >

        <div
          class="text-xl font-extrabold"
        >
          Batch Management
        </div>


        <button
          class="btn btn-primary"
          onclick="
            APP.batchModal()
          "
        >
          + Batch
        </button>

      </div>


      <div
        class="text-xs text-slate-500 mb-3"
      >
        ${batches.length} টি Batch
      </div>


      <div id="batchManagementList">

        ${
          batches.length

            ? batches.map(
                function(b) {

                  var count =
                    typeof BatchModule !== "undefined"
                      ? BatchModule.studentCount(b.id)
                      : 0;


                  var paid =
                    typeof BatchModule !== "undefined"
                      ? BatchModule.monthlyPaid(
                          b.id,
                          currentYear,
                          currentMonth
                        )
                      : 0;


                  var due =
                    typeof BatchModule !== "undefined"
                      ? BatchModule.monthlyDue(
                          b.id,
                          currentYear,
                          currentMonth
                        )
                      : 0;


                  var status =
                    b.active === false
                      ? "Inactive"
                      : "Active";


                  return `

                    <div
                      class="card mb-2"
                    >

                      <div
                        class="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >

                        <div
                          style="
                            flex:1;
                            min-width:0;
                            cursor:pointer;
                          "
                          onclick="
                            APP.openBatch('${b.id}')
                          "
                        >

                          <b>
                            ${U.esc(b.name)}
                          </b>


                          <div
                            class="
                              text-xs
                              text-slate-500
                              mt-1
                            "
                          >

                            ${count} জন Student

                            ${
                              b.className
                                ? " • " +
                                  U.esc(
                                    b.className
                                  )
                                : ""
                            }

                            ${
                              b.time
                                ? " • " +
                                  U.esc(
                                    b.time
                                  )
                                : ""
                            }

                          </div>


                          <div
                            class="
                              text-xs
                              mt-2
                            "
                          >

                            <span
                              style="
                                color:
                                  ${
                                    b.active === false
                                      ? "#94a3b8"
                                      : "#16a34a"
                                  };
                                font-weight:600;
                              "
                            >
                              ${status}
                            </span>

                          </div>

                        </div>


                        <div
                          style="
                            text-align:right;
                            min-width:90px;
                          "
                        >

                          <b>
                            ${U.money(paid)}
                          </b>


                          <div
                            class="
                              text-xs
                              text-red-600
                              mt-1
                            "
                          >
                            Due ${U.money(due)}
                          </div>

                        </div>

                      </div>


                      <div
                        class="flex gap-2"
                        style="
                          margin-top:10px;
                          justify-content:flex-end;
                          flex-wrap:wrap;
                        "
                      >

                        <button
                          class="btn btn-soft"
                          onclick="
                            APP.openBatch('${b.id}')
                          "
                        >
                          Open
                        </button>


                        <button
                          class="btn btn-soft"
                          onclick="
                            APP.batchModal('${b.id}')
                          "
                        >
                          ✏ Edit
                        </button>


                        <button
                          class="btn btn-danger"
                          onclick="
                            APP.deleteBatch('${b.id}')
                          "
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                  `;

                }
              ).join("")

            : `

                <div class="card empty">

                  এখনো কোনো Batch তৈরি করা হয়নি।

                  <div
                    class="
                      text-xs
                      text-slate-500
                      mt-2
                    "
                  >
                    উপরের + Batch বাটনে চাপ দিয়ে
                    নতুন Batch তৈরি করুন।
                  </div>

                </div>

              `
        }

      </div>

    `, "Batch Management");
  },


  // ==========================================================
  // DELETE BATCH
  // ==========================================================
  //
  // IMPORTANT:
  // Batch delete করলে:
  // 1. Student delete হবে না
  // 2. Payment history delete হবে না
  // 3. শুধু Student-এর batchId খালি হবে
  // 4. Batch record delete হবে
  // ==========================================================

  deleteBatch(id) {

    var batch =
      typeof BatchModule !== "undefined"
        ? BatchModule.get(id)
        : null;


    if (!batch) {

      alert("Batch পাওয়া যায়নি।");

      return;
    }


    var studentCount =
      typeof BatchModule !== "undefined"
        ? BatchModule.studentCount(id)
        : 0;


    var message =
      "⚠️ " +
      (batch.name || "এই Batch") +
      "\n\n" +
      "এই Batch মুছে ফেলবেন?\n\n" +
      "Student: " +
      studentCount +
      " জন\n\n" +
      "Student এবং তাদের Payment History মুছে যাবে না।\n" +
      "শুধু এই Batch-এর সাথে Student-এর সংযোগটি সরানো হবে।";


    if (!confirm(message)) {

      return;
    }


    // Student থেকে Batch connection remove
    this.students =
      (this.students || []).map(
        function(student) {

          if (
            String(student.batchId || "") ===
            String(id)
          ) {

            student.batchId = "";

          }


          return student;

        }
      );


    // Batch remove
    this.batches =
      (this.batches || []).filter(
        function(b) {

          return String(b.id) !==
            String(id);

        }
      );


    this.save();


    // Current Batch যদি deleted হয়
    if (
      String(this.currentBatchId || "") ===
      String(id)
    ) {

      this.currentBatchId = "";

    }


    this.render();
  },


  // ==========================================================
  // CHECK / REPAIR DATA
  // ==========================================================

  init() {

    if (!this.settings) {

      this.settings = {

        year:
          new Date().getFullYear(),

        month:
          new Date().getMonth() + 1

      };

    }


    if (
      !Array.isArray(this.students)
    ) {

      this.students = [];

    }


    if (
      !Array.isArray(this.payments)
    ) {

      this.payments = [];

    }


    if (
      !Array.isArray(this.batches)
    ) {

      this.batches = [];

    }

    if (
      !this.studentMonthStatus ||
      typeof this.studentMonthStatus !== "object"
    ) {

      this.studentMonthStatus = {};

    }

    if (!Array.isArray(this.notes)) {

      this.notes = [];

    }

    if (!Array.isArray(this.noteLists)) {

      this.noteLists = [];

    }


    this.applyTheme(this.getTheme());

    this.render();
  }

};


// ============================================================
// GLOBAL $ HELPER
// ============================================================

function $(id) {

  return document.getElementById(id);

}


// ============================================================
// ANDROID BACK BUTTON SUPPORT
// ============================================================
//
// MainActivity থেকে WebView back চাপলে APP.back() কল করা যাবে।
// এছাড়া browser history থাকলে সেটার ওপর নির্ভর না করে
// আমাদের নিজস্ব pageHistory ব্যবহার করা হবে.
// ============================================================

window.handleAndroidBack = function () {

  if (window.APP) {

    return APP.back();

  }


  return false;
};


// ============================================================
// START APP
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => APP.init()
);