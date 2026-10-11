// ============================================================
// HOME DASHBOARD
// ============================================================

window.APP.home = function () {

  const total =
    PaymentModule.monthTotal(
      this.settings.year,
      this.settings.month
    );


  const yearTotal =
    PaymentModule.yearTotal(
      this.settings.year
    );


  const due =
    this.students.filter(
      s =>
        StudentModule.status(
          s,
          this.settings.year,
          this.settings.month
        ) !== "Paid"
    );


  const paidCount =
    this.students.length - due.length;


  const percent =
    this.students.length
      ? Math.round(
          (paidCount / this.students.length) * 100
        )
      : 0;


  this.shell(`

    <!-- =====================================================
         DASHBOARD TITLE
         ===================================================== -->

    <div class="text-xl font-extrabold mb-3">
      ড্যাশবোর্ড
    </div>


    ${this.monthBar()}


    <!-- =====================================================
         MONTH COLLECTION
         MODERN HERO CARD
         ===================================================== -->

    <div
      class="card mt-3"
      style="
        position:relative;
        overflow:hidden;
        border:none;
        color:#ffffff;
        padding:20px;
        border-radius:22px;

        background:
          radial-gradient(
            circle at 88% 8%,
            rgba(255,255,255,.24) 0%,
            rgba(255,255,255,.08) 22%,
            transparent 48%
          ),
          linear-gradient(
            135deg,
            #1d4ed8 0%,
            #2563eb 42%,
            #4f46e5 100%
          );

        box-shadow:
          0 12px 28px rgba(37,99,235,.22),
          0 4px 10px rgba(15,23,42,.08);
      "
    >

      <!-- Decorative Glow -->
      <div
        style="
          position:absolute;
          width:120px;
          height:120px;
          right:-42px;
          bottom:-48px;
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
          right:34px;
          top:-35px;
          border-radius:50%;
          background:rgba(255,255,255,.07);
          pointer-events:none;
        "
      ></div>


      <!-- Content -->
      <div style="
        position:relative;
        z-index:2;
      ">

        <div
          class="text-xs"
          style="
            opacity:.88;
            font-weight:600;
            letter-spacing:.2px;
          "
        >
          এই মাসে মোট সংগ্রহ
        </div>


        <div
          style="
            font-size:30px;
            line-height:1.15;
            font-weight:900;
            margin-top:7px;
            letter-spacing:-.6px;
            text-shadow:0 2px 8px rgba(0,0,0,.12);
          "
        >
          ${U.money(total)}
        </div>


        <div
          class="text-xs mt-2"
          style="
            opacity:.82;
            font-weight:500;
          "
        >

          ${U.months[
            this.settings.month - 1
          ]}

          ${this.settings.year}

        </div>

      </div>

    </div>


    <!-- =====================================================
         YEAR / STUDENT STATISTICS
         ===================================================== -->

    <div class="grid grid-2 gap-2 mt-3">


      <div class="card stat">

        <div class="statlabel">
          এই বছরে সংগ্রহ
        </div>


        <div class="statvalue">
          ${U.money(yearTotal)}
        </div>

      </div>


      <div class="card stat">

        <div class="statlabel">
          মোট Student
        </div>


        <div class="statvalue">
          ${this.students.length}
        </div>

      </div>


    </div>


    <!-- =====================================================
         PAYMENT STATUS
         ===================================================== -->

    <div class="sectionhead">

      <h3>
        এই মাসের Payment Status
      </h3>


      <span class="text-xs text-slate-500">
        ${percent}% Paid
      </span>

    </div>


    <div class="card">

      <div
        class="
          flex
          items-center
          justify-between
          gap-2
          mb-2
        "
      >

        <b>
          ${paidCount} জন Paid
        </b>


        <span class="text-xs text-red-600">
          ${due.length} জন Due/Partial
        </span>

      </div>


      <div class="progress">

        <span
          style="
            width:${percent}%
          "
        ></span>

      </div>

    </div>


    <!-- =====================================================
         QUICK ACTIONS
         ===================================================== -->

    <div class="sectionhead">

      <h3>
        Quick Actions
      </h3>

    </div>


    <div class="quick-grid">


      <!-- ===================================================
           PAYMENT
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.paymentModal()"
      >

        <span class="quick-icon">
          💰
        </span>


        <span>

          <b>
            Payment
          </b>

          <br>

          <small class="text-slate-500">
            নতুন জমা
          </small>

        </span>

      </button>


      <!-- ===================================================
           STUDENT
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.studentModal()"
      >

        <span class="quick-icon">
          👨‍🎓
        </span>


        <span>

          <b>
            Student
          </b>

          <br>

          <small class="text-slate-500">
            নতুন Student
          </small>

        </span>

      </button>


      <!-- ===================================================
           CHECKLIST
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.go('payments')"
      >

        <span class="quick-icon">
          ☑️
        </span>


        <span>

          <b>
            Checklist
          </b>

          <br>

          <small class="text-slate-500">
            কে দিয়েছে
          </small>

        </span>

      </button>


      <!-- ===================================================
           REPORTS
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.go('reports')"
      >

        <span class="quick-icon">
          📊
        </span>


        <span>

          <b>
            Reports
          </b>

          <br>

          <small class="text-slate-500">
            মাসিক হিসাব
          </small>

        </span>

      </button>


      <!-- ===================================================
           BATCH
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.go('batches')"
      >

        <span class="quick-icon">
          📚
        </span>


        <span>

          <b>
            Batch
          </b>

          <br>

          <small class="text-slate-500">
            ব্যাচ পরিচালনা
          </small>

        </span>

      </button>


      <!-- ===================================================
           BACKUP
           =================================================== -->

      <button
        class="quick-action"
        onclick="APP.go('backup')"
      >

        <span class="quick-icon">
          💾
        </span>


        <span>

          <b>
            Backup
          </b>

          <br>

          <small class="text-slate-500">
            Data নিরাপদ রাখুন
          </small>

        </span>

      </button>


    </div>


    <!-- =====================================================
         DUE LIST HEADER
         ===================================================== -->

    <div class="sectionhead">

      <h3>
        এই মাসের Due List
      </h3>


      <div
        style="
          display:flex;
          align-items:center;
          gap:6px;
        "
      >

        <!-- MONTHLY DUE PRINT -->

        <button
          class="btn btn-soft"
          onclick="APP.openDuePrintMenu()"
          title="মাসভিত্তিক বকেয়া লিস্ট প্রিন্ট"
        >
          🖨
        </button>


        <button
          class="btn btn-soft"
          onclick="APP.go('payments')"
        >
          সব দেখুন
        </button>

      </div>

    </div>


    <!-- =====================================================
         DUE LIST
         ===================================================== -->

    <div class="card">

      ${
        due.length

          ? due
              .slice(0, 8)
              .map(s => `

                <div class="row">


                  <span>
                    🔴
                  </span>


                  <div
                    class="flex-1"
                    onclick="
                      APP.studentProfile('${s.id}')
                    "
                  >

                    <b>
                      ${U.esc(s.name)}
                    </b>


                    <div class="text-xs text-slate-500">

                      বাকি

                      ${U.money(
                        Math.max(
                          0,
                          s.fee -
                          StudentModule.paid(
                            s.id,
                            this.settings.year,
                            this.settings.month
                          )
                        )
                      )}

                    </div>

                  </div>


                  <button
                    class="action-icon"
                    onclick="
                      APP.paymentFor('${s.id}')
                    "
                  >
                    +
                  </button>


                </div>

              `)
              .join("")


          : `

              <div class="empty">
                এই মাসে কোনো Due নেই 🎉
              </div>

            `
      }

    </div>


  `, "ড্যাশবোর্ড");

};



// ============================================================
// HOME → DUE LIST → PAYMENT
// ============================================================
//
// Due List-এর "+" চাপলে:
// 1. Payment Modal খুলবে
// 2. যে Student-এর "+" চাপা হয়েছে তাকে select করবে
// ============================================================

APP.paymentFor = function (id) {

  if (!this.students || !this.students.length) {
    return;
  }


  var student = null;


  for (
    var i = 0;
    i < this.students.length;
    i++
  ) {

    if (
      String(this.students[i].id) ===
      String(id)
    ) {

      student =
        this.students[i];

      break;
    }

  }


  if (!student) {

    alert(
      "Student পাওয়া যায়নি।"
    );

    return;

  }


  // Existing Payment Modal ব্যবহার করা হচ্ছে
  this.paymentModal();


  // Modal render হওয়ার পরে Student select করা হবে
  setTimeout(
    function () {

      var studentSelect =
        document.getElementById(
          "pmStudent"
        );


      if (studentSelect) {

        studentSelect.value =
          id;

      }

    },
    100
  );

};



// ============================================================
// MONTHLY DUE PRINT MENU
// ============================================================
//
// বর্তমান বছরের ১২ মাস আলাদা আলাদা দেখাবে।
// প্রতিটি মাসের জন্য আলাদা Print button থাকবে।
//
// উদাহরণ:
//
// সেপ্টেম্বর ২০২৬
// ৫ জন • বকেয়া ৳৪,৩০০       🖨 Print
//
// ============================================================

APP.openDuePrintMenu = function () {

  var year =
    Number(
      this.settings.year
    );


  var html = `

    <div
      style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:14px;
      "
    >

      <div>

        <div
          style="
            font-size:20px;
            font-weight:800;
            color:#0f172a;
          "
        >
          🖨 মাসভিত্তিক বকেয়া লিস্ট
        </div>


        <div
          style="
            font-size:12px;
            color:#64748b;
            margin-top:4px;
          "
        >
          ${year} সালের যে মাসের বকেয়া লিস্ট প্রয়োজন,
          সেই মাসের Print চাপুন।
        </div>

      </div>


      <button
        class="btn btn-soft"
        onclick="APP.closeModal()"
      >
        ×
      </button>

    </div>


    <div
      style="
        max-height:70vh;
        overflow-y:auto;
      "
    >

      ${U.months.map(
        function (
          monthName,
          index
        ) {

          var month =
            index + 1;


          var dueStudents =
            APP.getMonthlyDueStudents(
              year,
              month
            );


          var dueTotal =
            APP.getMonthlyDueTotal(
              year,
              month
            );


          return `

            <div
              class="card"
              style="
                margin-bottom:8px;
                padding:12px;
              "
            >

              <div
                style="
                  display:flex;
                  align-items:center;
                  justify-content:space-between;
                  gap:10px;
                "
              >

                <div
                  style="
                    min-width:0;
                    flex:1;
                  "
                >

                  <div
                    style="
                      font-weight:800;
                      font-size:15px;
                    "
                  >
                    ${monthName} ${year}
                  </div>


                  <div
                    style="
                      font-size:12px;
                      color:#64748b;
                      margin-top:3px;
                    "
                  >

                    ${
                      dueStudents.length
                        ? (
                            dueStudents.length +
                            " জন • বকেয়া " +
                            U.money(dueTotal)
                          )
                        : "কোনো বকেয়া নেই"
                    }

                  </div>

                </div>


                <button
                  class="btn btn-primary"
                  onclick="
                    APP.printMonthlyDueList(
                      ${year},
                      ${month}
                    )
                  "
                >
                  🖨 Print
                </button>

              </div>

            </div>

          `;

        }
      ).join("")}

    </div>


    <div
      style="
        margin-top:12px;
        padding:10px 12px;
        background:#f8fafc;
        border-radius:12px;
        border:1px solid #e2e8f0;
        font-size:12px;
        color:#64748b;
        line-height:1.5;
      "
    >

      <b>নোট:</b>
      যে Student পুরো টাকা দেয়নি,
      তার শুধুমাত্র অবশিষ্ট বকেয়া টাকা
      তালিকায় দেখানো হবে।

    </div>

  `;


  this.modal(html);

};



// ============================================================
// GET MONTHLY DUE STUDENTS
// ============================================================
//
// নির্দিষ্ট Year + Month-এর:
// Paid নয় এবং Due > 0 এমন Student বের করবে।
//
// Partial payment হলেও Student থাকবে।
// ============================================================

APP.getMonthlyDueStudents = function (
  year,
  month
) {

  var list = [];


  (this.students || []).forEach(
    function (student) {

      var fee =
        Number(
          student.fee || 0
        );


      var paid =
        StudentModule.paid(
          student.id,
          year,
          month
        );


      var due =
        Math.max(
          0,
          fee - paid
        );


      var status =
        StudentModule.status(
          student,
          year,
          month
        );


      if (
        status !== "Paid" &&
        due > 0
      ) {

        list.push({

          student:
            student,

          fee:
            fee,

          paid:
            paid,

          due:
            due,

          status:
            status

        });

      }

    }
  );


  return list;

};



// ============================================================
// GET MONTHLY DUE TOTAL
// ============================================================

APP.getMonthlyDueTotal = function (
  year,
  month
) {

  var list =
    this.getMonthlyDueStudents(
      year,
      month
    );


  var total = 0;


  list.forEach(
    function (item) {

      total +=
        Number(
          item.due || 0
        );

    }
  );


  return total;

};



// ============================================================
// PRINT MONTHLY DUE LIST
// ============================================================
//
// PRINT FORMAT:
//
// সেপ্টেম্বর ২০২৬ মাসের বকেয়া তালিকা
//
// ১. Adib                 ৮০০৳
// ২. Raiyan               ৮০০৳
// ৩. Sakib              ১,২০০৳
// ৪. Fahim                ৫০০৳
//
// ─────────────────────────
// মোট বকেয়া:           ৩,৩০০৳
//
// শুধু নাম + বকেয়া টাকা থাকবে।
// Class / Fee / Paid / Status থাকবে না।
// ============================================================

APP.printMonthlyDueList = function (
  year,
  month
) {

  var dueStudents =
    this.getMonthlyDueStudents(
      year,
      month
    );


  var monthName =
    U.months[
      Number(month) - 1
    ] || "";


  // ==========================================================
  // NO DUE
  // ==========================================================

  if (!dueStudents.length) {

    var emptyHtml = `

      <div
        style="
          width:100%;
          box-sizing:border-box;

          padding:35px 25px;

          font-family:
            Arial,
            'Noto Sans Bengali',
            sans-serif;

          color:#0f172a;
        "
      >

        <div
          style="
            text-align:center;

            font-size:22px;
            font-weight:800;

            margin-bottom:20px;
          "
        >
          ${U.esc(monthName)}
          ${year}
          মাসের বকেয়া তালিকা
        </div>


        <div
          style="
            border:
              1px solid #cbd5e1;

            border-radius:10px;

            padding:25px;

            text-align:center;

            font-size:16px;
          "
        >
          এই মাসে কোনো বকেয়া নেই।
        </div>

      </div>

    `;


    if (
      window.AndroidPrint &&
      typeof AndroidPrint.printReceipt ===
        "function"
    ) {

      AndroidPrint.printReceipt(
        emptyHtml
      );

    } else {

      alert(
        "Print System পাওয়া যায়নি।"
      );

    }


    return;

  }


  // ==========================================================
  // TOTAL DUE
  // ==========================================================

  var totalDue =
    this.getMonthlyDueTotal(
      year,
      month
    );


  // ==========================================================
  // SIMPLE NAME + DUE
  // ==========================================================

  var rows =
    dueStudents.map(
      function (item, index) {

        var student =
          item.student;


        return `

          <div
            style="
              display:flex;

              align-items:center;

              justify-content:space-between;

              gap:15px;

              padding:
                8px 0;

              border-bottom:
                1px solid #e2e8f0;

              font-size:16px;

              line-height:1.5;
            "
          >

            <div
              style="
                flex:1;
                min-width:0;
              "
            >

              <span
                style="
                  font-weight:600;
                "
              >
                ${index + 1}.
              </span>


              <span
                style="
                  font-weight:700;
                  margin-left:4px;
                "
              >
                ${U.esc(
                  student.name || ""
                )}
              </span>

            </div>


            <div
              style="
                white-space:nowrap;

                font-weight:800;
              "
            >

              ${Number(
                item.due || 0
              ).toLocaleString("en-US")}৳

            </div>

          </div>

        `;

      }
    ).join("");


  // ==========================================================
  // PRINT PAGE
  // ==========================================================

  var html = `

    <div
      style="
        width:100%;
        box-sizing:border-box;

        padding:25px;

        font-family:
          Arial,
          'Noto Sans Bengali',
          sans-serif;

        color:#0f172a;
      "
    >

      <!-- ==================================================
           TITLE
           ================================================== -->

      <div
        style="
          text-align:center;

          font-size:21px;
          font-weight:900;

          padding-bottom:12px;

          border-bottom:
            2px solid #0f172a;

          margin-bottom:15px;
        "
      >

        ${U.esc(monthName)}
        ${year}
        মাসের বকেয়া তালিকা

      </div>


      <!-- ==================================================
           FULL DUE LIST
           ================================================== -->

      <div>

        ${rows}

      </div>


      <!-- ==================================================
           TOTAL
           ================================================== -->

      <div
        style="
          display:flex;

          align-items:center;

          justify-content:space-between;

          margin-top:18px;

          padding-top:12px;

          border-top:
            2px solid #0f172a;

          font-size:17px;

          font-weight:900;
        "
      >

        <span>
          মোট বকেয়া:
        </span>


        <span>
          ${Number(
            totalDue || 0
          ).toLocaleString("en-US")}৳
        </span>

      </div>


      <!-- ==================================================
           FOOTER
           ================================================== -->

      <div
        style="
          margin-top:25px;

          padding-top:8px;

          border-top:
            1px solid #cbd5e1;

          font-size:10px;

          color:#64748b;

          text-align:right;
        "
      >
        NS Tuition Collection
      </div>

    </div>

  `;


  // ==========================================================
  // ANDROID PRINT
  // ==========================================================

  if (
    window.AndroidPrint &&
    typeof AndroidPrint.printReceipt ===
      "function"
  ) {

    AndroidPrint.printReceipt(
      html
    );

  } else {

    alert(
      "Print System পাওয়া যায়নি।"
    );

  }

};