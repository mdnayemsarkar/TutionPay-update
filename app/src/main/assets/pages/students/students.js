/* ============================================================
   STUDENTS + BATCH MANAGEMENT
   File:
   pages/students/students.js

   Phase 6:
   - Students
   - Search
   - Batch filter directly under Search
   - Batch dropdown -> Direct Batch Details
   - Add Batch
   - Edit Batch
   - Add Student with Batch
   - Add existing Student to Batch
   - Prevent duplicate Student creation
   - Edit Student Batch
   - Batch information
   - Delete Student
   ============================================================ */


/* ============================================================
   STUDENT MODULE
   ============================================================ */

window.StudentModule = {

  /* ----------------------------------------------------------
     ADD STUDENT
     ---------------------------------------------------------- */

  add: function(data) {

    if (!APP.students) {
      APP.students = [];
    }

    if (
      !data ||
      !data.name ||
      !String(data.name).trim()
    ) {
      return false;
    }

    var student = {

      id:
        U.id(),

      name:
        String(data.name).trim(),

      phone:
        String(data.phone || "").trim(),

      className:
        String(data.className || "").trim(),

      fee:
        Number(data.fee || 0),

      joinDate:
        data.joinDate ||
        U.today(),

      guardian:
        String(data.guardian || "").trim(),

      address:
        String(data.address || "").trim(),

      comment:
        String(data.comment || "").trim(),

      batchId:
        data.batchId || ""

    };

    APP.students.push(student);

    return student;
  },


  /* ----------------------------------------------------------
     GET STUDENT
     ---------------------------------------------------------- */

  get: function(id) {

    if (!APP.students) {
      return null;
    }

    return APP.students.find(function(s) {

      return String(s.id) === String(id);

    }) || null;
  },


  /* ----------------------------------------------------------
     PAID AMOUNT
     ---------------------------------------------------------- */

  paid: function(
    studentId,
    year,
    month
  ) {

    var total = 0;

    (APP.payments || []).forEach(
      function(p) {

        if (
          String(p.studentId) ===
            String(studentId) &&

          Number(p.year) ===
            Number(year) &&

          Number(p.month) ===
            Number(month)
        ) {

          total +=
            Number(p.amount || 0);
        }

      }
    );

    return total;
  },


  /* ----------------------------------------------------------
     PAYMENT STATUS
     ---------------------------------------------------------- */

  status: function(
    student,
    year,
    month
  ) {

    var paid =
      this.paid(
        student.id,
        year,
        month
      );

    var fee =
      Number(student.fee || 0);

    if (paid >= fee && fee > 0) {
      return "Paid";
    }

    if (paid > 0) {
      return "Partial";
    }

    return "Due";
  },


  /* ----------------------------------------------------------
     STUDENT BATCH
     ---------------------------------------------------------- */

  batch: function(student) {

    if (
      !student ||
      !student.batchId
    ) {
      return null;
    }

    return BatchModule.get(
      student.batchId
    );
  }

};


/* ============================================================
   BATCH MODULE
   ============================================================ */

window.BatchModule = {

  /* ----------------------------------------------------------
     GET BATCH
     ---------------------------------------------------------- */

  get: function(id) {

    return (APP.batches || []).find(
      function(b) {

        return String(b.id) ===
          String(id);

      }
    ) || null;
  },


  /* ----------------------------------------------------------
     STUDENT COUNT
     ---------------------------------------------------------- */

  studentCount: function(id) {

    return (APP.students || []).filter(
      function(s) {

        return !s.archived &&
          String(s.batchId) ===
          String(id);

      }
    ).length;
  },


  /* ----------------------------------------------------------
     MONTHLY PAID
     ---------------------------------------------------------- */

  monthlyPaid: function(
    id,
    year,
    month
  ) {

    var studentIds =
      (APP.students || [])
        .filter(function(s) {

          return String(s.batchId) ===
            String(id);

        })
        .map(function(s) {

          return String(s.id);

        });

    var total = 0;

    (APP.payments || []).forEach(
      function(p) {

        if (
          studentIds.indexOf(
            String(p.studentId)
          ) !== -1 &&

          Number(p.year) ===
            Number(year) &&

          Number(p.month) ===
            Number(month)
        ) {

          total +=
            Number(p.amount || 0);
        }

      }
    );

    return total;
  },


  /* ----------------------------------------------------------
     MONTHLY DUE
     ---------------------------------------------------------- */

  monthlyDue: function(
    id,
    year,
    month
  ) {

    var students =
      (APP.students || []).filter(
        function(s) {

          return !s.archived &&
            String(s.batchId) ===
            String(id);

        }
      );

    var totalFee = 0;
    var totalPaid = 0;

    students.forEach(
      function(s) {

        totalFee +=
          Number(s.fee || 0);

        totalPaid +=
          StudentModule.paid(
            s.id,
            year,
            month
          );

      }
    );

    return Math.max(
      0,
      totalFee - totalPaid
    );
  }

};


/* ============================================================
   BATCH OPTIONS
   Used inside Student form
   ============================================================ */

APP.batchOptions = function(
  selectedId
) {

  var html =
    '<option value="">ব্যাচ নির্বাচন করুন</option>';

  (this.batches || []).forEach(
    function(b) {

      html +=
        '<option value="' +
        U.esc(b.id) +
        '"' +
        (
          String(selectedId || "") ===
          String(b.id)
            ? " selected"
            : ""
        ) +
        ">" +
        U.esc(b.name) +
        "</option>";

    }
  );

  return html;
};


/* ============================================================
   STUDENT BATCH FILTER OPTIONS
   Search-এর নিচে আলাদা filter
   ============================================================ */

APP.studentBatchFilterOptions =
  function(selectedId) {

    var html =
      '<option value="">সব ব্যাচ</option>';

    (this.batches || []).forEach(
      function(b) {

        html +=
          '<option value="' +
          U.esc(b.id) +
          '"' +
          (
            String(selectedId || "") ===
            String(b.id)
              ? " selected"
              : ""
          ) +
          ">" +
          U.esc(b.name) +
          "</option>";

      }
    );

    html +=
      '<option value="__archived__"' +
      (
        String(selectedId || "") === "__archived__"
          ? " selected"
          : ""
      ) +
      ">📂 প্রাক্তন / আর্কাইভড Students</option>";

    return html;
  };


/* ============================================================
   BATCH STATUS TEXT
   ============================================================ */

APP.batchStatusText = function(
  batch
) {

  if (!batch) {
    return "No Batch";
  }

  if (
    batch.active === false
  ) {
    return "Inactive";
  }

  return "Active";
};


/* ============================================================
   RENDER BATCH LIST
   ============================================================ */

APP.renderBatchList = function() {

  var box =
    document.getElementById(
      "batchList"
    );

  if (!box) {
    return;
  }

  var batches =
    this.batches || [];

  if (!batches.length) {

    box.innerHTML =
      '<div class="empty">' +
      'এখনো কোনো Batch তৈরি করা হয়নি।' +
      '</div>';

    return;
  }

  box.innerHTML =
    batches.map(
      function(b) {

        var count =
          BatchModule.studentCount(
            b.id
          );

        var paid =
          BatchModule.monthlyPaid(
            b.id,
            APP.settings.year,
            APP.settings.month
          );

        var status =
          APP.batchStatusText(b);

        return `

          <div
            class="card mb-2"
            style="cursor:pointer"
            onclick="
              APP.openBatch('${b.id}')
            "
          >

            <div
              class="flex items-center justify-between gap-2"
            >

              <div>

                <b>
                  ${U.esc(b.name)}
                </b>

                <div
                  class="text-xs text-slate-500"
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
                        U.esc(b.time)
                      : ""
                  }

                </div>

              </div>


              <div
                style="text-align:right"
              >

                <b>
                  ${U.money(paid)}
                </b>

                <div
                  class="text-xs text-blue-600"
                >
                  ${status} ›
                </div>

              </div>

            </div>

          </div>

        `;

      }
    ).join("");
};


/* ============================================================
   BATCH MANAGEMENT SECTION
   ============================================================ */

APP.batchManagement = function() {

  return `

    <div class="sectionhead">

      <h3>
        Batches
      </h3>

      <button
        class="btn btn-primary"
        onclick="APP.batchModal()"
      >
        + Batch
      </button>

    </div>


    <div
      id="batchList"
    ></div>

  `;
};


/* ============================================================
   STUDENTS PAGE
   ============================================================ */

APP.studentsPage = function() {

  if (
    typeof APP.studentBatchFilter ===
    "undefined"
  ) {

    APP.studentBatchFilter = "";

  }


  var searchText =
    String(
      this.search || ""
    ).toLowerCase();


  var filterBatch =
    String(
      this.studentBatchFilter || ""
    );


  var list =
    (this.students || []).filter(
      function(s) {

        if (filterBatch === "__archived__") {
          if (!s.archived) {
            return false;
          }
        } else {
          if (s.archived) {
            return false;
          }

          if (
            filterBatch &&
            String(s.batchId || "") !== filterBatch
          ) {
            return false;
          }
        }

        var name =
          String(
            s.name || ""
          ).toLowerCase();

        var phone =
          String(
            s.phone || ""
          );

        return (
          name.includes(searchText) ||
          phone.includes(searchText)
        );

      }
    );


  this.shell(`

    <div
      class="flex items-center justify-between mb-3"
    >

      <div
        class="text-xl font-extrabold"
      >
        Students
      </div>


      <button
        class="btn btn-primary"
        onclick="APP.studentModal()"
      >
        + Student
      </button>

    </div>


    <!-- =====================================================
         SEARCH
         ===================================================== -->

    <input
      id="studentSearch"
      class="input mb-2"
      placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
      value="${U.esc(this.search || "")}"
      oninput="
        APP.searchStudents(this.value)
      "
    >


    <!-- =====================================================
         BATCH FILTER
         Search-এর ঠিক নিচে
         ===================================================== -->

    <select
      id="studentBatchFilter"
      class="select mb-3"
      onchange="
        APP.filterStudentBatch(this.value)
      "
    >

      ${this.studentBatchFilterOptions(
        this.studentBatchFilter
      )}

    </select>


    <div
      class="text-xs text-slate-500 mb-2"
    >
      ${list.length} জন Student
    </div>


    <!-- =====================================================
         STUDENT LIST
         ===================================================== -->

    <div id="studentsList">

      ${this.renderStudentListHTML(list)}

    </div>


    <!-- =====================================================
         BATCH MANAGEMENT
         ===================================================== -->

    ${this.batchManagement()}

  `, "Student Management");


  this.renderBatchList();
};


/* ============================================================
   STUDENT LIST HTML
   ============================================================ */

APP.renderStudentListHTML = function(
  list
) {

  if (
    !list ||
    !list.length
  ) {

    return `

      <div class="card empty">
        কোনো Student পাওয়া যায়নি।
      </div>

    `;

  }


  return list.map(
    function(s) {

      var batch =
        BatchModule.get(
          s.batchId
        );


      var paid =
        StudentModule.paid(
          s.id,
          APP.settings.year,
          APP.settings.month
        );


      var status =
        StudentModule.status(
          s,
          APP.settings.year,
          APP.settings.month
        );


      return `

        <div
          class="card mb-2"
        >

          <div
            class="flex items-center gap-3"
          >

            <div
              class="avatar"
              onclick="
                APP.studentProfile('${s.id}')
              "
            >

              ${U.esc(
                (s.name || "?")
                  .trim()
                  .charAt(0)
              )}

            </div>


            <div
              class="flex-1"
              onclick="
                APP.studentProfile('${s.id}')
              "
              style="cursor:pointer"
            >

              <b>
                ${U.esc(s.name)}
              </b>


              <div
                class="text-xs text-slate-500"
              >

                ${U.esc(
                  s.className || ""
                )}

                ${
                  s.phone
                    ? " • " +
                      U.esc(s.phone)
                    : ""
                }

              </div>


              <div
                class="text-xs mt-1"
                style="
                  color:
                  ${
                    s.archived
                      ? "#d97706"
                      : batch
                        ? "#2563eb"
                        : "#94a3b8"
                  };
                  font-weight:600;
                "
              >

                ${
                  s.archived
                    ? "📂 প্রাক্তন Student"
                    : batch
                      ? "📚 " +
                        U.esc(
                          batch.name
                        )
                      : "📚 কোনো Batch নেই"
                }

              </div>

            </div>


            <div
              style="text-align:right"
            >

              <b>
                ${U.money(s.fee)}
              </b>


              <div
                class="
                  text-xs
                  ${
                    status === "Paid"
                      ? "text-green-600"
                      : status === "Partial"
                        ? "text-orange-600"
                        : "text-red-600"
                  }
                "
              >
                ${status}
              </div>

            </div>

          </div>


          <!-- =================================================
               STUDENT ACTIONS
               ================================================= -->

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
                APP.addExistingStudentToBatch(
                  '${s.id}'
                )
              "
            >
              📚 Batch
            </button>


            <button
              class="btn btn-soft"
              onclick="
                APP.editStudent(
                  '${s.id}'
                )
              "
            >
              ✏ Edit
            </button>


            ${
              s.archived
                ? `
                  <button
                    class="btn btn-green"
                    onclick="
                      APP.restoreStudent(
                        '${s.id}'
                      )
                    "
                  >
                    🔄 Restore
                  </button>
                `
                : `
                  <button
                    class="btn btn-danger"
                    onclick="
                      APP.deleteStudent(
                        '${s.id}'
                      )
                    "
                  >
                    🗑 Delete
                  </button>
                `
            }

          </div>

        </div>

      `;

    }
  ).join("");
};


/* ============================================================
   RENDER STUDENT LIST
   Filter/Search change হলে পুরো page নয়,
   শুধু student list update হবে।
   ============================================================ */

APP.renderStudentList = function() {

  var box =
    document.getElementById(
      "studentsList"
    );

  if (!box) {
    return;
  }


  var searchText =
    String(
      this.search || ""
    ).toLowerCase();


  var filterBatch =
    String(
      this.studentBatchFilter || ""
    );


  var list =
    (this.students || []).filter(
      function(s) {

        if (filterBatch === "__archived__") {
          if (!s.archived) {
            return false;
          }
        } else {
          if (s.archived) {
            return false;
          }

          if (
            filterBatch &&
            String(s.batchId || "") !== filterBatch
          ) {
            return false;
          }
        }

        var name =
          String(
            s.name || ""
          ).toLowerCase();

        var phone =
          String(
            s.phone || ""
          );

        return (
          name.includes(searchText) ||
          phone.includes(searchText)
        );

      }
    );


  box.innerHTML =
    this.renderStudentListHTML(
      list
    );


  var count =
    document.querySelector(
      "#studentsList"
    );


  if (count) {

    var countBox =
      count.parentElement
        .querySelector(
          ".text-xs.text-slate-500.mb-2"
        );

    if (countBox) {

      countBox.textContent =
        list.length +
        " জন Student";

    }

  }

};


/* ============================================================
   SEARCH STUDENTS
   ============================================================ */

APP.searchStudents = function(
  value
) {

  this.search =
    String(value || "");

  this.renderStudentList();

};


/* ============================================================
   FILTER STUDENT BY BATCH
   ============================================================

   IMPORTANT:
   - "সব ব্যাচ" হলে Students list থাকবে
   - নির্দিষ্ট Batch নির্বাচন করলে
     সরাসরি Batch Details খুলবে
   - Design অপরিবর্তিত
   ============================================================ */

APP.filterStudentBatch = function(
  value
) {

  this.studentBatchFilter =
    String(value || "");


  /*
   * যদি নির্দিষ্ট Batch নির্বাচন করা হয়,
   * তাহলে সরাসরি সেই Batch-এর Details page খুলবে।
   */

  if (
    this.studentBatchFilter &&
    this.studentBatchFilter !== "__archived__"
  ) {

    this.currentBatchId =
      this.studentBatchFilter;


    if (
      typeof this.go ===
      "function"
    ) {

      this.go(
        "batchDetails"
      );

      return;
    }

  }


  /*
   * "সব ব্যাচ" নির্বাচন করলে
   * আগের Students list-এ থাকবে।
   */

  this.renderStudentList();

};


/* ============================================================
   BATCH MODAL
   ============================================================ */

APP.batchModal = function(
  editId
) {

  var batch =
    editId
      ? BatchModule.get(editId)
      : null;


  var title =
    batch
      ? "Batch Edit"
      : "নতুন Batch";


  this.modal(`

    <h3
      class="text-xl font-bold"
    >
      ${title}
    </h3>


    <div
      class="formgrid mt-3"
    >

      <div class="full">

        <label class="label">
          Batch Name *
        </label>

        <input
          id="bName"
          class="input"
          value="${
            batch
              ? U.esc(batch.name)
              : ""
          }"
        >

      </div>


      <div>

        <label class="label">
          Class
        </label>

        <input
          id="bClass"
          class="input"
          value="${
            batch
              ? U.esc(
                  batch.className || ""
                )
              : ""
          }"
        >

      </div>


      <div>

        <label class="label">
          সময়
        </label>

        <input
          id="bTime"
          class="input"
          placeholder="যেমন: সকাল ৮টা"
          value="${
            batch
              ? U.esc(
                  batch.time || ""
                )
              : ""
          }"
        >

      </div>


      <div>

        <label class="label">
          মাসিক ফি
        </label>

        <input
          id="bFee"
          class="input"
          type="number"
          value="${
            batch
              ? Number(
                  batch.monthlyFee || 0
                )
              : ""
          }"
        >

      </div>


      <div>

        <label class="label">
          Start Date
        </label>

        <input
          id="bStart"
          class="input"
          type="date"
          value="${
            batch
              ? U.esc(
                  batch.startDate || ""
                )
              : U.today()
          }"
        >

      </div>


      <div class="full">

        <label
          class="flex items-center gap-2"
        >

          <input
            id="bActive"
            type="checkbox"
            ${
              !batch ||
              batch.active !== false
                ? "checked"
                : ""
            }
          >

          <span>
            Active Batch
          </span>

        </label>

      </div>

    </div>


    <div
      class="flex gap-2"
      style="
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


      <button
        class="btn btn-primary"
        onclick="
          ${
            batch
              ? "APP.updateBatch('" +
                batch.id +
                "')"
              : "APP.saveBatch()"
          }
        "
      >
        Save
      </button>

    </div>

  `);

};


/* ============================================================
   SAVE NEW BATCH
   ============================================================ */

APP.saveBatch = function() {

  var name =
    $("bName").value.trim();


  if (!name) {

    alert(
      "Batch Name দিন"
    );

    return;
  }


  if (!this.batches) {
    this.batches = [];
  }


  this.batches.push({

    id:
      U.id(),

    name:
      name,

    className:
      $("bClass").value.trim(),

    time:
      $("bTime").value.trim(),

    monthlyFee:
      Number(
        $("bFee").value || 0
      ),

    startDate:
      $("bStart").value,

    active:
      $("bActive").checked

  });


  this.save();

  this.closeModal();

  this.render();

};


/* ============================================================
   UPDATE BATCH
   ============================================================ */

APP.updateBatch = function(
  id
) {

  var batch =
    BatchModule.get(id);


  if (!batch) {
    return;
  }


  var name =
    $("bName").value.trim();


  if (!name) {

    alert(
      "Batch Name দিন"
    );

    return;
  }


  batch.name =
    name;

  batch.className =
    $("bClass").value.trim();

  batch.time =
    $("bTime").value.trim();

  batch.monthlyFee =
    Number(
      $("bFee").value || 0
    );

  batch.startDate =
    $("bStart").value;

  batch.active =
    $("bActive").checked;


  this.save();

  this.closeModal();

  this.render();

};


/* ============================================================
   OPEN BATCH
   ============================================================ */

APP.openBatch = function(
  id
) {

  if (
    typeof this.currentBatchId !==
    "undefined"
  ) {

    this.currentBatchId =
      id;

  }


  if (
    typeof this.go ===
    "function"
  ) {

    this.currentBatchId =
      id;

    this.go(
      "batchDetails"
    );

    return;
  }


  alert(
    "Batch Details System পাওয়া যায়নি।"
  );

};


/* ============================================================
   STUDENT MODAL
   ============================================================ */

APP.studentModal = function(
  batchId
) {

  var selectedBatch =
    batchId || "";


  this.modal(`

    <h3
      class="text-xl font-bold"
    >
      নতুন Student
    </h3>


    <div
      class="formgrid mt-3"
    >

      <div class="full">

        <label class="label">
          Student Name *
        </label>

        <input
          id="stName"
          class="input"
        >

      </div>


      <div>

        <label class="label">
          মোবাইল
        </label>

        <input
          id="stPhone"
          class="input"
        >

      </div>


      <div>

        <label class="label">
          ক্লাস
        </label>

        <input
          id="stClass"
          class="input"
        >

      </div>


      <div>

        <label class="label">
          মাসিক ফি
        </label>

        <input
          id="stFee"
          class="input"
          type="number"
        >

      </div>


      <div>

        <label class="label">
          ভর্তি তারিখ
        </label>

        <input
          id="stJoin"
          class="input"
          type="date"
          value="${U.today()}"
        >

      </div>


      <div class="full">

        <label class="label">
          Batch
        </label>

        <select
          id="stBatch"
          class="select"
        >

          ${this.batchOptions(
            selectedBatch
          )}

        </select>

      </div>


      <div class="full">

        <label class="label">
          অভিভাবকের নাম
        </label>

        <input
          id="stGuardian"
          class="input"
        >

      </div>


      <div class="full">

        <label class="label">
          ঠিকানা
        </label>

        <input
          id="stAddress"
          class="input"
        >

      </div>


      <div class="full">

        <label class="label">
          মন্তব্য
        </label>

        <textarea
          id="stComment"
          class="textarea"
          rows="2"
        ></textarea>

      </div>

    </div>


    <div
      class="flex gap-2"
      style="
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


      <button
        class="btn btn-primary"
        onclick="
          APP.saveStudent()
        "
      >
        Save
      </button>

    </div>

  `);

};


/* ============================================================
   SAVE NEW STUDENT
   ============================================================ */

APP.saveStudent = function() {

  var name =
    $("stName").value.trim();


  if (!name) {

    alert(
      "Student Name দিন"
    );

    return;
  }


  var batchId =
    $("stBatch")
      ? $("stBatch").value
      : "";


  var student =
    StudentModule.add({

      name:
        name,

      phone:
        $("stPhone").value,

      className:
        $("stClass").value,

      fee:
        $("stFee").value,

      joinDate:
        $("stJoin").value,

      guardian:
        $("stGuardian").value,

      address:
        $("stAddress").value,

      comment:
        $("stComment").value,

      batchId:
        batchId

    });


  if (!student) {
    return;
  }


  this.save();

  this.closeModal();

  this.render();

};


/* ============================================================
   ADD EXISTING STUDENT TO BATCH
   ============================================================ */

APP.addExistingStudentToBatch =
  function(studentId) {

    var student =
      StudentModule.get(
        studentId
      );


    if (!student) {
      return;
    }


    this.modal(`

      <h3
        class="text-xl font-bold"
      >
        Batch-এ Student যোগ করুন
      </h3>


      <p
        class="text-xs text-slate-500 mt-2"
      >

        Student:
        <b>
          ${U.esc(student.name)}
        </b>

      </p>


      <div
        class="card mt-3"
        style="
          background:#f8fafc;
          border:1px solid #e2e8f0;
        "
      >

        <b>
          কী করতে চান?
        </b>


        <div
          class="text-xs text-slate-500 mt-1"
        >

          একই Student যেন দুইবার তৈরি না হয়,
          তাই এখানে Student-এর ধরন নির্বাচন করুন।

        </div>

      </div>


      <div
        style="margin-top:15px"
      >

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
            APP.newStudentForBatchFromStudentList()
          "
        >

          🆕 নতুন ভর্তি হওয়া Student

          <div
            class="text-xs text-slate-500"
            style="margin-top:4px"
          >
            এই Student আগে তালিকায় নেই
          </div>

        </button>


        <button
          class="btn btn-primary"
          style="
            width:100%;
            text-align:left;
            padding:14px;
          "
          onclick="
            APP.closeModal();
            APP.selectExistingStudentBatch(
              '${student.id}'
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
            নতুন Student তৈরি হবে না
          </div>

        </button>

      </div>

    `);

  };


/* ============================================================
   NEW STUDENT FROM STUDENT LIST
   ============================================================ */

APP.newStudentForBatchFromStudentList =
  function() {

    this.studentModal();

  };


/* ============================================================
   SELECT BATCH FOR EXISTING STUDENT
   ============================================================ */

APP.selectExistingStudentBatch =
  function(studentId) {

    var student =
      StudentModule.get(
        studentId
      );


    if (!student) {
      return;
    }


    this.modal(`

      <h3
        class="text-xl font-bold"
      >
        Student-এর Batch নির্বাচন
      </h3>


      <p
        class="text-xs text-slate-500 mt-2"
      >

        ${U.esc(student.name)}

        ${
          student.batchId
            ? " বর্তমানে একটি Batch-এ আছে।"
            : " বর্তমানে কোনো Batch-এ নেই।"
        }

      </p>


      <div
        class="mt-3"
      >

        <label class="label">
          Batch নির্বাচন করুন
        </label>


        <select
          id="existingStudentBatch"
          class="select"
        >

          ${this.batchOptions(
            student.batchId || ""
          )}

        </select>

      </div>


      <div
        class="card mt-3"
        style="
          background:#eff6ff;
          border:1px solid #bfdbfe;
        "
      >

        <div
          class="text-xs"
          style="
            color:#1d4ed8;
          "
        >

          এই অপশনে নতুন Student তৈরি হবে না।
          শুধু বর্তমান Student-এর Batch পরিবর্তন হবে।
          তার Payment History অপরিবর্তিত থাকবে।

        </div>

      </div>


      <div
        class="flex gap-2"
        style="
          justify-content:flex-end;
          margin-top:15px;
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


        <button
          class="btn btn-primary"
          onclick="
            APP.confirmExistingStudentBatch(
              '${student.id}'
            )
          "
        >
          Batch-এ যোগ করুন
        </button>

      </div>

    `);

  };


/* ============================================================
   CONFIRM EXISTING STUDENT BATCH
   ============================================================ */

APP.confirmExistingStudentBatch =
  function(studentId) {

    var student =
      StudentModule.get(
        studentId
      );


    if (!student) {
      return;
    }


    var batchId =
      $("existingStudentBatch")
        ? $("existingStudentBatch").value
        : "";


    if (!batchId) {

      alert(
        "একটি Batch নির্বাচন করুন"
      );

      return;
    }


    var batch =
      BatchModule.get(
        batchId
      );


    if (!batch) {

      alert(
        "Batch পাওয়া যায়নি"
      );

      return;
    }


    var oldBatch =
      BatchModule.get(
        student.batchId
      );


    if (
      String(student.batchId || "") ===
      String(batchId)
    ) {

      alert(
        "এই Student ইতিমধ্যেই এই Batch-এ আছে।"
      );

      this.closeModal();

      return;
    }


    student.batchId =
      batchId;


    this.save();

    this.closeModal();

    this.render();


    alert(
      "Student সফলভাবে " +
      batch.name +
      " Batch-এ যোগ হয়েছে।"
    );

  };


/* ============================================================
   EDIT STUDENT
   ============================================================ */

APP.editStudent = function(
  id
) {

  var s =
    StudentModule.get(id);


  if (!s) {
    return;
  }


  this.modal(`

    <h3
      class="text-xl font-bold"
    >
      Student Edit
    </h3>


    <div
      class="formgrid mt-3"
    >

      <div class="full">

        <label class="label">
          Student Name
        </label>

        <input
          id="eName"
          class="input"
          value="${U.esc(s.name)}"
        >

      </div>


      <div>

        <label class="label">
          মোবাইল
        </label>

        <input
          id="ePhone"
          class="input"
          value="${U.esc(
            s.phone || ""
          )}"
        >

      </div>


      <div>

        <label class="label">
          ক্লাস
        </label>

        <input
          id="eClass"
          class="input"
          value="${U.esc(
            s.className || ""
          )}"
        >

      </div>


      <div>

        <label class="label">
          মাসিক ফি
        </label>

        <input
          id="eFee"
          class="input"
          type="number"
          value="${Number(
            s.fee || 0
          )}"
        >

      </div>


      <div>

        <label class="label">
          Batch
        </label>

        <select
          id="eBatch"
          class="select"
        >

          ${this.batchOptions(
            s.batchId || ""
          )}

        </select>

      </div>


      <div>

        <label class="label">
          অভিভাবক
        </label>

        <input
          id="eGuardian"
          class="input"
          value="${U.esc(
            s.guardian || ""
          )}"
        >

      </div>


      <div class="full">

        <label class="label">
          ঠিকানা
        </label>

        <input
          id="eAddress"
          class="input"
          value="${U.esc(
            s.address || ""
          )}"
        >

      </div>


      <div class="full">

        <label class="label">
          মন্তব্য
        </label>

        <textarea
          id="eComment"
          class="textarea"
          rows="2"
        >${U.esc(
          s.comment || ""
        )}</textarea>

      </div>

    </div>


    <div
      class="flex gap-2"
      style="
        justify-content:space-between;
        margin-top:15px
      "
    >

      ${
        s.archived
          ? `
            <button
              class="btn btn-green"
              onclick="
                APP.restoreStudent('${id}')
              "
            >
              🔄 Restore Student
            </button>
          `
          : `
            <button
              class="btn btn-danger"
              onclick="
                APP.deleteStudent('${id}')
              "
            >
              🗑 Delete Student
            </button>
          `
      }


      <button
        class="btn btn-primary"
        onclick="
          APP.updateStudent('${id}')
        "
      >
        Save
      </button>

    </div>

  `);

};


/* ============================================================
   UPDATE STUDENT
   ============================================================ */

APP.updateStudent = function(
  id
) {

  var s =
    StudentModule.get(id);


  if (!s) {
    return;
  }


  s.name =
    $("eName").value.trim();

  s.phone =
    $("ePhone").value.trim();

  s.className =
    $("eClass").value.trim();

  s.fee =
    Number(
      $("eFee").value || 0
    );

  s.batchId =
    $("eBatch").value || "";

  s.guardian =
    $("eGuardian").value.trim();

  s.address =
    $("eAddress").value.trim();

  s.comment =
    $("eComment").value.trim();


  this.save();

  this.closeModal();

  this.studentProfile(id);

};


/* ============================================================
   DELETE / ARCHIVE STUDENT (PRESERVES HISTORICAL PAYMENTS)
   ============================================================ */

APP.deleteStudent = function(
  id
) {

  var student =
    StudentModule.get(id);


  if (!student) {
    return;
  }


  var studentName =
    student.name || "এই Student";


  if (
    !confirm(
      "⚠️ " +
      studentName +
      "\n\n" +
      "এই Student-কে সক্রিয় তালিকা থেকে সরাতে চান?\n\n" +
      "পূর্বের সকল Payment History এবং সংগ্রহ অক্ষত থাকবে।"
    )
  ) {

    return;
  }


  student.archived = true;
  student.archivedAt = U.today();
  student.batchId = "";


  this.save();

  this.closeModal();

  this.render();

};


/* ============================================================
   RESTORE ARCHIVED STUDENT
   ============================================================ */

APP.restoreStudent = function(
  id
) {

  var student =
    StudentModule.get(id);


  if (!student) {
    return;
  }


  student.archived = false;
  delete student.archivedAt;


  this.save();

  this.closeModal();

  this.render();

  alert(
    "Student সফলভাবে সক্রিয় তালিকায় ফিরিয়ে আনা হয়েছে।"
  );

};


/* ============================================================
   MODAL
   ============================================================ */

APP.modal = function(
  html
) {

  var old =
    document.getElementById(
      "modal"
    );


  if (old) {
    old.remove();
  }


  document
    .getElementById("app")
    .insertAdjacentHTML(
      "beforeend",
      `

        <div
          class="modalback"
          id="modal"
        >

          <div class="modal">
            ${html}
          </div>

        </div>

      `
    );

};


/* ============================================================
   CLOSE MODAL
   ES5 compatible
   ============================================================ */

APP.closeModal = function() {

  var modal =
    document.getElementById(
      "modal"
    );


  if (modal) {
    modal.remove();
  }

};


/* ============================================================
   STUDENT PROFILE
   ============================================================ */

APP.studentProfile = function(
  id
) {

  var s =
    StudentModule.get(id);


  if (!s) {
    return;
  }


  var batch =
    BatchModule.get(
      s.batchId
    );


  var y =
    this.settings.year;


  var rows =
    U.months.map(
      function(m, i) {

        var month =
          i + 1;


        var paid =
          StudentModule.paid(
            s.id,
            y,
            month
          );


        var due =
          Math.max(
            0,
            Number(s.fee || 0) -
            paid
          );


        var status =
          StudentModule.status(
            s,
            y,
            month
          );


        return `

          <tr>

            <td>
              ${m}
            </td>

            <td>
              ${U.money(s.fee)}
            </td>

            <td>
              ${U.money(paid)}
            </td>

            <td>
              ${U.money(due)}
            </td>

            <td>
              ${status}
            </td>

          </tr>

        `;

      }
    ).join("");


  this.modal(`

    <h3
      class="text-xl font-bold"
    >
      Student Profile
    </h3>


    <div
      class="card mt-3"
    >

      <b>
        ${U.esc(s.name)}
      </b>


      <div
        class="text-xs text-slate-500 mt-1"
      >

        ${
          s.phone
            ? U.esc(s.phone)
            : ""
        }

        ${
          batch
            ? " • 📚 " +
              U.esc(batch.name)
            : ""
        }

      </div>

    </div>


    <div
      class="sectionhead"
    >

      <h3>
        Payment Summary
      </h3>


      <button
        class="btn btn-soft"
        onclick="
          APP.editStudent('${s.id}')
        "
      >
        Edit
      </button>

    </div>


    <div
      class="tablewrap"
    >

      <table
        class="table"
      >

        <thead>

          <tr>

            <th>
              মাস
            </th>

            <th>
              Fee
            </th>

            <th>
              Paid
            </th>

            <th>
              Due
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>


        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>


    <div
      class="sectionhead"
    >

      <h3>
        Student Details
      </h3>

    </div>


    <div
      class="card"
    >

      <div
        class="text-xs text-slate-500"
      >
        Batch
      </div>

      <b>
        ${
          batch
            ? U.esc(batch.name)
            : "কোনো Batch নেই"
        }
      </b>


      <br><br>


      <div
        class="text-xs text-slate-500"
      >
        অভিভাবক
      </div>

      <b>
        ${U.esc(
          s.guardian || "—"
        )}
      </b>


      <br><br>


      <div
        class="text-xs text-slate-500"
      >
        ঠিকানা
      </div>

      <b>
        ${U.esc(
          s.address || "—"
        )}
      </b>


      <br><br>


      <div
        class="text-xs text-slate-500"
      >
        মন্তব্য
      </div>

      <b>
        ${U.esc(
          s.comment || "—"
        )}
      </b>

    </div>


    <div
      class="flex gap-2"
      style="
        justify-content:space-between;
        margin-top:15px;
      "
    >

      ${
        s.archived
          ? `
            <button
              class="btn btn-green"
              onclick="
                APP.restoreStudent('${s.id}')
              "
            >
              🔄 Restore Student
            </button>
          `
          : `
            <button
              class="btn btn-danger"
              onclick="
                APP.deleteStudent('${s.id}')
              "
            >
              🗑 Delete Student
            </button>
          `
      }


      <button
        class="btn btn-soft"
        onclick="
          APP.closeModal()
        "
      >
        Close
      </button>

    </div>

  `);

};


/* ============================================================
   INITIAL FILTER VALUE
   ============================================================ */

if (
  typeof APP.studentBatchFilter ===
  "undefined"
) {

  APP.studentBatchFilter = "";

}