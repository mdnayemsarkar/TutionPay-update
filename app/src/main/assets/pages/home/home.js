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


  const paidCount =
    this.students.filter(
      s =>
        StudentModule.status(
          s,
          this.settings.year,
          this.settings.month
        ) === "Paid"
    ).length;

  const notStudiedCount =
    this.students.filter(
      s =>
        StudentModule.status(
          s,
          this.settings.year,
          this.settings.month
        ) === "এই মাস পড়েনি"
    ).length;

  const due =
    this.students.filter(
      s => {
        var st = StudentModule.status(
          s,
          this.settings.year,
          this.settings.month
        );
        return st !== "Paid" && st !== "এই মাস পড়েনি";
      }
    );

  const activeStudents = Math.max(1, this.students.length - notStudiedCount);
  const percent =
    this.students.length
      ? Math.round(
          (paidCount / activeStudents) * 100
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
          ${due.length} জন Due/Partial${notStudiedCount > 0 ? ` (পড়েনি: ${notStudiedCount})` : ""}
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

  var student =
    StudentModule.get(id);

  if (!student) {
    if (typeof this.showNotification === "function") {
      this.showNotification("Student পাওয়া যায়নি।");
    } else {
      alert("Student পাওয়া যায়নি।");
    }
    return;
  }

  var curMonth = Number(
    (this.settings && this.settings.month) ||
    (new Date().getMonth() + 1)
  );

  var curYear = Number(
    (this.settings && this.settings.year) ||
    new Date().getFullYear()
  );

  // Open payment modal with pre-selected student, month, year, and pre-filled due amount
  this.paymentModal(id, curMonth, curYear);

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
        status !== "এই মাস পড়েনি" &&
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

  var totalDue =
    this.getMonthlyDueTotal(
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

    this.modal(`
      <div style="text-align:center; padding:25px 12px;">
        <div style="font-size:44px; line-height:1; margin-bottom:12px;">🎉</div>
        <div style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:6px;">
          ${U.esc(monthName)} ${year} — কোনো বকেয়া নেই
        </div>
        <div style="font-size:13px; color:#64748b; margin-bottom:20px;">
          এই মাসে সকল শিক্ষার্থীর ফি পরিশোধিত রয়েছে।
        </div>
        <button
          type="button"
          class="btn btn-primary"
          style="padding:8px 20px; font-weight:600;"
          onclick="APP.openDuePrintMenu()"
        >
          ⬅ মাসের তালিকায় ফিরুন
        </button>
      </div>
    `);

    return;
  }


  // ==========================================================
  // ROWS OF STUDENTS WHO HAVE NOT PAID
  // ==========================================================

  var rows =
    dueStudents.map(
      function (item, index) {

        var student =
          item.student;

        var classText =
          student.className
            ? "Class: " + U.esc(student.className)
            : "";

        var phoneText =
          student.phone
            ? "ফোন: " + U.esc(student.phone)
            : "";

        var meta = [classText, phoneText].filter(Boolean).join(" • ");

        return `
          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
              padding:10px 6px;
              border-bottom:1px solid #f1f5f9;
            "
          >
            <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
              <span
                style="
                  display:inline-block;
                  width:24px;
                  height:24px;
                  line-height:24px;
                  background:#f1f5f9;
                  color:#475569;
                  border-radius:6px;
                  text-align:center;
                  font-size:12px;
                  font-weight:700;
                  flex-shrink:0;
                "
              >
                ${index + 1}
              </span>

              <div style="min-width:0; flex:1;">
                <div style="font-weight:700; font-size:14px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${U.esc(student.name || "")}
                </div>
                ${meta ? `<div style="font-size:11px; color:#64748b; margin-top:1px;">${meta}</div>` : ""}
                <div style="font-size:11px; color:#64748b; margin-top:2px;">
                  ফি: ${U.money(item.fee)} • জমা: <span style="color:#16a34a; font-weight:600;">${U.money(item.paid)}</span>
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
              <div style="text-align:right;">
                <div style="font-size:10px; color:#dc2626; font-weight:600; text-transform:uppercase;">বকেয়া</div>
                <div style="font-size:15px; font-weight:800; color:#dc2626; line-height:1.2;">
                  ${U.money(item.due)}
                </div>
              </div>

              <button
                type="button"
                class="btn btn-primary"
                style="padding:4px 8px; font-size:11px; font-weight:700; height:28px; line-height:20px;"
                onclick="APP.paymentModal('${student.id}', ${month}, ${year})"
                title="এই বকেয়া পে করুন"
              >
                💰 Pay
              </button>
            </div>
          </div>
        `;
      }
    ).join("");


  // ==========================================================
  // DUE LIST PREVIEW MODAL
  // ==========================================================

  this.modal(`
    <div style="display:flex; flex-direction:column; max-height:85vh;">

      <!-- MODAL HEADER -->
      <div
        style="
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:10px;
          margin-bottom:10px;
          padding-bottom:10px;
          border-bottom:1px solid #e2e8f0;
        "
      >
        <div>
          <div style="font-size:17px; font-weight:800; color:#0f172a;">
            📋 ${U.esc(monthName)} ${year} — বকেয়া তালিকা
          </div>
          <div style="font-size:12px; color:#64748b; margin-top:3px;">
            মোট বকেয়া শিক্ষার্থী: <b style="color:#0f172a;">${dueStudents.length} জন</b> • মোট বকেয়া: <b style="color:#dc2626;">${U.money(totalDue)}</b>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-soft"
          style="padding:3px 8px; font-size:16px; line-height:1;"
          onclick="APP.closeModal()"
        >
          ×
        </button>
      </div>

      <!-- SCROLLABLE LIST OF STUDENTS WHO OWE DUE -->
      <div
        id="monthlyDueStudentList"
        style="
          flex:1;
          overflow-y:auto;
          padding-right:2px;
          max-height:55vh;
        "
      >
        ${rows}
      </div>

      <!-- SUMMARY BAR -->
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:10px 12px;
          background:#fef2f2;
          border:1px solid #fecaca;
          border-radius:10px;
          margin-top:12px;
        "
      >
        <span style="font-weight:700; font-size:13px; color:#991b1b;">
          সর্বমোট বকেয়া:
        </span>
        <span style="font-weight:800; font-size:16px; color:#dc2626;">
          ${U.money(totalDue)}
        </span>
      </div>

      <!-- ACTION BUTTONS -->
      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:8px;
          margin-top:14px;
          padding-top:10px;
          border-top:1px solid #e2e8f0;
        "
      >
        <button
          type="button"
          class="btn btn-soft"
          style="font-size:12px; font-weight:600; padding:8px 12px;"
          onclick="APP.openDuePrintMenu()"
        >
          ⬅ মাসের তালিকা
        </button>

        <button
          type="button"
          class="btn btn-primary"
          style="font-size:13px; font-weight:700; padding:8px 18px;"
          onclick="APP.executePrintDueList(${year}, ${month})"
        >
          🖨 প্রিন্ট / PDF
        </button>
      </div>

    </div>
  `);

};


// ============================================================
// EXECUTE PRINT DUE LIST (ANDROID PRINT & BROWSER PRINT)
// ============================================================

APP.executePrintDueList = function (
  year,
  month
) {

  var dueStudents =
    this.getMonthlyDueStudents(
      year,
      month
    );

  var totalDue =
    this.getMonthlyDueTotal(
      year,
      month
    );

  var monthName =
    U.months[
      Number(month) - 1
    ] || "";

  var tableRows =
    dueStudents.map(
      function (item, index) {
        var student = item.student;
        var info = [];
        if (student.className) info.push("Class: " + U.esc(student.className));
        if (student.phone) info.push("Phone: " + U.esc(student.phone));

        return `
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:7px 5px; text-align:center; font-weight:600; width:35px;">${index + 1}</td>
            <td style="padding:7px 8px;">
              <div style="font-weight:700; font-size:14px; color:#0f172a;">${U.esc(student.name || "")}</div>
              ${info.length ? `<div style="font-size:10px; color:#64748b; margin-top:1px;">${info.join(" • ")}</div>` : ""}
            </td>
            <td style="padding:7px 8px; text-align:right; font-size:12px; color:#475569;">${U.money(item.fee)}</td>
            <td style="padding:7px 8px; text-align:right; font-size:12px; color:#16a34a;">${U.money(item.paid)}</td>
            <td style="padding:7px 8px; text-align:right; font-weight:800; font-size:14px; color:#dc2626;">${U.money(item.due)}</td>
          </tr>
        `;
      }
    ).join("");

  var printableHTML = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${U.esc(monthName)} ${year} — বকেয়া তালিকা</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 24px;
          font-family: Arial, 'Noto Sans Bengali', sans-serif;
          color: #0f172a;
          background: #ffffff;
        }
        .header {
          text-align: center;
          padding-bottom: 12px;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 16px;
        }
        .title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }
        .subtitle {
          font-size: 13px;
          color: #475569;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background: #f1f5f9;
          padding: 8px 6px;
          font-size: 11px;
          font-weight: 700;
          border-bottom: 2px solid #cbd5e1;
          color: #334155;
        }
        .summary-bar {
          margin-top: 16px;
          padding: 10px 14px;
          border-top: 2px solid #0f172a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
          font-weight: 800;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          color: #64748b;
          text-align: right;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        }
        @media print {
          @page { margin: 10mm; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Ns Tuition Fee Collection</div>
        <div class="subtitle">বকেয়া শিক্ষার্থীদের তালিকা — <b>${U.esc(monthName)} ${year}</b></div>
        <div style="font-size:11px; color:#64748b; margin-top:3px;">তারিখ: ${U.today()}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:35px;">নং</th>
            <th style="text-align:left;">শিক্ষার্থীর নাম</th>
            <th style="text-align:right; width:70px;">ফি</th>
            <th style="text-align:right; width:70px;">জমা</th>
            <th style="text-align:right; width:80px;">বকেয়া</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="summary-bar">
        <span>মোট বকেয়া শিক্ষার্থী: ${dueStudents.length} জন</span>
        <span style="color:#dc2626;">সর্বমোট বকেয়া: ${U.money(totalDue)}</span>
      </div>

      <div class="footer">
        Ns Tuition Fee Collection • প্রস্তুতের সময়: ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;

  // 1. Android Print Bridge (if running in Android app APK)
  if (
    window.AndroidPrint &&
    typeof AndroidPrint.printReceipt === "function"
  ) {
    AndroidPrint.printReceipt(printableHTML);
    return;
  }

  // 2. Browser Print Fallback (Web, iframe, preview, desktop)
  var iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write(printableHTML);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(function () {
    iframe.contentWindow.print();
    setTimeout(function () {
      if (iframe && iframe.parentNode) {
        iframe.remove();
      }
    }, 1500);
  }, 400);

};