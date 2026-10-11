window.APP = window.APP || {};

window.PaymentModule = {
  add: function(form) {
    var amount = Number(form.amount || 0);

    if (!form.studentId || amount <= 0) {
      return false;
    }

    var date = form.date || U.today();
    var d = new Date(date);
    var student = StudentModule.get(form.studentId);

    APP.payments.push({
      id: U.id(),
      studentId: form.studentId,
      studentName: student ? student.name : "",
      year: d.getFullYear(),
      month: Number(form.month),
      date: date,
      amount: amount,
      comment: (form.comment || "").trim()
    });

    return true;
  },

  monthTotal: function(year, month) {
    return (APP.payments || [])
      .filter(function(p) {
        return p.year == year && p.month == month;
      })
      .reduce(function(sum, p) {
        return sum + Number(p.amount || 0);
      }, 0);
  },

  yearTotal: function(year) {
    return (APP.payments || [])
      .filter(function(p) {
        return p.year == year;
      })
      .reduce(function(sum, p) {
        return sum + Number(p.amount || 0);
      }, 0);
  },

  studentMonthPayments: function(studentId, year, month) {
    return (APP.payments || [])
      .filter(function(p) {
        return p.studentId == studentId &&
          p.year == year &&
          p.month == month;
      })
      .sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
  },

  studentMonthPaid: function(studentId, year, month) {
    return this.studentMonthPayments(studentId, year, month)
      .reduce(function(sum, p) {
        return sum + Number(p.amount || 0);
      }, 0);
  }
};


/* =========================================================
   PAYMENTS PAGE
========================================================= */

APP.paymentsPage = function() {
  var self = this;

  var year = Number(
    this.selectedYear ||
    (APP.settings && APP.settings.year) ||
    new Date().getFullYear()
  );

  var month = Number(
    this.selectedMonth ||
    (APP.settings && APP.settings.month) ||
    new Date().getMonth() + 1
  );

  var students = (APP.students || []).filter(function(s) {
    return !s.archived;
  });

  var totalCollection = PaymentModule.monthTotal(year, month);

  var paidStudents = students.filter(function(s) {
    return StudentModule.status(s, year, month) === "Paid";
  }).length;

  var dueStudents = students.length - paidStudents;

  this.shell(`
    <style>

      .payment-summary {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:7px;
        margin-bottom:10px;
      }

      .payment-summary-box {
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:11px;
        padding:9px 7px;
        text-align:center;
        min-width:0;
      }

      .payment-summary-title {
        font-size:11px;
        color:#64748b;
        margin-bottom:3px;
      }

      .payment-summary-value {
        font-size:16px;
        font-weight:700;
        line-height:1.2;
      }

      .payment-search {
        margin-bottom:9px;
      }

      .payment-search input {
        width:100%;
        box-sizing:border-box;
        height:40px;
        border:1px solid #dbe2ea;
        border-radius:10px;
        padding:0 12px;
        font-size:13px;
        outline:none;
        background:#fff;
      }

      .payment-search input:focus {
        border-color:#2563eb;
      }

      .payment-list {
        display:flex;
        flex-direction:column;
        gap:7px;
      }

      .payment-student-card {
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:11px;
        padding:9px;
        box-shadow:0 1px 2px rgba(0,0,0,.03);
      }

      .payment-student-top {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:7px;
        margin-bottom:4px;
      }

      .payment-student-name {
        font-size:15px;
        font-weight:700;
        color:#0f172a;
        line-height:1.3;
        min-width:0;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .payment-status {
        flex:0 0 auto;
        font-size:10px;
        font-weight:700;
        padding:3px 7px;
        border-radius:999px;
      }

      .payment-status.paid {
        background:#dcfce7;
        color:#166534;
      }

      .payment-status.partial {
        background:#fef3c7;
        color:#92400e;
      }

      .payment-status.due {
        background:#fee2e2;
        color:#991b1b;
      }

      .payment-meta {
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        font-size:12px;
        color:#64748b;
        line-height:1.3;
        margin-bottom:7px;
      }

      .payment-meta b {
        color:#334155;
        font-weight:600;
      }

      .payment-money-grid {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:5px;
        margin-bottom:7px;
      }

      .payment-money-box {
        background:#f8fafc;
        border-radius:8px;
        padding:6px 5px;
        text-align:center;
        min-width:0;
      }

      .payment-money-label {
        font-size:10px;
        color:#64748b;
        margin-bottom:2px;
      }

      .payment-money-value {
        font-size:12px;
        font-weight:700;
        color:#0f172a;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .payment-actions-row {
        display:flex;
        align-items:center;
        gap:4px;
        width:100%;
        overflow-x:auto;
        overflow-y:hidden;
        flex-wrap:nowrap;
        padding-bottom:1px;
        -webkit-overflow-scrolling:touch;
        scrollbar-width:none;
      }

      .payment-actions-row::-webkit-scrollbar {
        display:none;
      }

      .payment-action-btn {
        flex:0 0 auto;
        border:0;
        border-radius:7px;
        height:30px;
        padding:0 9px;
        font-size:11px;
        font-weight:600;
        line-height:30px;
        white-space:nowrap;
        cursor:pointer;
      }

      .payment-action-primary {
        background:#2563eb;
        color:#fff;
      }

      .payment-action-receipt {
        background:#eef2ff;
        color:#3730a3;
      }

      .payment-action-history {
        background:#f1f5f9;
        color:#334155;
      }

      .payment-action-edit {
        background:#fef3c7;
        color:#92400e;
      }

      .payment-action-delete {
        background:#fee2e2;
        color:#991b1b;
      }

      .payment-empty {
        text-align:center;
        padding:25px 12px;
        color:#64748b;
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:11px;
        font-size:13px;
      }


      /* =====================================================
         LATEST PAYMENTS
      ===================================================== */

      .latest-payments-section {
        margin-bottom:10px;
      }

      .latest-payments-toggle-row {
        display:flex;
        justify-content:flex-end;
        margin-bottom:9px;
      }

      .latest-payments-toggle-btn {
        width:100%;
        height:38px;
        border:1px solid #dbe2ea;
        border-radius:10px;
        background:#fff;
        color:#334155;
        font-size:12px;
        font-weight:700;
        cursor:pointer;
      }

      .latest-payments-toggle-btn:active {
        background:#f8fafc;
      }

      .latest-payments-panel {
        display:none;
        margin-bottom:10px;
      }

      .latest-payments-panel.open {
        display:block;
      }

      .latest-payments-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:6px;
      }

      .latest-payments-title {
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      }

      .latest-payments-subtitle {
        font-size:10px;
        color:#64748b;
      }

      .latest-payment-list {
        display:flex;
        flex-direction:column;
        gap:6px;
      }

      .latest-payment-card {
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:10px;
        padding:8px 9px;
      }

      .latest-payment-top {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:7px;
      }

      .latest-payment-name {
        min-width:0;
        font-size:13px;
        font-weight:700;
        color:#0f172a;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .latest-payment-amount {
        flex:0 0 auto;
        font-size:13px;
        font-weight:700;
        color:#166534;
      }

      .latest-payment-meta {
        display:flex;
        flex-wrap:wrap;
        gap:7px 10px;
        margin-top:3px;
        font-size:10px;
        color:#64748b;
        line-height:1.3;
      }

      .latest-payment-meta b {
        color:#334155;
        font-weight:600;
      }

      .latest-payment-empty {
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:10px;
        padding:12px;
        text-align:center;
        font-size:11px;
        color:#94a3b8;
      }


      /* =====================================================
         YEAR HISTORY
      ===================================================== */

      .year-history-header {
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:10px;
        padding:10px;
        margin-top:10px;
      }

      .year-history-student {
        font-size:16px;
        font-weight:700;
        color:#0f172a;
      }

      .year-history-sub {
        font-size:12px;
        color:#64748b;
        margin-top:2px;
      }


      /* YEAR SELECTOR */

      .history-year-selector {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:6px;
        margin-top:9px;
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:9px;
        padding:5px;
      }

      .history-year-btn {
        flex:0 0 auto;
        width:34px;
        height:32px;
        border:0;
        border-radius:7px;
        background:#f1f5f9;
        color:#334155;
        font-size:19px;
        font-weight:700;
        cursor:pointer;
        line-height:32px;
      }

      .history-year-btn:active {
        background:#e2e8f0;
      }

      .history-year-current {
        flex:1;
        text-align:center;
        font-size:15px;
        font-weight:700;
        color:#0f172a;
      }

      .history-year-current small {
        display:block;
        font-size:9px;
        font-weight:500;
        color:#64748b;
        margin-top:1px;
      }


      .year-summary-grid {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:5px;
        margin-top:9px;
      }

      .year-summary-box {
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:7px 4px;
        text-align:center;
      }

      .year-summary-label {
        font-size:10px;
        color:#64748b;
      }

      .year-summary-value {
        font-size:12px;
        font-weight:700;
        color:#0f172a;
        margin-top:2px;
      }

      .history-month-list {
        margin-top:9px;
        display:flex;
        flex-direction:column;
        gap:6px;
      }

      .history-month-card {
        border:1px solid #e5e7eb;
        border-radius:9px;
        background:#fff;
        overflow:hidden;
      }

      .history-month-top {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:7px;
        padding:8px 9px;
        background:#f8fafc;
      }

      .history-month-name {
        font-size:14px;
        font-weight:700;
        color:#0f172a;
      }

      .history-month-status {
        font-size:10px;
        font-weight:700;
        padding:3px 7px;
        border-radius:999px;
      }

      .history-month-status.paid {
        background:#dcfce7;
        color:#166534;
      }

      .history-month-status.partial {
        background:#fef3c7;
        color:#92400e;
      }

      .history-month-status.due {
        background:#fee2e2;
        color:#991b1b;
      }

      .history-month-info {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:4px;
        padding:7px 8px;
      }

      .history-month-info-box {
        text-align:center;
        background:#f8fafc;
        border-radius:6px;
        padding:5px 3px;
      }

      .history-month-info-label {
        font-size:9px;
        color:#64748b;
      }

      .history-month-info-value {
        font-size:11px;
        font-weight:700;
        color:#0f172a;
        margin-top:2px;
      }

      .history-payment-list {
        padding:0 8px 7px;
      }

      .history-payment-item {
        border-top:1px solid #eef2f7;
        padding:7px 0;
      }

      .history-payment-top {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:7px;
      }

      .history-payment-date {
        font-size:11px;
        color:#64748b;
      }

      .history-payment-amount {
        font-size:13px;
        font-weight:700;
        color:#0f172a;
      }

      .history-payment-comment {
        font-size:10px;
        color:#64748b;
        margin-top:2px;
      }

      .history-payment-actions {
        margin-top:5px;
      }

      .history-no-payment {
        padding:7px 8px;
        font-size:11px;
        color:#94a3b8;
        border-top:1px solid #eef2f7;
      }


      @media(max-width:360px) {

        .payment-action-btn {
          padding:0 7px;
          font-size:10px;
        }

        .payment-summary-box {
          padding:8px 5px;
        }

        .payment-summary-value {
          font-size:15px;
        }

        .history-month-info-value {
          font-size:10px;
        }

      }

    </style>


    <div>

      <div
        class="flex items-center justify-between"
        style="margin-bottom:9px">

        <div>

          <h2 class="text-xl font-bold">
            Payments
          </h2>

          <div class="text-sm text-slate-500">
            ${U.months[month - 1]} ${year}
          </div>

        </div>


        <button
          type="button"
          class="btn btn-primary"
          onclick="APP.paymentModal()">

          + Payment

        </button>

      </div>


      <div class="payment-summary">

        <div class="payment-summary-box">

          <div class="payment-summary-title">
            Collection
          </div>

          <div class="payment-summary-value">
            ${U.money(totalCollection)}
          </div>

        </div>


        <div class="payment-summary-box">

          <div class="payment-summary-title">
            Students
          </div>

          <div class="payment-summary-value">
            ${students.length}
          </div>

        </div>


        <div class="payment-summary-box">

          <div class="payment-summary-title">
            Due
          </div>

          <div class="payment-summary-value">
            ${dueStudents}
          </div>

        </div>

      </div>


      <div class="latest-payments-section">

        <div class="latest-payments-toggle-row">

          <button
            type="button"
            id="latestPaymentsToggle"
            class="latest-payments-toggle-btn"
            onclick="APP.toggleLatestPayments()">

            Latest Payments ▾

          </button>

        </div>


        <div
          id="latestPaymentsPanel"
          class="latest-payments-panel">

          <div class="latest-payments-header">

            <div class="latest-payments-title">
              Latest Payments
            </div>

            <div class="latest-payments-subtitle">
              সর্বশেষ payment আগে
            </div>

          </div>


          <div
            id="latestPaymentList"
            class="latest-payment-list">

            ${this.latestPaymentsHTML()}

          </div>

        </div>

      </div>


      <div class="payment-search">

        <input
          id="paymentSearch"
          type="search"
          placeholder="Search student name, class or phone..."
          autocomplete="off">

      </div>


      <div
        id="paymentStudentList"
        class="payment-list">

        ${this.paymentStudentListHTML(
          students,
          year,
          month
        )}

      </div>

    </div>

  `, "Payments");


  var search = $("paymentSearch");


  if (search) {

    search.addEventListener("input", function() {

      var q =
        this.value
          .toLowerCase()
          .trim();


      var filtered =
        students.filter(function(s) {

          return (

            String(s.name || "")
              .toLowerCase()
              .indexOf(q) !== -1

            ||

            String(s.className || "")
              .toLowerCase()
              .indexOf(q) !== -1

            ||

            String(s.phone || "")
              .toLowerCase()
              .indexOf(q) !== -1

          );

        });


      var list =
        $("paymentStudentList");


      if (list) {

        list.innerHTML =
          self.paymentStudentListHTML(
            filtered,
            year,
            month
          );

      }

    });

  }

};


/* =========================================================
   LATEST PAYMENTS TOGGLE
========================================================= */

APP.toggleLatestPayments = function() {

  var panel = $("latestPaymentsPanel");
  var button = $("latestPaymentsToggle");

  if (!panel || !button) {
    return;
  }

  var isOpen =
    panel.classList.toggle("open");

  button.textContent =
    isOpen
      ? "Latest Payments ▴"
      : "Latest Payments ▾";
};


/* =========================================================
   LATEST PAYMENTS HTML
========================================================= */

APP.latestPaymentsHTML = function() {

  var payments =
    Array.isArray(APP.payments)
      ? APP.payments.slice()
      : [];

  if (!payments.length) {

    return `
      <div class="latest-payment-empty">
        এখনো কোনো payment নেই।
      </div>
    `;

  }

  payments.sort(function(a, b) {

    var da =
      new Date(
        String(a.date || "") +
        "T23:59:59"
      ).getTime();

    var db =
      new Date(
        String(b.date || "") +
        "T23:59:59"
      ).getTime();

    if (db !== da) {
      return db - da;
    }

    return String(b.id || "")
      .localeCompare(
        String(a.id || "")
      );

  });


  return payments
    .slice(0, 10)
    .map(function(p) {

      var student =
        StudentModule.get(
          p.studentId
        );

      var studentName =
        (student && student.name) ||
        p.studentName ||
        "Student";

      var studentClass =
        (student && student.className) ||
        "—";


      var monthName =
        U.months[
          Number(p.month || 0) - 1
        ] || "—";


      var batchName = "—";


      if (
        student.batchId &&
        Array.isArray(APP.batches)
      ) {

        var batch =
          APP.batches.find(
            function(b) {
              return b.id ===
                student.batchId;
            }
          );

        if (batch) {

          batchName =
            batch.name ||
            batch.title ||
            "—";

        }

      }


      return `

        <div
          class="latest-payment-card">

          <div
            class="latest-payment-top">

            <div
              class="latest-payment-name">

              ${U.esc(
                studentName
              )}

            </div>

            <div
              class="latest-payment-amount">

              ${U.money(
                p.amount
              )}

            </div>

          </div>


          <div
            class="latest-payment-meta">

            <span>
              তারিখ:
              <b>
                ${U.esc(
                  p.date || "—"
                )}
              </b>
            </span>


            <span>
              মাস:
              <b>
                ${U.esc(
                  monthName
                )}
              </b>
            </span>


            <span>
              Class:
              <b>
                ${U.esc(
                  studentClass
                )}
              </b>
            </span>


            ${
              batchName !== "—"
                ? `
                  <span>
                    Batch:
                    <b>
                      ${U.esc(
                        batchName
                      )}
                    </b>
                  </span>
                `
                : ""
            }

          </div>

        </div>

      `;

    })
    .join("");

};


/* =========================================================
   STUDENT LIST HTML
========================================================= */

APP.paymentStudentListHTML = function(
  students,
  year,
  month
) {

  if (!students.length) {

    return `
      <div class="payment-empty">
        কোনো student পাওয়া যায়নি।
      </div>
    `;

  }


  return students
    .map(function(s) {

      var paid =
        StudentModule.paid(
          s.id,
          year,
          month
        );


      var fee =
        Number(
          s.fee || 0
        );


      var due =
        Math.max(
          fee - paid,
          0
        );


      var status =
        StudentModule.status(
          s,
          year,
          month
        );


      var statusClass =
        "due";


      if (status === "Paid") {

        statusClass =
          "paid";

      }

      else if (
        status === "Partial"
      ) {

        statusClass =
          "partial";

      }


      var payments =
        PaymentModule.studentMonthPayments(
          s.id,
          year,
          month
        );


      var latestPayment =
        payments.length
          ? payments[0]
          : null;


      return `

        <div
          class="payment-student-card">


          <div
            class="payment-student-top">

            <div
              class="payment-student-name">

              ${U.esc(
                s.name
              )}

            </div>


            <div
              class="
                payment-status
                ${statusClass}
              ">

              ${status}

            </div>

          </div>


          <div
            class="payment-meta">

            <span>

              Class:

              <b>

                ${U.esc(
                  s.className ||
                  "—"
                )}

              </b>

            </span>


            <span>

              Phone:

              <b>

                ${U.esc(
                  s.phone ||
                  "—"
                )}

              </b>

            </span>

          </div>


          <div
            class="payment-money-grid">


            <div
              class="payment-money-box">

              <div
                class="payment-money-label">

                Fee

              </div>

              <div
                class="payment-money-value">

                ${U.money(
                  fee
                )}

              </div>

            </div>


            <div
              class="payment-money-box">

              <div
                class="payment-money-label">

                Paid

              </div>

              <div
                class="payment-money-value">

                ${U.money(
                  paid
                )}

              </div>

            </div>


            <div
              class="payment-money-box">

              <div
                class="payment-money-label">

                Due

              </div>

              <div
                class="payment-money-value">

                ${U.money(
                  due
                )}

              </div>

            </div>


          </div>


          <div
            class="payment-actions-row">


            ${
              status !== "Paid"
                ? `

                  <button
                    type="button"
                    class="
                      payment-action-btn
                      payment-action-primary
                    "
                    onclick="
                      APP.paymentModal('${s.id}')
                    ">

                    💰 Pay

                  </button>

                `
                : ""
            }


            ${
              latestPayment
                ? `

                  <button
                    type="button"
                    class="
                      payment-action-btn
                      payment-action-receipt
                    "
                    onclick="
                      ReceiptModule.open('${latestPayment.id}')
                    ">

                    🧾 Receipt

                  </button>

                `
                : ""
            }


            <button
              type="button"
              class="
                payment-action-btn
                payment-action-history
              "
              onclick="
                APP.paymentHistory('${s.id}', ${year})
              ">

              📜 History

            </button>


            ${
              latestPayment
                ? `

                  <button
                    type="button"
                    class="
                      payment-action-btn
                      payment-action-edit
                    "
                    onclick="
                      PaymentActions.edit('${latestPayment.id}')
                    ">

                    ✏ Edit

                  </button>


                  <button
                    type="button"
                    class="
                      payment-action-btn
                      payment-action-delete
                    "
                    onclick="
                      PaymentActions.remove('${latestPayment.id}')
                    ">

                    🗑 Delete

                  </button>

                `
                : ""
            }


          </div>


        </div>

      `;

    })
    .join("");

};


/* =========================================================
   PAYMENT MODAL
========================================================= */

APP.paymentModal = function(studentId) {

  var students =
    (APP.students || []).filter(function(s) {
      return !s.archived;
    });


  APP.modal(`

    <h3 class="text-xl font-bold">
      Add Payment
    </h3>


    <div class="formgrid mt-3">


      <div class="full">

        <label class="label">
          Student
        </label>


        <select
          id="pStudent"
          class="select">


          <option value="">
            Select Student
          </option>


          ${students.map(function(s) {

            return `

              <option
                value="${U.esc(s.id)}"
                ${
                  s.id === studentId
                    ? "selected"
                    : ""
                }>

                ${U.esc(s.name)}

                ${
                  s.className
                    ? " — " +
                      U.esc(
                        s.className
                      )
                    : ""
                }

              </option>

            `;

          }).join("")}


        </select>

      </div>


      <div>

        <label class="label">
          তারিখ
        </label>

        <input
          id="pDate"
          class="input"
          type="date"
          value="${U.today()}">

      </div>


      <div>

        <label class="label">
          মাস
        </label>


        <select
          id="pMonth"
          class="select">


          ${U.months.map(function(m, i) {

            var selected =
              i + 1 === Number(
                APP.selectedMonth ||
                (
                  APP.settings &&
                  APP.settings.month
                ) ||
                new Date().getMonth() + 1
              );


            return `

              <option
                value="${i + 1}"
                ${
                  selected
                    ? "selected"
                    : ""
                }>

                ${m}

              </option>

            `;

          }).join("")}


        </select>

      </div>


      <div>

        <label class="label">
          Amount
        </label>

        <input
          id="pAmount"
          class="input"
          type="number"
          min="1"
          placeholder="Amount">

      </div>


      <div class="full">

        <label class="label">
          মন্তব্য
        </label>


        <textarea
          id="pComment"
          class="textarea"
          rows="3"
          placeholder="Optional comment"></textarea>

      </div>


    </div>


    <div
      class="flex gap-2"
      style="
        justify-content:flex-end;
        margin-top:15px
      ">


      <button
        type="button"
        class="btn btn-soft"
        onclick="APP.closeModal()">

        Cancel

      </button>


      <button
        type="button"
        class="btn btn-primary"
        onclick="APP.savePayment()">

        Save Payment

      </button>


    </div>

  `);

};


/* =========================================================
   SAVE PAYMENT + AUTO RECEIPT
========================================================= */

APP.savePayment = function() {

  var studentId =
    $("pStudent").value;


  var date =
    $("pDate").value ||
    U.today();


  var month =
    Number(
      $("pMonth").value
    );


  var amount =
    Number(
      $("pAmount").value || 0
    );


  var comment =
    $("pComment").value.trim();


  if (!studentId) {

    alert(
      "Student নির্বাচন করুন"
    );

    return;

  }


  if (amount <= 0) {

    alert(
      "সঠিক Amount দিন"
    );

    return;

  }


  var d =
    new Date(date);

  var student =
    StudentModule.get(studentId);

  var newPayment = {

    id: U.id(),

    studentId:
      studentId,

    studentName:
      student ? student.name : "",

    year:
      d.getFullYear(),

    month:
      month,

    date:
      date,

    amount:
      amount,

    comment:
      comment

  };


  APP.payments.push(
    newPayment
  );


  APP.save();

  APP.closeModal();

  APP.render();


  setTimeout(function() {

    if (
      window.ReceiptModule &&
      typeof ReceiptModule.open ===
        "function"
    ) {

      ReceiptModule.open(
        newPayment.id
      );

    }

  }, 150);

};


/* =========================================================
   FULL YEAR PAYMENT HISTORY
   + YEAR SWITCHER
========================================================= */

APP.paymentHistory = function(
  studentId,
  year
) {

  var student =
    StudentModule.get(
      studentId
    );


  if (!student) {

    alert(
      "Student পাওয়া যায়নি"
    );

    return;

  }


  year =
    Number(
      year ||
      new Date().getFullYear()
    );


  var fee =
    Number(
      student.fee || 0
    );


  APP.renderStudentYearHistory =
    function(
      selectedStudentId,
      selectedYear
    ) {

      var selectedStudent =
        StudentModule.get(
          selectedStudentId
        );


      if (!selectedStudent) {

        alert(
          "Student পাওয়া যায়নি"
        );

        return;

      }


      selectedYear =
        Number(
          selectedYear
        );


      var selectedFee =
        Number(
          selectedStudent.fee || 0
        );


      var totalPaid =
        0;


      var totalDue =
        0;


      var paidMonths =
        0;


      var monthHTML =
        "";


      for (
        var m = 1;
        m <= 12;
        m++
      ) {

        var monthPayments =
          PaymentModule.studentMonthPayments(
            selectedStudentId,
            selectedYear,
            m
          );


        var monthPaid =
          monthPayments.reduce(
            function(sum, p) {

              return sum +
                Number(
                  p.amount || 0
                );

            },
            0
          );


        var monthDue =
          Math.max(
            selectedFee -
              monthPaid,
            0
          );


        totalPaid +=
          monthPaid;


        totalDue +=
          monthDue;


        if (
          selectedFee > 0 &&
          monthPaid >= selectedFee
        ) {

          paidMonths++;

        }


        var monthStatus =
          "Due";


        var monthStatusClass =
          "due";


        if (
          selectedFee > 0 &&
          monthPaid >= selectedFee
        ) {

          monthStatus =
            "Paid";

          monthStatusClass =
            "paid";

        }

        else if (
          monthPaid > 0
        ) {

          monthStatus =
            "Partial";

          monthStatusClass =
            "partial";

        }


        var paymentHTML =
          "";


        if (
          monthPayments.length
        ) {

          paymentHTML = `

            <div
              class="
                history-payment-list
              ">


              ${monthPayments.map(
                function(p) {

                  return `

                    <div
                      class="
                        history-payment-item
                      ">


                      <div
                        class="
                          history-payment-top
                        ">


                        <div
                          class="
                            history-payment-date
                          ">

                          ${U.esc(
                            p.date ||
                            "—"
                          )}

                        </div>


                        <div
                          class="
                            history-payment-amount
                          ">

                          ${U.money(
                            p.amount
                          )}

                        </div>


                      </div>


                      ${
                        p.comment
                          ? `

                            <div
                              class="
                                history-payment-comment
                              ">

                              ${U.esc(
                                p.comment
                              )}

                            </div>

                          `
                          : ""
                      }


                      <div
                        class="
                          payment-actions-row
                          history-payment-actions
                        ">


                        <button
                          type="button"
                          class="
                            payment-action-btn
                            payment-action-receipt
                          "
                          onclick="
                            ReceiptModule.open('${p.id}')
                          ">

                          🧾 Receipt

                        </button>


                        <button
                          type="button"
                          class="
                            payment-action-btn
                            payment-action-edit
                          "
                          onclick="
                            PaymentActions.edit('${p.id}')
                          ">

                          ✏ Edit

                        </button>


                        <button
                          type="button"
                          class="
                            payment-action-btn
                            payment-action-delete
                          "
                          onclick="
                            PaymentActions.remove('${p.id}')
                          ">

                          🗑 Delete

                        </button>


                      </div>


                    </div>

                  `;

                }
              ).join("")}


            </div>

          `;

        }

        else {

          paymentHTML = `

            <div
              class="
                history-no-payment
              ">

              এই মাসে কোনো payment নেই।

            </div>

          `;

        }


        monthHTML += `

          <div
            class="
              history-month-card
            ">


            <div
              class="
                history-month-top
              ">


              <div
                class="
                  history-month-name
                ">

                ${U.months[m - 1]}

              </div>


              <div
                class="
                  history-month-status
                  ${monthStatusClass}
                ">

                ${monthStatus}

              </div>


            </div>


            <div
              class="
                history-month-info
              ">


              <div
                class="
                  history-month-info-box
                ">

                <div
                  class="
                    history-month-info-label
                  ">

                  Fee

                </div>


                <div
                  class="
                    history-month-info-value
                  ">

                  ${U.money(
                    selectedFee
                  )}

                </div>

              </div>


              <div
                class="
                  history-month-info-box
                ">

                <div
                  class="
                    history-month-info-label
                  ">

                  Paid

                </div>


                <div
                  class="
                    history-month-info-value
                  ">

                  ${U.money(
                    monthPaid
                  )}

                </div>

              </div>


              <div
                class="
                  history-month-info-box
                ">

                <div
                  class="
                    history-month-info-label
                  ">

                  Due

                </div>


                <div
                  class="
                    history-month-info-value
                  ">

                  ${U.money(
                    monthDue
                  )}

                </div>

              </div>


            </div>


            ${paymentHTML}


          </div>

        `;

      }


      APP.modal(`

        <h3
          class="text-xl font-bold">

          Payment History

        </h3>


        <div
          class="
            year-history-header
          ">


          <div
            class="
              year-history-student
            ">

            ${U.esc(
              selectedStudent.name
            )}

          </div>


          <div
            class="
              year-history-sub
            ">

            ${U.esc(
              selectedStudent.className ||
              "—"
            )}

          </div>


          <!-- YEAR SELECTOR -->

          <div
            class="
              history-year-selector
            ">


            <button
              type="button"
              class="
                history-year-btn
              "
              onclick="
                APP.renderStudentYearHistory(
                  '${selectedStudentId}',
                  ${selectedYear - 1}
                )
              ">

              ‹

            </button>


            <div
              class="
                history-year-current
              ">

              ${selectedYear}

              <small>
                Payment Year
              </small>

            </div>


            <button
              type="button"
              class="
                history-year-btn
              "
              onclick="
                APP.renderStudentYearHistory(
                  '${selectedStudentId}',
                  ${selectedYear + 1}
                )
              ">

              ›

            </button>


          </div>


          <div
            class="
              year-summary-grid
            ">


            <div
              class="
                year-summary-box
              ">

              <div
                class="
                  year-summary-label
                ">

                Yearly Paid

              </div>


              <div
                class="
                  year-summary-value
                ">

                ${U.money(
                  totalPaid
                )}

              </div>

            </div>


            <div
              class="
                year-summary-box
              ">

              <div
                class="
                  year-summary-label
                ">

                Total Due

              </div>


              <div
                class="
                  year-summary-value
                ">

                ${U.money(
                  totalDue
                )}

              </div>

            </div>


            <div
              class="
                year-summary-box
              ">

              <div
                class="
                  year-summary-label
                ">

                Paid Months

              </div>


              <div
                class="
                  year-summary-value
                ">

                ${paidMonths} / 12

              </div>

            </div>


          </div>


        </div>


        <div
          class="
            history-month-list
          ">

          ${monthHTML}

        </div>


        <div
          style="
            text-align:right;
            margin-top:12px;
          ">


          <button
            type="button"
            class="btn btn-soft"
            onclick="
              APP.closeModal()
            ">

            Close

          </button>


        </div>

      `);

    };


  APP.renderStudentYearHistory(
    studentId,
    year
  );

};