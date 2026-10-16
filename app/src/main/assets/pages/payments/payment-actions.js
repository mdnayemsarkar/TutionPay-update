window.APP = window.APP || {};

window.PaymentActions = {

  /* =======================================================
     GET PAYMENT
  ======================================================= */

  get: function(id) {

    return APP.payments.find(function(p) {
      return p.id === id;
    });

  },


  /* =======================================================
     EDIT PAYMENT
  ======================================================= */

  edit: function(id) {

    var p = this.get(id);

    if (!p) {
      alert("Payment পাওয়া যায়নি");
      return;
    }


    var student =
      StudentModule.get(p.studentId);


    APP.modal(`
      <h3 class="text-xl font-bold">
        Payment Edit
      </h3>


      <div
        class="formgrid"
        style="margin-top:12px"
      >

        <!-- Student -->

        <div class="full">

          <label class="label">
            Student
          </label>

          <input
            class="input"
            value="${U.esc(
              student
                ? student.name
                : (p && p.studentName ? p.studentName : "Student")
            )}"
            disabled
          >

        </div>


        <!-- Date -->

        <div>

          <label class="label">
            তারিখ
          </label>

          <input
            id="epDate"
            class="input"
            type="date"
            value="${U.esc(
              p.date || U.today()
            )}"
          >

        </div>


        <!-- Amount -->

        <div>

          <label class="label">
            Amount
          </label>

          <input
            id="epAmount"
            class="input"
            type="number"
            min="0"
            value="${Number(
              p.amount || 0
            )}"
          >

        </div>


        <!-- Month -->

        <div>

          <label class="label">
            মাস
          </label>

          <select
            id="epMonth"
            class="select"
          >

            ${U.months.map(function(m, i) {

              return `
                <option
                  value="${i + 1}"
                  ${
                    i + 1 == p.month
                      ? "selected"
                      : ""
                  }
                >
                  ${m}
                </option>
              `;

            }).join("")}

          </select>

        </div>


        <!-- Comment -->

        <div class="full">

          <label class="label">
            মন্তব্য
          </label>

          <textarea
            id="epComment"
            class="textarea"
            rows="3"
            placeholder="Optional"
          >${U.esc(
            p.comment || ""
          )}</textarea>

        </div>

      </div>


      <!-- Buttons -->

      <div
        class="flex gap-2"
        style="
          justify-content:flex-end;
          margin-top:14px;
        "
      >

        <button
          type="button"
          class="btn btn-soft"
          onclick="APP.closeModal()"
        >
          Cancel
        </button>

        <button
          type="button"
          class="btn btn-primary"
          onclick="PaymentActions.update('${id}')"
        >
          Save
        </button>

      </div>
    `);
  },


  /* =======================================================
     UPDATE PAYMENT
  ======================================================= */

  update: function(id) {

    var p = this.get(id);

    if (!p) {
      alert("Payment পাওয়া যায়নি");
      return;
    }


    var amountElement =
      document.getElementById(
        "epAmount"
      );

    var dateElement =
      document.getElementById(
        "epDate"
      );

    var monthElement =
      document.getElementById(
        "epMonth"
      );

    var commentElement =
      document.getElementById(
        "epComment"
      );


    if (
      !amountElement ||
      !dateElement ||
      !monthElement ||
      !commentElement
    ) {

      alert(
        "Payment form পাওয়া যায়নি"
      );

      return;
    }


    var amount =
      Number(
        amountElement.value || 0
      );


    if (amount <= 0) {

      alert(
        "সঠিক Amount দিন"
      );

      return;
    }


    var date =
      dateElement.value ||
      U.today();


    var month =
      Number(
        monthElement.value
      );


    var comment =
      commentElement.value.trim();


    var d =
      new Date(date);


    /*
     * Payment update
     */

    p.date = date;

    p.amount = amount;

    p.month = month;

    p.year =
      d.getFullYear();

    p.comment =
      comment;


    /*
     * Save local database
     */

    APP.save();


    /*
     * Close modal
     */

    APP.closeModal();


    /*
     * Refresh current page
     */

    APP.render();
  },


  /* =======================================================
     DELETE PAYMENT
  ======================================================= */

  remove: function(id) {

    var p = this.get(id);

    if (!p) {

      alert(
        "Payment পাওয়া যায়নি"
      );

      return;
    }


    var student =
      StudentModule.get(
        p.studentId
      );


    APP.modal(`
      <div
        style="
          text-align:center;
        "
      >

        <!-- Warning -->

        <div
          style="
            font-size:38px;
            line-height:1;
            margin-bottom:9px;
          "
        >
          ⚠️
        </div>


        <h3
          class="text-xl font-bold"
        >
          Payment Delete
        </h3>


        <p
          class="text-sm text-slate-500"
          style="
            margin-top:6px;
            line-height:1.5;
          "
        >
          আপনি কি এই payment delete করতে চান?
        </p>


        <!-- Payment Details -->

        <div
          class="card"
          style="
            margin-top:12px;
            padding:10px;
            text-align:left;
            border-radius:9px;
          "
        >

          <div
            class="flex items-center justify-between"
            style="gap:8px"
          >

            <span
              class="text-xs text-slate-500"
            >
              Student
            </span>

            <b
              style="
                font-size:13px;
                text-align:right;
              "
            >
              ${U.esc(
                student
                  ? student.name
                  : (p && p.studentName ? p.studentName : "Student")
              )}
            </b>

          </div>


          <div
            class="flex items-center justify-between"
            style="
              gap:8px;
              margin-top:7px;
            "
          >

            <span
              class="text-xs text-slate-500"
            >
              Amount
            </span>

            <b
              style="
                font-size:13px;
              "
            >
              ${U.money(p.amount)}
            </b>

          </div>


          <div
            class="flex items-center justify-between"
            style="
              gap:8px;
              margin-top:7px;
            "
          >

            <span
              class="text-xs text-slate-500"
            >
              Date
            </span>

            <span
              style="
                font-size:12px;
              "
            >
              ${U.esc(
                p.date || "—"
              )}
            </span>

          </div>


          <div
            class="flex items-center justify-between"
            style="
              gap:8px;
              margin-top:7px;
            "
          >

            <span
              class="text-xs text-slate-500"
            >
              Month
            </span>

            <span
              style="
                font-size:12px;
              "
            >
              ${
                U.months[
                  Number(p.month) - 1
                ] || "—"
              }
              ${p.year || ""}
            </span>

          </div>

        </div>


        <p
          class="text-xs text-slate-500"
          style="
            margin-top:9px;
            line-height:1.5;
          "
        >
          এই payment মুছে দিলে Collection এবং
          Due হিসাব পুনরায় পরিবর্তন হবে।
        </p>


        <!-- Buttons -->

        <div
          class="flex gap-2"
          style="
            justify-content:center;
            margin-top:15px;
          "
        >

          <button
            type="button"
            class="btn btn-soft"
            onclick="APP.closeModal()"
          >
            Cancel
          </button>

          <button
            type="button"
            class="btn btn-danger"
            onclick="PaymentActions.confirmRemove('${id}')"
          >
            Delete
          </button>

        </div>

      </div>
    `);
  },


  /* =======================================================
     CONFIRM DELETE
  ======================================================= */

  confirmRemove: function(id) {

    var p = this.get(id);

    if (!p) {

      alert(
        "Payment পাওয়া যায়নি"
      );

      return;
    }


    /*
     * Payment remove
     */

    APP.payments =
      APP.payments.filter(
        function(x) {
          return x.id !== id;
        }
      );


    /*
     * Save
     */

    APP.save();


    /*
     * Close confirmation
     */

    APP.closeModal();


    /*
     * Refresh page
     */

    APP.render();
  },


  /* =======================================================
     EDIT / DELETE BUTTONS
  ======================================================= */

  buttons: function(id) {

    if (!id) {
      return "";
    }


    return `
      <div
        style="
          display:flex;
          gap:5px;
          margin-top:5px;
        "
      >

        <button
          type="button"
          class="btn btn-soft"
          style="
            padding:5px 8px;
            font-size:10px;
            line-height:1.2;
          "
          onclick="PaymentActions.edit('${id}')"
        >
          Edit
        </button>


        <button
          type="button"
          class="btn btn-danger"
          style="
            padding:5px 8px;
            font-size:10px;
            line-height:1.2;
          "
          onclick="PaymentActions.remove('${id}')"
        >
          Delete
        </button>

      </div>
    `;
  }

};