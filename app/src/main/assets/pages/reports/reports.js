window.APP = window.APP || {};


/* =========================================================
   REPORT MODULE
   ========================================================= */

window.ReportModule = {

  /* =======================================================
     MONTH ROWS
  ======================================================= */

  monthRows: function(year) {

    var students = APP.students || [];

    return U.months.map(function(name, i) {

      var month = i + 1;

      var total =
        PaymentModule.monthTotal(
          year,
          month
        );


      var paidStudents =
        students.filter(function(s) {

          return (
            StudentModule.status(
              s,
              year,
              month
            ) === "Paid"
          );

        }).length;


      var notStudiedStudents =
        students.filter(function(s) {
          return (
            StudentModule.status(
              s,
              year,
              month
            ) === "এই মাস পড়েনি"
          );
        }).length;

      var due =
        Math.max(
          0,
          students.length -
          paidStudents -
          notStudiedStudents
        );


      return {
        month: month,
        name: name,
        total: total,
        students: students.length,
        paid: paidStudents,
        due: due
      };

    });
  },


  /* =======================================================
     YEAR TOTAL
  ======================================================= */

  yearTotal: function(year) {

    return PaymentModule.yearTotal(
      year
    );

  },


  /* =======================================================
     TOTAL PAID STUDENTS
  ======================================================= */

  totalPaidStudents: function(year) {

    var students =
      APP.students || [];

    var count = 0;


    students.forEach(function(s) {

      for (var month = 1; month <= 12; month++) {

        if (
          StudentModule.status(
            s,
            year,
            month
          ) === "Paid"
        ) {
          count++;
        }

      }

    });


    return count;
  }

};


/* =========================================================
   REPORT PAGE
   ========================================================= */

APP.reports = function() {

  var self = this;


  var year = Number(
    this.selectedYear ||
    (
      APP.settings &&
      APP.settings.year
    ) ||
    new Date().getFullYear()
  );


  var rows =
    ReportModule.monthRows(
      year
    );


  var totalCollection =
    ReportModule.yearTotal(
      year
    );


  var students =
    APP.students || [];


  var totalDue =
    rows.reduce(function(
      sum,
      row
    ) {

      return sum + row.due;

    }, 0);


  var totalPaid =
    rows.reduce(function(
      sum,
      row
    ) {

      return sum + row.paid;

    }, 0);


  /* =======================================================
     REPORT HTML
  ======================================================= */

  this.shell(
    `
    <div class="space-y-3">


      <!-- =================================================
           HEADER
      ================================================== -->

      <div
        class="flex items-center justify-between"
        style="
          gap:10px;
        "
      >

        <div>

          <h2
            class="text-lg font-bold text-slate-800"
            style="
              line-height:1.25;
            "
          >
            Reports
          </h2>

          <p
            class="text-xs text-slate-500"
            style="
              margin-top:2px;
            "
          >
            ${year} সালের হিসাব
          </p>

        </div>

      </div>


      <!-- =================================================
           YEAR SUMMARY
      ================================================== -->

      <div
        style="
          display:grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap:7px;
        "
      >

        <!-- Collection -->

        <div
          class="card"
          style="
            padding:9px 8px;
            border-radius:10px;
            min-width:0;
          "
        >

          <div
            class="text-xs text-slate-500"
          >
            Collection
          </div>

          <div
            class="font-bold"
            style="
              font-size:15px;
              margin-top:3px;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
            "
          >
            ${U.money(totalCollection)}
          </div>

        </div>


        <!-- Paid -->

        <div
          class="card"
          style="
            padding:9px 8px;
            border-radius:10px;
            min-width:0;
          "
        >

          <div
            class="text-xs text-slate-500"
          >
            Paid
          </div>

          <div
            class="font-bold"
            style="
              font-size:15px;
              margin-top:3px;
            "
          >
            ${totalPaid}
          </div>

        </div>


        <!-- Due -->

        <div
          class="card"
          style="
            padding:9px 8px;
            border-radius:10px;
            min-width:0;
          "
        >

          <div
            class="text-xs text-slate-500"
          >
            Due
          </div>

          <div
            class="font-bold"
            style="
              font-size:15px;
              margin-top:3px;
            "
          >
            ${totalDue}
          </div>

        </div>

      </div>


      <!-- =================================================
           MONTHLY REPORT
      ================================================== -->

      <div
        class="card"
        style="
          padding:10px;
          border-radius:11px;
        "
      >

        <div
          style="
            font-size:14px;
            font-weight:700;
            margin-bottom:8px;
          "
        >
          Monthly Collection
        </div>


        <div
          style="
            display:flex;
            flex-direction:column;
            gap:5px;
          "
        >

          ${rows.map(function(row) {

            var isCurrent =
              Number(
                APP.selectedMonth ||
                (
                  APP.settings &&
                  APP.settings.month
                ) ||
                new Date().getMonth() + 1
              ) === row.month;


            return `
              <div
                style="
                  display:grid;
                  grid-template-columns:
                    82px
                    minmax(70px,1fr)
                    48px
                    48px;
                  align-items:center;
                  gap:5px;
                  padding:7px 6px;
                  border-radius:8px;
                  ${
                    isCurrent
                      ? "background:#f8fafc;"
                      : ""
                  }
                "
              >

                <!-- Month -->

                <div
                  style="
                    font-size:12px;
                    font-weight:
                      ${isCurrent
                        ? "700"
                        : "600"};
                    color:#334155;
                  "
                >
                  ${row.name}
                </div>


                <!-- Collection -->

                <div
                  style="
                    min-width:0;
                  "
                >

                  <div
                    style="
                      font-size:12px;
                      font-weight:700;
                      white-space:nowrap;
                      overflow:hidden;
                      text-overflow:ellipsis;
                    "
                  >
                    ${U.money(row.total)}
                  </div>

                </div>


                <!-- Paid -->

                <div
                  style="
                    text-align:center;
                  "
                >

                  <div
                    style="
                      font-size:9px;
                      color:#64748b;
                    "
                  >
                    Paid
                  </div>

                  <div
                    style="
                      font-size:11px;
                      font-weight:700;
                    "
                  >
                    ${row.paid}
                  </div>

                </div>


                <!-- Due -->

                <div
                  style="
                    text-align:center;
                  "
                >

                  <div
                    style="
                      font-size:9px;
                      color:#64748b;
                    "
                  >
                    Due
                  </div>

                  <div
                    style="
                      font-size:11px;
                      font-weight:700;
                    "
                  >
                    ${row.due}
                  </div>

                </div>

              </div>
            `;

          }).join("")}

        </div>

      </div>


      <!-- =================================================
           STUDENT SUMMARY
      ================================================== -->

      <div
        class="card"
        style="
          padding:10px;
          border-radius:11px;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:8px;
          "
        >

          <div
            style="
              font-size:14px;
              font-weight:700;
            "
          >
            Student Summary
          </div>

          <div
            class="text-xs text-slate-500"
          >
            ${students.length} Students
          </div>

        </div>


        ${
          students.length
            ? `
              <div
                style="
                  display:flex;
                  flex-direction:column;
                  gap:5px;
                  margin-top:8px;
                "
              >

                ${students.map(function(s) {

                  var paidMonths = 0;

                  var totalPaidAmount = 0;


                  for (
                    var m = 1;
                    m <= 12;
                    m++
                  ) {

                    var monthPaid =
                      StudentModule.paid(
                        s.id,
                        year,
                        m
                      );


                    if (monthPaid > 0) {

                      totalPaidAmount +=
                        monthPaid;

                    }


                    if (
                      StudentModule.status(
                        s,
                        year,
                        m
                      ) === "Paid"
                    ) {

                      paidMonths++;

                    }

                  }


                  return `
                    <div
                      style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:8px;
                        padding:7px 6px;
                        border-radius:8px;
                        background:#f8fafc;
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
                            font-size:12px;
                            font-weight:700;
                            white-space:nowrap;
                            overflow:hidden;
                            text-overflow:ellipsis;
                          "
                        >
                          ${U.esc(s.name)}
                        </div>

                        <div
                          style="
                            font-size:9px;
                            color:#64748b;
                            margin-top:2px;
                          "
                        >
                          ${
                            s.className
                              ? "Class: " +
                                U.esc(
                                  s.className
                                )
                              : ""
                          }

                          ${
                            s.className &&
                            s.phone
                              ? " • "
                              : ""
                          }

                          ${
                            s.phone
                              ? U.esc(
                                  s.phone
                                )
                              : ""
                          }
                        </div>

                      </div>


                      <div
                        style="
                          text-align:right;
                          flex-shrink:0;
                        "
                      >

                        <div
                          style="
                            font-size:11px;
                            font-weight:700;
                          "
                        >
                          ${U.money(
                            totalPaidAmount
                          )}
                        </div>

                        <div
                          style="
                            font-size:9px;
                            color:#64748b;
                            margin-top:1px;
                          "
                        >
                          ${paidMonths}/12 Paid
                        </div>

                      </div>

                    </div>
                  `;

                }).join("")}

              </div>
            `
            : `
              <div
                class="text-center text-slate-500"
                style="
                  padding:20px 5px 10px;
                  font-size:12px;
                "
              >
                কোনো Student নেই।
              </div>
            `
        }

      </div>


    </div>
    `,
    "Reports"
  );
};