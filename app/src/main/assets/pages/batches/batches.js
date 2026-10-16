/* ============================================================
   BATCH DETAILS + STUDENT MANAGEMENT
   File:
   pages/batches/batches.js

   Phase 5:
   - Batch Details
   - Add Student to Batch
   - Add New Student to Batch
   - Add Existing Student to Batch
   - Edit Student
   - Remove Student from Batch
   - Delete Student
   - Student count update
   - Payment history preserved

   IMPORTANT:
   - Existing design preserved
   - No Student data is deleted when removing from Batch
   - Existing Student can be assigned to any Batch
   ============================================================ */


window.BatchPage = window.BatchPage || {};


/* ============================================================
   CURRENT BATCH
   ============================================================ */

APP.currentBatchId =
  APP.currentBatchId || "";


/* ============================================================
   OPEN BATCH DETAILS
   ============================================================ */

APP.openBatch = function(id) {

  var batch =
    BatchModule.get(id);

  if (!batch) {

    alert("Batch পাওয়া যায়নি।");

    return;

  }


  APP.currentBatchId =
    String(id);


  APP.page =
    "batchDetails";


  APP.render();

};


/* ============================================================
   BATCH DETAILS PAGE
   ============================================================ */

APP.batchDetailsPage = function() {

  var batch =
    BatchModule.get(
      APP.currentBatchId
    );


  if (!batch) {

    APP.go("students");

    return;

  }


  var year =
    APP.settings.year;

  var month =
    APP.settings.month;


  var studentCount =
    BatchModule.studentCount(
      batch.id
    );


  var collected =
    BatchModule.monthlyPaid(
      batch.id,
      year,
      month
    );


  var due =
    BatchModule.monthlyDue(
      batch.id,
      year,
      month
    );


  APP.shell(

    `

      <!-- BACK -->

      <div
        style="
          margin-bottom:14px
        "
      >

        <button
          class="btn btn-soft"
          onclick="APP.backToBatches()"
        >
          ← Batches
        </button>

      </div>


      <!-- BATCH HEADER -->

      <div
        class="card"
        style="
          margin-bottom:12px
        "
      >

        <div
          style="
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:12px
          "
        >

          <div
            style="
              min-width:0;
              flex:1
            "
          >

            <div
              style="
                font-size:22px;
                font-weight:800;
                line-height:1.3
              "
            >
              📚
              ${U.esc(
                batch.name ||
                "নামহীন ব্যাচ"
              )}
            </div>


            <div
              class="muted"
              style="
                margin-top:6px;
                font-size:14px
              "
            >

              ${
                batch.className
                  ? "Class " +
                    U.esc(
                      batch.className
                    )
                  : ""
              }

              ${
                batch.time
                  ? (
                      batch.className
                        ? " • "
                        : ""
                    ) +
                    U.esc(batch.time)
                  : ""
              }

            </div>

          </div>


          <button
            class="btn btn-soft"
            onclick="
              APP.editBatchFromDetails(
                '${U.esc(batch.id)}'
              )
            "
          >
            ✏
          </button>

        </div>


        <!-- BATCH STATS -->

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:9px;
            margin-top:18px
          "
        >

          <div
            style="
              background:#f8fafc;
              border-radius:10px;
              padding:12px
            "
          >

            <div
              class="muted"
              style="font-size:12px"
            >
              Students
            </div>

            <div
              id="batchStudentCount"
              style="
                font-size:21px;
                font-weight:800;
                margin-top:3px
              "
            >
              ${studentCount}
            </div>

          </div>


          <div
            style="
              background:#f8fafc;
              border-radius:10px;
              padding:12px
            "
          >

            <div
              class="muted"
              style="font-size:12px"
            >
              Monthly Fee
            </div>

            <div
              style="
                font-size:19px;
                font-weight:800;
                margin-top:3px
              "
            >
              ${U.money(
                batch.monthlyFee ||
                batch.fee ||
                0
              )}
            </div>

          </div>


          <div
            style="
              background:#f8fafc;
              border-radius:10px;
              padding:12px
            "
          >

            <div
              class="muted"
              style="font-size:12px"
            >
              এই মাসে সংগ্রহ
            </div>

            <div
              id="batchCollected"
              style="
                font-size:18px;
                font-weight:800;
                margin-top:3px
              "
            >
              ${U.money(collected)}
            </div>

          </div>


          <div
            style="
              background:#f8fafc;
              border-radius:10px;
              padding:12px
            "
          >

            <div
              class="muted"
              style="font-size:12px"
            >
              এই মাসে বাকি
            </div>

            <div
              id="batchDue"
              style="
                font-size:18px;
                font-weight:800;
                margin-top:3px
              "
            >
              ${U.money(due)}
            </div>

          </div>

        </div>

      </div>


      <!-- TABS -->

      <div
        class="card"
        style="
          padding:6px;
          margin-bottom:12px
        "
      >

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr 1fr;
            gap:5px
          "
        >

          <button
            class="btn"
            style="
              font-size:13px;
              padding:9px 5px
            "
          >
            Students
          </button>


          <button
            class="btn btn-soft"
            style="
              font-size:13px;
              padding:9px 5px
            "
            onclick="
              APP.batchPaymentsTab(
                '${U.esc(batch.id)}'
              )
            "
          >
            Payments
          </button>


          <button
            class="btn btn-soft"
            style="
              font-size:13px;
              padding:9px 5px
            "
            onclick="
              APP.batchReportTab(
                '${U.esc(batch.id)}'
              )
            "
          >
            Report
          </button>

        </div>

      </div>


      <!-- STUDENT HEADER -->

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          margin-bottom:10px
        "
      >

        <div>

          <div
            style="
              font-size:18px;
              font-weight:800
            "
          >
            👨‍🎓 Students
          </div>

          <div
            class="muted"
            style="
              margin-top:3px;
              font-size:13px
            "
          >
            এই ব্যাচের শিক্ষার্থী
          </div>

        </div>


        <button
          class="btn"
          onclick="
            APP.addStudentToBatch(
              '${U.esc(batch.id)}'
            )
          "
        >
          ＋ Add Student
        </button>

      </div>


      <!-- STUDENTS -->

      <div
        id="batchStudentsList"
      ></div>

    `,

    "Batch Details"

  );


  APP.renderBatchStudents(
    batch.id
  );

};


/* ============================================================
   BACK TO STUDENTS / BATCH LIST
   ============================================================ */

APP.backToBatches = function() {

  APP.currentBatchId =
    "";

  APP.go("students");

};


/* ============================================================
   EDIT BATCH
   ============================================================ */

APP.editBatchFromDetails = function(id) {

  if (
    typeof APP.batchModal ===
    "function"
  ) {

    APP.batchModal(id);

  }

};


/* ============================================================
   RENDER BATCH STUDENTS
   ============================================================ */

APP.renderBatchStudents = function(batchId) {

  var box =
    document.getElementById(
      "batchStudentsList"
    );


  if (!box) {
    return;
  }


  var students =
    APP.students || [];


  var list = [];


  for (var i = 0; i < students.length; i++) {

    if (
      String(
        students[i].batchId || ""
      ) ===
      String(batchId)
    ) {

      list.push(
        students[i]
      );

    }

  }


  /* ==========================================================
     UPDATE COUNT
     ========================================================== */

  var countBox =
    document.getElementById(
      "batchStudentCount"
    );


  if (countBox) {

    countBox.innerHTML =
      list.length;

  }


  /* ==========================================================
     EMPTY
     ========================================================== */

  if (!list.length) {

    box.innerHTML =

      '<div ' +
        'class="card" ' +
        'style="text-align:center;padding:25px"' +
      '>' +

        '<div style="font-size:36px">' +
          '👨‍🎓' +
        '</div>' +

        '<div ' +
          'style="' +
            'font-weight:800;' +
            'margin-top:8px;' +
            'font-size:17px' +
          '"' +
        '>' +
          'এই ব্যাচে কোনো শিক্ষার্থী নেই' +
        '</div>' +

        '<div ' +
          'class="muted" ' +
          'style="margin-top:5px"' +
        '>' +
          'Add Student দিয়ে শিক্ষার্থী যোগ করুন।' +
        '</div>' +

        '<button ' +
          'class="btn" ' +
          'style="margin-top:14px"' +
          'onclick="APP.addStudentToBatch(\'' +
            U.esc(batchId) +
          '\')"' +
        '>' +
          '＋ Add Student' +
        '</button>' +

      '</div>';

    return;

  }


  var html = "";


  for (
    var j = 0;
    j < list.length;
    j++
  ) {

    var student =
      list[j];


    var paid =
      StudentModule.paid(
        student.id,
        APP.settings.year,
        APP.settings.month
      );


    var status =
      StudentModule.status(
        student,
        APP.settings.year,
        APP.settings.month
      );


    var statusStyle =

      status === "Paid"

        ? "background:#dcfce7;color:#166534;"

        : status === "Partial"

          ? "background:#fef3c7;color:#92400e;"

          : status === "এই মাস পড়েনি"

            ? "background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;"

            : "background:#fee2e2;color:#991b1b;";


    html +=

      '<div ' +
        'class="card" ' +
        'style="margin-bottom:10px"' +
      '>' +


        '<div ' +
          'style="' +
            'display:flex;' +
            'align-items:flex-start;' +
            'justify-content:space-between;' +
            'gap:10px' +
          '"' +
        '>' +


          '<div ' +
            'style="min-width:0;flex:1;cursor:pointer" ' +
            'onclick="APP.studentProfileFromBatch(\'' +
              U.esc(student.id) +
            '\')"' +
          '>' +


            '<div ' +
              'style="' +
                'font-size:17px;' +
                'font-weight:800' +
              '"' +
            '>' +

              U.esc(
                student.name
              ) +

            '</div>' +


            '<div ' +
              'class="muted" ' +
              'style="margin-top:4px"' +
            '>' +

              (
                student.className
                  ? "Class " +
                    U.esc(
                      student.className
                    )
                  : "Class not set"
              ) +

              (
                student.phone
                  ? " • " +
                    U.esc(
                      student.phone
                    )
                  : ""
              ) +

            '</div>' +


          '</div>' +


          '<div ' +
            'style="' +
              'font-size:12px;' +
              'font-weight:800;' +
              'padding:5px 9px;' +
              'border-radius:20px;' +
              statusStyle +
            '"' +
          '>' +

            status +

          '</div>' +

        '</div>' +


        '<div ' +
          'style="' +
            'display:flex;' +
            'justify-content:space-between;' +
            'align-items:center;' +
            'margin-top:11px;' +
            'padding-top:10px;' +
            'border-top:1px solid #eef2f7' +
          '"' +
        '>' +


          '<div ' +
            'class="muted"' +
          '>' +

            'Paid: ' +
            U.money(paid) +

          '</div>' +


          '<div ' +
            'style="font-weight:800; cursor:pointer;" ' +
            'onclick="if(APP.quickEditFee){APP.quickEditFee(\'' + U.esc(student.id) + '\')}else if(APP.editStudent){APP.editStudent(\'' + U.esc(student.id) + '\')}" ' +
            'title="মাসিক ফি পরিবর্তন করতে ক্লিক করুন"' +
          '>' +

            'Fee: ' +
            U.money(
              student.fee
            ) +
            ' <span style="font-size:10px; color:#38bdf8;">✏</span>' +

          '</div>' +


        '</div>' +


        '<div ' +
          'style="' +
            'display:flex;' +
            'gap:7px;' +
            'margin-top:10px' +
          '"' +
        '>' +


          '<button ' +
            'class="btn btn-soft" ' +
            'style="flex:1"' +
            'onclick="APP.editBatchStudent(\'' +
              U.esc(student.id) +
            '\')"' +
          '>' +

            '✏ Edit' +

          '</button>' +


          '<button ' +
            'class="btn btn-soft" ' +
            'style="flex:1"' +
            'onclick="APP.removeStudentFromBatch(\'' +
              U.esc(student.id) +
            '\',\'' +
              U.esc(batchId) +
            '\')"' +
          '>' +

            '↪ Remove' +

          '</button>' +


        '</div>' +

      '</div>';

  }


  box.innerHTML =
    html;

};


/* ============================================================
   ADD STUDENT TO BATCH
   ============================================================ */

APP.addStudentToBatch = function(batchId) {

  var batch =
    BatchModule.get(batchId);


  if (!batch) {

    alert("Batch পাওয়া যায়নি।");

    return;

  }


  /*
   * এখানে কোনো Batch hardcode করা হয়নি।
   *
   * যে Batch-এর Add Student button চাপা হয়েছে,
   * সেই batchId পরের সব action-এর সাথে থাকবে।
   */

  APP.modal(

    `

      <h3
        class="text-xl font-bold"
      >
        Batch-এ Student যোগ করুন
      </h3>


      <p
        class="text-xs text-slate-500 mt-2"
      >

        Batch:
        <b>
          ${U.esc(batch.name)}
        </b>

      </p>


      <div
        style="
          margin-top:15px
        "
      >

        <!-- NEW STUDENT -->

        <button
          class="btn btn-soft"
          style="
            width:100%;
            text-align:left;
            padding:14px;
            margin-bottom:8px;
          "
          onclick="
            APP.closeModal();
            APP.newStudentForBatch(
              '${U.esc(batch.id)}'
            )
          "
        >

          🆕 নতুন ভর্তি হওয়া Student

          <div
            class="text-xs text-slate-500"
            style="margin-top:4px"
          >
            নতুন Student তৈরি করে এই Batch-এ যোগ করুন
          </div>

        </button>


        <!-- EXISTING STUDENT -->

        <button
          class="btn btn-primary"
          style="
            width:100%;
            text-align:left;
            padding:14px;
          "
          onclick="
            APP.closeModal();
            APP.existingStudentsForBatch(
              '${U.esc(batch.id)}'
            )
          "
        >

          👨‍🎓 আগে থেকেই Student List-এ আছে

          <div
            class="text-xs"
            style="
              margin-top:4px;
              opacity:.8;
            "
          >
            Student List থেকে একজনকে এই Batch-এ যোগ করুন
          </div>

        </button>

      </div>


      <div
        style="
          display:flex;
          justify-content:flex-end;
          margin-top:15px
        "
      >

        <button
          class="btn btn-soft"
          onclick="
            APP.closeModal()
          "
        >
          Cancel
        </button>

      </div>

    `

  );

};


/* ============================================================
   NEW STUDENT FOR SPECIFIC BATCH
   ============================================================ */

APP.newStudentForBatch = function(batchId) {

  var batch =
    BatchModule.get(batchId);


  if (!batch) {

    alert("Batch পাওয়া যায়নি।");

    return;

  }


  /*
   * Student form-এর existing design ব্যবহার করছি।
   *
   * selectedBatch পাঠানোর কারণে
   * নতুন Student Save করলে এই Batch-এই যুক্ত হবে।
   */

  APP.studentModal(
    String(batchId)
  );

};


/* ============================================================
   EXISTING STUDENTS LIST FOR SPECIFIC BATCH
   ============================================================ */

APP.existingStudentsForBatch =
  function(batchId) {

    var batch =
      BatchModule.get(batchId);


    if (!batch) {

      alert("Batch পাওয়া যায়নি।");

      return;

    }


    var students =
      APP.students || [];


    /*
     * এই Batch-এ আগে থেকেই যারা আছে
     * তাদের আবার দেখাব না।
     *
     * অন্য Batch-এর Student-কে দেখানো হবে,
     * কারণ তাকে এই Batch-এ assign করা যাবে।
     */

    var available = [];


    for (
      var i = 0;
      i < students.length;
      i++
    ) {

      var student =
        students[i];


      if (
        String(
          student.batchId || ""
        ) ===
        String(batchId)
      ) {

        continue;

      }


      available.push(
        student
      );

    }


    var html =
      "";


    /* ========================================================
       NO STUDENT
       ======================================================== */

    if (!available.length) {

      html =

        '<div ' +
          'class="card" ' +
          'style="' +
            'text-align:center;' +
            'padding:20px;' +
            'background:#f8fafc;' +
            'border:1px solid #e2e8f0' +
          '"' +
        '>' +

          '<div style="font-size:32px">' +
            '👨‍🎓' +
          '</div>' +

          '<div ' +
            'style="' +
              'font-weight:800;' +
              'margin-top:8px' +
            '"' +
          '>' +
            'কোনো Existing Student পাওয়া যায়নি' +
          '</div>' +

          '<div ' +
            'class="text-xs text-slate-500" ' +
            'style="margin-top:5px"' +
          '>' +
            'অথবা সব Student ইতিমধ্যে এই Batch-এ আছে।' +
          '</div>' +

        '</div>';

    }


    /* ========================================================
       STUDENT LIST
       ======================================================== */

    else {

      html =

        '<div ' +
          'style="' +
            'margin-top:12px;' +
            'max-height:360px;' +
            'overflow-y:auto' +
          '"' +
        '>';


      for (
        var j = 0;
        j < available.length;
        j++
      ) {

        var s =
          available[j];


        var currentBatch =
          BatchModule.get(
            s.batchId
          );


        html +=

          '<button ' +
            'class="card" ' +
            'style="' +
              'width:100%;' +
              'text-align:left;' +
              'margin-bottom:8px;' +
              'cursor:pointer;' +
              'border:1px solid #e2e8f0;' +
              'background:#fff' +
            '"' +
            'onclick="APP.assignExistingStudentToBatch(\'' +
              U.esc(s.id) +
            '\',\'' +
              U.esc(batchId) +
            '\')"' +
          '>' +


            '<div ' +
              'style="' +
                'display:flex;' +
                'align-items:center;' +
                'gap:10px' +
              '"' +
            '>' +


              '<div ' +
                'class="avatar"' +
              '>' +

                U.esc(
                  (s.name || "?")
                    .trim()
                    .charAt(0)
                ) +

              '</div>' +


              '<div ' +
                'style="min-width:0;flex:1"' +
              '>' +

                '<div ' +
                  'style="font-weight:800"' +
                '>' +

                  U.esc(
                    s.name
                  ) +

                '</div>' +


                '<div ' +
                  'class="text-xs text-slate-500" ' +
                  'style="margin-top:3px"' +
                '>' +

                  (
                    s.className
                      ? "Class " +
                        U.esc(
                          s.className
                        )
                      : ""
                  ) +

                  (
                    s.phone
                      ? (
                          s.className
                            ? " • "
                            : ""
                        ) +
                        U.esc(
                          s.phone
                        )
                      : ""
                  ) +

                '</div>' +


                '<div ' +
                  'class="text-xs" ' +
                  'style="' +
                    'margin-top:4px;' +
                    'color:#2563eb;' +
                    'font-weight:600' +
                  '"' +
                '>' +

                  (
                    currentBatch
                      ? "📚 বর্তমানে: " +
                        U.esc(
                          currentBatch.name
                        )
                      : "📚 বর্তমানে কোনো Batch নেই"
                  ) +

                '</div>' +

              '</div>' +


              '<div ' +
                'style="' +
                  'font-size:20px;' +
                  'font-weight:800;' +
                  'color:#2563eb' +
                '"' +
              '>' +

                '＋' +

              '</div>' +

            '</div>' +

          '</button>';

      }


      html +=
        '</div>';

    }


    APP.modal(

      `

        <h3
          class="text-xl font-bold"
        >
          Existing Student
        </h3>


        <p
          class="text-xs text-slate-500 mt-2"
        >

          কোন Student-কে

          <b>
            ${U.esc(batch.name)}
          </b>

          Batch-এ যোগ করবেন নির্বাচন করুন।

        </p>


        ${html}


        <div
          style="
            display:flex;
            justify-content:flex-end;
            margin-top:15px
          "
        >

          <button
            class="btn btn-soft"
            onclick="
              APP.closeModal()
            "
          >
            Cancel
          </button>

        </div>

      `

    );

  };


/* ============================================================
   ASSIGN EXISTING STUDENT TO BATCH
   ============================================================ */

APP.assignExistingStudentToBatch =
  function(
    studentId,
    batchId
  ) {

    var student =
      StudentModule.get(
        studentId
      );


    if (!student) {

      alert("Student পাওয়া যায়নি।");

      return;

    }


    var batch =
      BatchModule.get(
        batchId
      );


    if (!batch) {

      alert("Batch পাওয়া যায়নি।");

      return;

    }


    /*
     * একই Batch-এ থাকলে duplicate হবে না।
     */

    if (
      String(
        student.batchId || ""
      ) ===
      String(batchId)
    ) {

      alert(
        "এই Student ইতিমধ্যেই এই Batch-এ আছে।"
      );

      APP.closeModal();

      return;

    }


    /*
     * Student যদি অন্য Batch-এ থাকে,
     * তাহলে তাকে নতুন Batch-এ move করা হবে।
     *
     * কোনো Student data বা payment history
     * delete করা হবে না।
     */

    var oldBatch =
      BatchModule.get(
        student.batchId
      );


    student.batchId =
      String(batchId);


    APP.save();

    APP.closeModal();


    /*
     * যে Batch থেকে Add Student করা হয়েছিল
     * সেখানেই ফিরে থাকব।
     */

    APP.currentBatchId =
      String(batchId);


    APP.page =
      "batchDetails";


    APP.render();


    /*
     * ছোট confirmation
     */

    alert(
      student.name +
      " সফলভাবে " +
      batch.name +
      " Batch-এ যোগ হয়েছে।"
    );

  };


/* ============================================================
   EDIT STUDENT FROM BATCH
   ============================================================ */

APP.editBatchStudent = function(id) {

  var student =
    StudentModule.get(id);


  if (!student) {

    alert("Student পাওয়া যায়নি।");

    return;

  }


  /*
   * Student Edit-এর জন্য existing
   * Edit Student form ব্যবহার করছি।
   *
   * নতুন Student form নয়।
   */

  if (
    typeof APP.editStudent ===
    "function"
  ) {

    APP.editStudent(id);

    return;

  }


  alert(
    "Student Edit System পাওয়া যায়নি।"
  );

};


/* ============================================================
   STUDENT PROFILE FROM BATCH
   ============================================================ */

APP.studentProfileFromBatch = function(id) {

  APP.studentProfile(id);

};


/* ============================================================
   REMOVE STUDENT FROM BATCH
   ============================================================ */

APP.removeStudentFromBatch = function(
  studentId,
  batchId
) {

  var student =
    StudentModule.get(
      studentId
    );


  if (!student) {

    alert("Student পাওয়া যায়নি।");

    return;

  }


  var batch =
    BatchModule.get(
      batchId
    );


  var batchName =
    batch
      ? batch.name
      : "এই ব্যাচ";


  APP.modal(

    `

      <div
        style="
          font-size:20px;
          font-weight:800
        "
      >
        ↪ Batch থেকে Remove
      </div>


      <div
        style="
          margin-top:10px;
          line-height:1.6
        "
      >

        <strong>
          ${U.esc(student.name)}
        </strong>

        কে

        <strong>
          ${U.esc(batchName)}
        </strong>

        থেকে remove করা হবে।

      </div>


      <div
        style="
          margin-top:12px;
          padding:11px;
          border-radius:10px;
          background:#fff7ed;
          color:#9a3412;
          font-size:13px;
          line-height:1.5
        "
      >

        ⚠️ Student delete হবে না।
        শুধু Batch-এর সাথে connection
        সরানো হবে। আগের payment history
        থাকবে।

      </div>


      <div
        style="
          display:flex;
          gap:8px;
          margin-top:20px
        "
      >

        <button
          class="btn btn-soft"
          style="flex:1"
          onclick="APP.closeModal()"
        >
          Cancel
        </button>


        <button
          class="btn"
          style="
            flex:1;
            background:#dc2626;
            color:#fff
          "
          onclick="
            APP.confirmRemoveStudentFromBatch(
              '${U.esc(studentId)}',
              '${U.esc(batchId)}'
            )
          "
        >
          Remove
        </button>

      </div>

    `

  );

};


/* ============================================================
   CONFIRM REMOVE FROM BATCH
   ============================================================ */

APP.confirmRemoveStudentFromBatch =
  function(
    studentId,
    batchId
  ) {

    var student =
      StudentModule.get(
        studentId
      );


    if (!student) {

      APP.closeModal();

      return;

    }


    /*
     * IMPORTANT:
     *
     * Student delete করছি না।
     *
     * শুধু এই Student-এর বর্তমান
     * Batch connection সরানো হচ্ছে।
     *
     * Student-এর:
     * - নাম
     * - ফোন
     * - ক্লাস
     * - ফি
     * - অন্যান্য তথ্য
     * - Payment history
     *
     * কিছুই মুছে যাবে না।
     */

    student.batchId =
      "";


    /*
     * Payment array-তে কোনো পরিবর্তন করছি না।
     */

    APP.save();

    APP.closeModal();


    APP.currentBatchId =
      String(batchId);


    APP.page =
      "batchDetails";


    APP.render();

  };


/* ============================================================
   PAYMENTS TAB
   ============================================================ */

APP.batchPaymentsTab = function(batchId) {

  var batch =
    BatchModule.get(
      batchId
    );


  if (!batch) {
    return;
  }


  /*
   * Phase 7-এ এখানে
   * Batch-wise Payments page হবে।
   *
   * আপাতত existing Payments page।
   */

  APP.page =
    "payments";


  APP.render();

};


/* ============================================================
   REPORT TAB
   ============================================================ */

APP.batchReportTab = function(batchId) {

  var batch =
    BatchModule.get(
      batchId
    );


  if (!batch) {
    return;
  }


  alert(
    "Batch-wise Report পরের Phase-এ যোগ করা হবে।"
  );

};


/* ============================================================
   RENDER ROUTING
   ============================================================ */

(function() {

  var originalRender =
    APP.render;


  APP.render =
    function() {

      if (
        this.page ===
        "batchDetails"
      ) {

        this.batchDetailsPage();

        return;

      }


      originalRender.call(
        this
      );

    };

})();