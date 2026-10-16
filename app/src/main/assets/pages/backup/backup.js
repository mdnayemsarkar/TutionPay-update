(function () {

  /* =========================================================
     BACKUP MODULE
     ========================================================= */

  window.BackupModule = {

    /* ---------------------------------------------------------
       Get current database
       --------------------------------------------------------- */

    getDatabase: function () {

      try {

        if (window.APP) {

          return {

            settings: APP.settings || {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1
            },

            batches: Array.isArray(APP.batches)
              ? APP.batches
              : [],

            students: Array.isArray(APP.students)
              ? APP.students
              : [],

            payments: Array.isArray(APP.payments)
              ? APP.payments
              : [],

            studentMonthStatus: (APP.studentMonthStatus && typeof APP.studentMonthStatus === "object")
              ? APP.studentMonthStatus
              : {}

          };
        }

      } catch (e) {

        console.error(
          "Backup database error:",
          e
        );
      }


      try {

        if (
          window.Store &&
          typeof Store.load === "function"
        ) {

          return Store.load();
        }

      } catch (e) {

        console.error(
          "Store load error:",
          e
        );
      }


      return {

        settings: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1
        },

        batches: [],

        students: [],

        payments: [],

        studentMonthStatus: {}

      };
    },


    /* ---------------------------------------------------------
       Create backup object
       --------------------------------------------------------- */

    createBackupObject: function () {

      var db =
        this.getDatabase();


      return {

        app: "Tuition Fee Collection",

        version: 5,

        backupDate:
          new Date().toISOString(),

        settings:
          db.settings || {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          },

        batches:
          Array.isArray(db.batches)
            ? db.batches
            : [],

        students:
          Array.isArray(db.students)
            ? db.students
            : [],

        payments:
          Array.isArray(db.payments)
            ? db.payments
            : [],

        studentMonthStatus:
          (db.studentMonthStatus && typeof db.studentMonthStatus === "object")
            ? db.studentMonthStatus
            : {}

      };
    },


    /* ---------------------------------------------------------
       Create JSON
       --------------------------------------------------------- */

    createBackupJSON: function () {

      var backup =
        this.createBackupObject();


      return JSON.stringify(
        backup,
        null,
        2
      );
    },


    /* ---------------------------------------------------------
       Create file name
       --------------------------------------------------------- */

    createBackupFileName: function () {

      var date =
        new Date();


      var yyyy =
        date.getFullYear();


      var mm =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");


      var dd =
        String(
          date.getDate()
        ).padStart(2, "0");


      var hh =
        String(
          date.getHours()
        ).padStart(2, "0");


      var min =
        String(
          date.getMinutes()
        ).padStart(2, "0");


      var ss =
        String(
          date.getSeconds()
        ).padStart(2, "0");


      return (
        "tuition_fee_collection_backup_" +
        yyyy +
        "-" +
        mm +
        "-" +
        dd +
        "_" +
        hh +
        "-" +
        min +
        "-" +
        ss +
        ".json"
      );
    },


    /* ---------------------------------------------------------
       Get statistics
       --------------------------------------------------------- */

    getStats: function () {

      var backup =
        this.createBackupObject();


      return {

        batches:
          Array.isArray(backup.batches)
            ? backup.batches.length
            : 0,

        students:
          Array.isArray(backup.students)
            ? backup.students.length
            : 0,

        payments:
          Array.isArray(backup.payments)
            ? backup.payments.length
            : 0

      };
    },


    /* ---------------------------------------------------------
       Check whether current database contains real data
       --------------------------------------------------------- */

    hasBackupData: function () {

      try {

        var db =
          this.getDatabase();


        var students =
          Array.isArray(db.students)
            ? db.students.length
            : 0;


        var payments =
          Array.isArray(db.payments)
            ? db.payments.length
            : 0;


        var batches =
          Array.isArray(db.batches)
            ? db.batches.length
            : 0;


        return (
          students > 0 ||
          payments > 0 ||
          batches > 0
        );

      } catch (e) {

        console.error(
          "Backup data check error:",
          e
        );

        return false;
      }
    },


    /* ---------------------------------------------------------
       Validate backup object contains real data
       --------------------------------------------------------- */

    hasRestorableData: function (data) {

      try {

        if (
          !data ||
          typeof data !== "object"
        ) {

          return false;
        }


        var source =
          data;


        if (
          data.data &&
          typeof data.data === "object"
        ) {

          source =
            data.data;
        }


        if (
          data.db &&
          typeof data.db === "object"
        ) {

          source =
            data.db;
        }


        var students =
          Array.isArray(source.students)
            ? source.students.length
            : 0;


        var payments =
          Array.isArray(source.payments)
            ? source.payments.length
            : 0;


        var batches =
          Array.isArray(source.batches)
            ? source.batches.length
            : 0;


        return (
          students > 0 ||
          payments > 0 ||
          batches > 0
        );

      } catch (e) {

        console.error(
          "Restore data check error:",
          e
        );

        return false;
      }
    },


    /* =========================================================
       LOCAL BACKUP
       ========================================================= */


    /* ---------------------------------------------------------
       Download backup
       --------------------------------------------------------- */

    downloadBackup: function () {

      try {

        if (!this.hasBackupData()) {

          alert(
            "বর্তমানে কোনো Student, Payment বা Batch data নেই।\n\n" +
            "Empty backup তৈরি করা হয়নি।"
          );

          return;
        }


        var json =
          this.createBackupJSON();


        var blob =
          new Blob(
            [json],
            {
              type:
                "application/json;charset=utf-8"
            }
          );


        var url =
          URL.createObjectURL(blob);


        var fileName =
          this.createBackupFileName();


        var link =
          document.createElement("a");


        link.href =
          url;


        link.download =
          fileName;


        document.body.appendChild(
          link
        );


        link.click();


        document.body.removeChild(
          link
        );


        setTimeout(
          function () {

            URL.revokeObjectURL(
              url
            );

          },
          1000
        );


        alert(
          "Backup file তৈরি হয়েছে।"
        );


      } catch (e) {

        console.error(
          "Backup download error:",
          e
        );


        alert(
          "Backup download করা যায়নি.\n\n" +
          "Error: " +
          e.message
        );
      }
    },


    /* ---------------------------------------------------------
       Copy backup JSON
       --------------------------------------------------------- */

    copyBackup: function () {

      if (!this.hasBackupData()) {

        alert(
          "বর্তমানে কোনো Student, Payment বা Batch data নেই।\n\n" +
          "Empty backup copy করা হয়নি।"
        );

        return;
      }


      var json =
        this.createBackupJSON();


      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        navigator.clipboard
          .writeText(json)
          .then(
            function () {

              alert(
                "Backup data copy হয়েছে।"
              );

            }
          )
          .catch(
            function () {

              BackupModule
                .copyBackupFallback(
                  json
                );

            }
          );

      } else {

        this.copyBackupFallback(
          json
        );
      }
    },


    /* ---------------------------------------------------------
       Clipboard fallback
       --------------------------------------------------------- */

    copyBackupFallback: function (
      text
    ) {

      var textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        text;


      textarea.style.position =
        "fixed";


      textarea.style.left =
        "-9999px";


      textarea.style.top =
        "0";


      document.body.appendChild(
        textarea
      );


      textarea.focus();


      textarea.select();


      try {

        var success =
          document.execCommand(
            "copy"
          );


        if (success) {

          alert(
            "Backup data copy হয়েছে।"
          );

        } else {

          alert(
            "Copy করা যায়নি। নিচের Backup Text থেকে manually copy করুন।"
          );
        }


      } catch (e) {

        alert(
          "Copy করা যায়নি। নিচের Backup Text থেকে manually copy করুন।"
        );
      }


      document.body.removeChild(
        textarea
      );
    },


    /* =========================================================
       GOOGLE DRIVE
       ========================================================= */


    /* ---------------------------------------------------------
       Check Google availability
       --------------------------------------------------------- */

    isGoogleAvailable: function () {

      return (
        window.AndroidGoogle &&
        typeof AndroidGoogle.isSignedIn ===
          "function"
      );
    },


    /* ---------------------------------------------------------
       Google sign in
       --------------------------------------------------------- */

    googleSignIn: function () {

      if (
        !window.AndroidGoogle ||
        typeof AndroidGoogle.signIn !==
          "function"
      ) {

        alert(
          "Google Sign-In system পাওয়া যায়নি।"
        );

        return;
      }


      AndroidGoogle.signIn();
    },


    /* ---------------------------------------------------------
       Check signed in
       --------------------------------------------------------- */

    isGoogleSignedIn: function () {

      try {

        if (
          window.AndroidGoogle &&
          typeof AndroidGoogle.isSignedIn ===
            "function"
        ) {

          return AndroidGoogle.isSignedIn();
        }

      } catch (e) {

        console.error(
          "Google sign-in check error:",
          e
        );
      }


      return false;
    },


    /* ---------------------------------------------------------
       Get Google email
       --------------------------------------------------------- */

    getGoogleEmail: function () {

      try {

        if (
          window.AndroidGoogle &&
          typeof AndroidGoogle.getAccountEmail ===
            "function"
        ) {

          return (
            AndroidGoogle.getAccountEmail() ||
            ""
          );
        }

      } catch (e) {

        console.error(
          "Google email error:",
          e
        );
      }


      return "";
    },


    /* ---------------------------------------------------------
       Backup to Google Drive
       --------------------------------------------------------- */

    backupToDrive: function () {

      if (
        !window.AndroidGoogle ||
        typeof AndroidGoogle.backupToDrive !==
          "function"
      ) {

        alert(
          "Google Drive Backup system পাওয়া যায়নি।"
        );

        return;
      }


      if (
        typeof AndroidGoogle.isSignedIn ===
          "function" &&
        !AndroidGoogle.isSignedIn()
      ) {

        alert(
          "প্রথমে Google Account Sign In করুন।"
        );

        this.googleSignIn();

        return;
      }


      /*
       * Empty data কখনো Google Drive-এ
       * Backup করা হবে না।
       */
      if (!this.hasBackupData()) {

        alert(
          "বর্তমানে কোনো Student, Payment বা Batch data নেই।\n\n" +
          "Empty backup Google Drive-এ পাঠানো হয়নি।"
        );

        return;
      }


      var confirmed =
        confirm(
          "এই মুহূর্তের সব Student, Payment, Batch এবং Settings Google Drive-এ Backup করা হবে।\n\nBackup করবেন?"
        );


      if (!confirmed) {
        return;
      }


      var json =
        this.createBackupJSON();


      this.showLoading(
        "Google Drive-এ Backup হচ্ছে..."
      );


      try {

        AndroidGoogle.backupToDrive(
          json
        );

      } catch (e) {

        this.hideLoading();


        alert(
          "Google Drive Backup শুরু করা যায়নি।\n\n" +
          e.message
        );
      }
    },


    /* ---------------------------------------------------------
       Restore from Google Drive
       --------------------------------------------------------- */

    restoreFromDrive: function () {

      if (
        !window.AndroidGoogle ||
        typeof AndroidGoogle.restoreFromDrive !==
          "function"
      ) {

        alert(
          "Google Drive Restore system পাওয়া যায়নি।"
        );

        return;
      }


      if (
        typeof AndroidGoogle.isSignedIn ===
          "function" &&
        !AndroidGoogle.isSignedIn()
      ) {

        alert(
          "প্রথমে Google Account Sign In করুন।"
        );

        this.googleSignIn();

        return;
      }


      var confirmed =
        confirm(
          "Google Drive-এর valid Tuition backup দিয়ে বর্তমান data replace করা হবে।\n\n" +
          "Empty backup পাওয়া গেলে সেটি বাদ দেওয়া হবে।\n\n" +
          "Restore করবেন?"
        );


      if (!confirmed) {
        return;
      }


      this.showLoading(
        "Google Drive থেকে Backup আনা হচ্ছে..."
      );


      try {

        AndroidGoogle.restoreFromDrive();

      } catch (e) {

        this.hideLoading();


        alert(
          "Google Drive Restore শুরু করা যায়নি।\n\n" +
          e.message
        );
      }
    },


    /* ---------------------------------------------------------
       Google sign in UI
       --------------------------------------------------------- */

    renderGoogleStatus: function () {

      var signedIn =
        this.isGoogleSignedIn();


      var email =
        signedIn
          ? this.getGoogleEmail()
          : "";


      if (signedIn) {

        return `

          <div
            style="
              padding:12px;
              border-radius:14px;
              background:#eff6ff;
              border:1px solid #bfdbfe;
              margin-bottom:12px;
            "
          >

            <div
              style="
                font-size:13px;
                font-weight:800;
                color:#1e3a8a;
              "
            >
              ☁️ Google Drive Connected
            </div>

            <div
              style="
                font-size:12px;
                color:#475569;
                margin-top:4px;
                word-break:break-word;
              "
            >
              ${U.esc(email)}
            </div>

          </div>

        `;

      }


      return `

        <div
          style="
            padding:12px;
            border-radius:14px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            margin-bottom:12px;
          "
        >

          <div
            style="
              font-size:13px;
              font-weight:800;
              color:#0f172a;
            "
          >
            ☁️ Google Drive
          </div>

          <div
            style="
              font-size:12px;
              color:#64748b;
              margin-top:4px;
              line-height:1.5;
            "
          >
            Cloud Backup ব্যবহার করতে Google Account
            দিয়ে Sign In করুন।
          </div>

        </div>

      `;
    },


    /* =========================================================
       EMAIL BACKUP
       ========================================================= */


    /* ---------------------------------------------------------
       Email backup
       --------------------------------------------------------- */

    emailBackup: function () {

      if (
        !window.AndroidBackup ||
        typeof AndroidBackup.sendEmailBackup !==
          "function"
      ) {

        alert(
          "Email Backup system পাওয়া যায়নি।"
        );

        return;
      }


      /*
       * Empty data Email-এ পাঠানো হবে না।
       */
      if (!this.hasBackupData()) {

        alert(
          "বর্তমানে কোনো Student, Payment বা Batch data নেই।\n\n" +
          "Empty Email backup তৈরি করা হয়নি।"
        );

        return;
      }


      var confirmed =
        confirm(
          "বর্তমান Tuition data একটি JSON backup file হিসেবে Email App-এ পাঠানোর জন্য প্রস্তুত করা হবে।\n\nচালিয়ে যাবেন?"
        );


      if (!confirmed) {
        return;
      }


      var json =
        this.createBackupJSON();


      var fileName =
        this.createBackupFileName();


      this.showLoading(
        "Email Backup প্রস্তুত হচ্ছে..."
      );


      try {

        AndroidBackup.sendEmailBackup(
          json,
          fileName
        );

      } catch (e) {

        this.hideLoading();


        alert(
          "Email Backup শুরু করা যায়নি।\n\n" +
          e.message
        );
      }
    },


    /* ---------------------------------------------------------
       Email opened callback
       --------------------------------------------------------- */

    emailBackupOpened: function () {

      this.hideLoading();

    },


    /* ---------------------------------------------------------
       Email failed callback
       --------------------------------------------------------- */

    emailBackupFailed: function (
      message
    ) {

      this.hideLoading();


      alert(
        "Email Backup করা যায়নি।\n\n" +
        (message || "Unknown error")
      );
    },


    /* =========================================================
       BACKUP TEXT
       ========================================================= */


    /* ---------------------------------------------------------
       Show backup text
       --------------------------------------------------------- */

    showBackupText: function () {

      if (!this.hasBackupData()) {

        alert(
          "বর্তমানে কোনো Student, Payment বা Batch data নেই।\n\n" +
          "Empty backup text দেখানো হয়নি।"
        );

        return;
      }


      var json =
        this.createBackupJSON();


      var modal =
        document.getElementById(
          "backupTextModal"
        );


      if (modal) {
        modal.remove();
      }


      var html = `

        <div
          id="backupTextModal"
          style="
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.55);
            z-index:9999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:16px;
          "
        >

          <div
            style="
              width:100%;
              max-width:650px;
              max-height:90vh;
              background:#ffffff;
              border-radius:18px;
              padding:18px;
              box-shadow:0 20px 50px rgba(0,0,0,.20);
              display:flex;
              flex-direction:column;
            "
          >

            <div
              style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                margin-bottom:12px;
              "
            >

              <div>

                <div
                  style="
                    font-size:18px;
                    font-weight:800;
                    color:#0f172a;
                  "
                >
                  Backup Text
                </div>

                <div
                  style="
                    font-size:12px;
                    color:#64748b;
                    margin-top:3px;
                  "
                >
                  এই text copy করে নিরাপদ জায়গায় রাখতে পারেন।
                </div>

              </div>


              <button
                type="button"
                onclick="document.getElementById('backupTextModal').remove()"
                style="
                  width:36px;
                  height:36px;
                  border:none;
                  border-radius:10px;
                  background:#f1f5f9;
                  font-size:20px;
                  cursor:pointer;
                "
              >
                ×
              </button>

            </div>


            <textarea
              id="backupTextArea"
              readonly
              style="
                width:100%;
                min-height:320px;
                resize:vertical;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:12px;
                font-size:12px;
                line-height:1.5;
                color:#334155;
                background:#f8fafc;
                box-sizing:border-box;
                outline:none;
              "
            >${U.esc(json)}</textarea>


            <div
              style="
                display:flex;
                gap:8px;
                margin-top:12px;
              "
            >

              <button
                type="button"
                class="btn btn-primary"
                style="flex:1;"
                onclick="BackupModule.selectBackupText()"
              >
                সব Select
              </button>


              <button
                type="button"
                class="btn btn-soft"
                style="flex:1;"
                onclick="BackupModule.copyBackup()"
              >
                Copy
              </button>

            </div>

          </div>

        </div>

      `;


      document.body.insertAdjacentHTML(
        "beforeend",
        html
      );
    },


    /* ---------------------------------------------------------
       Select backup text
       --------------------------------------------------------- */

    selectBackupText: function () {

      var textarea =
        document.getElementById(
          "backupTextArea"
        );


      if (!textarea) {
        return;
      }


      textarea.focus();

      textarea.select();


      try {

        textarea.setSelectionRange(
          0,
          textarea.value.length
        );

      } catch (e) {}
    },


    /* =========================================================
       RESTORE
       ========================================================= */


    /* ---------------------------------------------------------
       Validate backup
       --------------------------------------------------------- */

    validateBackup: function (
      data
    ) {

      if (
        !data ||
        typeof data !== "object"
      ) {

        return {

          valid: false,

          message:
            "Backup data সঠিক JSON object নয়।"

        };
      }


      if (
        Array.isArray(data.students) &&
        Array.isArray(data.payments)
      ) {

        if (!this.hasRestorableData(data)) {

          return {

            valid: false,

            message:
              "এটি একটি Empty backup। Restore করা যাবে না।"

          };
        }


        return {

          valid: true,

          format: "new"

        };
      }


      if (
        data.data &&
        typeof data.data === "object"
      ) {

        var oldData =
          data.data;


        if (
          Array.isArray(oldData.students) &&
          Array.isArray(oldData.payments)
        ) {

          if (!this.hasRestorableData(data)) {

            return {

              valid: false,

              message:
                "এটি একটি Empty backup। Restore করা যাবে না।"

            };
          }


          return {

            valid: true,

            format: "old"

          };
        }
      }


      return {

        valid: false,

        message:
          "এটি Tuition Fee Collection-এর valid backup file নয়।"

      };
    },


    /* ---------------------------------------------------------
       Normalize backup
       --------------------------------------------------------- */

    normalizeBackup: function (
      data
    ) {

      var validation =
        this.validateBackup(
          data
        );


      if (!validation.valid) {

        throw new Error(
          validation.message
        );
      }


      var source =
        data;


      if (
        validation.format === "old" &&
        data.data
      ) {

        source =
          data.data;
      }


      var settings =
        source.settings || {

          year:
            new Date().getFullYear(),

          month:
            new Date().getMonth() + 1

        };


      var batches =
        Array.isArray(
          source.batches
        )
          ? source.batches
          : [];


      var students =
        Array.isArray(
          source.students
        )
          ? source.students
          : [];


      var payments =
        Array.isArray(
          source.payments
        )
          ? source.payments
          : [];


      return {

        settings:
          settings,

        batches:
          batches,

        students:
          students,

        payments:
          payments,

        studentMonthStatus:
          (source.studentMonthStatus && typeof source.studentMonthStatus === "object")
            ? source.studentMonthStatus
            : {}

      };
    },


    /* ---------------------------------------------------------
       Restore backup
       --------------------------------------------------------- */

    restoreBackup: function (
      data
    ) {

      try {

        var db =
          this.normalizeBackup(
            data
          );


        var studentCount =
          db.students.length;


        var paymentCount =
          db.payments.length;


        var batchCount =
          db.batches.length;


        var message =
          "Backup restore করলে বর্তমান data replace হবে।\n\n" +

          "Student: " +
          studentCount +
          "\n" +

          "Payment: " +
          paymentCount +
          "\n" +

          "Batch: " +
          batchCount +
          "\n\n" +

          "আপনি কি Restore করতে চান?";


        var confirmed =
          confirm(
            message
          );


        if (!confirmed) {
          return;
        }


        if (
          window.Store &&
          typeof Store.save ===
            "function"
        ) {

          Store.save({

            settings:
              db.settings,

            batches:
              db.batches,

            students:
              db.students,

            payments:
              db.payments,

            studentMonthStatus:
              db.studentMonthStatus || {}

          });

        } else {

          throw new Error(
            "Storage system পাওয়া যায়নি।"
          );
        }


        if (window.APP) {

          APP.settings =
            db.settings;


          APP.batches =
            db.batches;


          APP.students =
            db.students;


          APP.payments =
            db.payments;

          APP.studentMonthStatus =
            db.studentMonthStatus || {};
        }


        alert(
          "Backup সফলভাবে Restore হয়েছে।"
        );


        if (window.APP) {

          APP.page =
            "home";


          if (
            Array.isArray(
              APP.pageHistory
            )
          ) {

            APP.pageHistory =
              [];
          }


          APP.render();
        }


      } catch (e) {

        console.error(
          "Restore error:",
          e
        );


        alert(
          "Restore করা যায়নি।\n\n" +
          e.message
        );
      }
    },


    /* ---------------------------------------------------------
       Import from file
       --------------------------------------------------------- */

    importFromFile: function (
      input
    ) {

      if (
        !input ||
        !input.files ||
        !input.files.length
      ) {

        return;
      }


      var file =
        input.files[0];


      if (
        file.type &&
        file.type !==
          "application/json" &&
        !file.name
          .toLowerCase()
          .endsWith(".json")
      ) {

        alert(
          "শুধু JSON backup file নির্বাচন করুন।"
        );


        input.value =
          "";


        return;
      }


      var reader =
        new FileReader();


      reader.onload =
        function (event) {

          try {

            var text =
              event.target.result;


            var data =
              JSON.parse(
                text
              );


            BackupModule
              .restoreBackup(
                data
              );


          } catch (e) {

            console.error(
              "Import error:",
              e
            );


            alert(
              "Backup file পড়া যায়নি।\n\n" +
              "সঠিক JSON backup file নির্বাচন করুন।"
            );
          }


          input.value =
            "";
        };


      reader.onerror =
        function () {

          alert(
            "Backup file পড়তে সমস্যা হয়েছে।"
          );


          input.value =
            "";
        };


      reader.readAsText(
        file
      );
    },


    /* ---------------------------------------------------------
       Paste restore
       --------------------------------------------------------- */

    pasteRestore: function () {

      var textarea =
        document.getElementById(
          "restoreTextArea"
        );


      if (!textarea) {

        alert(
          "Restore text box পাওয়া যায়নি।"
        );


        return;
      }


      var text =
        textarea.value.trim();


      if (!text) {

        alert(
          "প্রথমে Backup JSON paste করুন।"
        );


        return;
      }


      this.restoreFromTextArea();
    },


    /* ---------------------------------------------------------
       Restore from textarea
       --------------------------------------------------------- */

    restoreFromTextArea: function () {

      var textarea =
        document.getElementById(
          "restoreTextArea"
        );


      if (!textarea) {
        return;
      }


      var text =
        textarea.value.trim();


      if (!text) {

        alert(
          "Backup JSON খালি।"
        );


        return;
      }


      try {

        var data =
          JSON.parse(
            text
          );


        this.restoreBackup(
          data
        );


      } catch (e) {

        console.error(
          "Textarea restore error:",
          e
        );


        alert(
          "JSON সঠিক নয়।\n\n" +
          "Backup text আবার check করুন।"
        );
      }
    },


    /* =========================================================
       LOADING
       ========================================================= */


    /* ---------------------------------------------------------
       Show loading
       --------------------------------------------------------- */

    showLoading: function (
      text
    ) {

      this.hideLoading();


      var html = `

        <div
          id="backupLoadingOverlay"
          style="
            position:fixed;
            inset:0;
            z-index:10000;
            background:rgba(15,23,42,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
          "
        >

          <div
            style="
              width:100%;
              max-width:340px;
              background:#ffffff;
              border-radius:18px;
              padding:24px;
              text-align:center;
              box-shadow:0 20px 50px rgba(0,0,0,.20);
            "
          >

            <div
              style="
                width:42px;
                height:42px;
                margin:0 auto 14px;
                border:4px solid #dbeafe;
                border-top-color:#2563eb;
                border-radius:50%;
                animation:backupSpin .8s linear infinite;
              "
            ></div>


            <div
              style="
                font-size:15px;
                font-weight:800;
                color:#0f172a;
              "
            >
              ${U.esc(text || "Processing...")}
            </div>


            <div
              style="
                font-size:12px;
                color:#64748b;
                margin-top:5px;
              "
            >
              একটু অপেক্ষা করুন...
            </div>

          </div>

        </div>

        <style id="backupLoadingStyle">
          @keyframes backupSpin {
            from {
              transform:rotate(0deg);
            }

            to {
              transform:rotate(360deg);
            }
          }
        </style>

      `;


      document.body.insertAdjacentHTML(
        "beforeend",
        html
      );
    },


    /* ---------------------------------------------------------
       Hide loading
       --------------------------------------------------------- */

    hideLoading: function () {

      var overlay =
        document.getElementById(
          "backupLoadingOverlay"
        );


      if (overlay) {
        overlay.remove();
      }


      var style =
        document.getElementById(
          "backupLoadingStyle"
        );


      if (style) {
        style.remove();
      }
    },


    /* =========================================================
       GOOGLE CALLBACK HANDLERS
       ========================================================= */


    googleBackupSuccess: function (
      fileId
    ) {

      this.hideLoading();


      alert(
        "☁️ Google Drive Backup সফল হয়েছে।"
      );


      this.refreshPage();
    },


    googleBackupFailed: function (
      message
    ) {

      this.hideLoading();


      alert(
        "Google Drive Backup করা যায়নি।\n\n" +
        (message || "Unknown error")
      );
    },


    googleRestoreSuccess: function (
      json
    ) {

      this.hideLoading();


      try {

        var data =
          JSON.parse(
            json
          );


        /*
         * Google Drive থেকে পাওয়া data আবার
         * frontend level-এও যাচাই করা হচ্ছে।
         *
         * Empty backup কখনো restore হবে না।
         */
        if (!this.hasRestorableData(data)) {

          throw new Error(
            "Google Drive থেকে পাওয়া backup-এ কোনো Student, Payment বা Batch data নেই। Empty backup restore করা হবে না।"
          );
        }


        this.restoreBackup(
          data
        );


      } catch (e) {

        alert(
          "Google Drive থেকে পাওয়া backup সঠিক JSON নয়।\n\n" +
          e.message
        );
      }
    },


    googleRestoreFailed: function (
      message
    ) {

      this.hideLoading();


      alert(
        "Google Drive Restore করা যায়নি।\n\n" +
        (message || "Unknown error")
      );
    },


    googleSignedIn: function (
      email
    ) {

      this.hideLoading();


      alert(
        "Google Account connected:\n" +
        (email || "")
      );


      this.refreshPage();
    },


    googleSignedOut: function () {

      this.hideLoading();


      this.refreshPage();
    },


    googleSignInFailed: function (
      code
    ) {

      this.hideLoading();


      alert(
        "Google Sign-In failed.\n\nCode: " +
        code
      );
    },


    /* ---------------------------------------------------------
       Refresh backup page
       --------------------------------------------------------- */

    refreshPage: function () {

      try {

        if (
          window.APP &&
          APP.page === "backup"
        ) {

          APP.render();
        }

      } catch (e) {

        console.error(
          "Backup refresh error:",
          e
        );
      }
    },


    /* =========================================================
       RENDER
       ========================================================= */

    render: function () {

      var stats =
        this.getStats();


      var signedIn =
        this.isGoogleSignedIn();


      var email =
        signedIn
          ? this.getGoogleEmail()
          : "";


      return `

        <div
          style="
            padding-bottom:24px;
          "
        >

          <!-- Header -->

          <div
            style="
              display:flex;
              align-items:center;
              gap:10px;
              margin-bottom:16px;
            "
          >

            <button
              type="button"
              onclick="APP.back()"
              class="btn btn-soft"
              style="
                width:40px;
                height:40px;
                border-radius:12px;
                font-size:22px;
                cursor:pointer;
                padding:0;
              "
              aria-label="Back"
            >
              ←
            </button>


            <div style="flex:1;">

              <div
                style="
                  font-size:20px;
                  font-weight:800;
                  color:inherit;
                "
              >
                Backup & Restore
              </div>

              <div
                class="text-slate-500"
                style="
                  font-size:12px;
                  margin-top:2px;
                "
              >
                আপনার Tuition data নিরাপদ রাখুন
              </div>

            </div>

            <button
              type="button"
              class="btn btn-soft"
              style="padding:6px 11px; font-size:12px; font-weight:700; border-radius:10px;"
              onclick="APP.toggleTheme()"
              title="থিম পরিবর্তন"
            >
              ${APP.getTheme && APP.getTheme() === 'light' ? '🌙 ডার্ক' : '☀️ লাইট'}
            </button>

          </div>


          <!-- Statistics -->

          <div
            class="grid grid-3 gap-2"
            style="
              margin-bottom:14px;
            "
          >

            <div class="card stat">

              <div class="statlabel">
                Student
              </div>

              <div class="statvalue">
                ${stats.students}
              </div>

            </div>


            <div class="card stat">

              <div class="statlabel">
                Payment
              </div>

              <div class="statvalue">
                ${stats.payments}
              </div>

            </div>


            <div class="card stat">

              <div class="statlabel">
                Batch
              </div>

              <div class="statvalue">
                ${stats.batches}
              </div>

            </div>

          </div>


          <!-- GOOGLE DRIVE -->

          <div
            class="card"
            style="
              margin-bottom:12px;
            "
          >

            <div
              style="
                font-size:17px;
                font-weight:800;
                color:#0f172a;
                margin-bottom:5px;
              "
            >
              ☁️ Google Drive Backup
            </div>


            <div
              class="text-xs text-slate-500"
              style="
                line-height:1.5;
                margin-bottom:14px;
              "
            >

              Google Account-এর মাধ্যমে আপনার
              Tuition data Cloud-এ নিরাপদে রাখুন।

            </div>


            ${
              signedIn

              ?

              `

              <div
                style="
                  padding:11px;
                  margin-bottom:10px;
                  border-radius:12px;
                  background:#eff6ff;
                  border:1px solid #bfdbfe;
                "
              >

                <div
                  style="
                    font-size:12px;
                    color:#1e40af;
                    font-weight:800;
                  "
                >
                  ✓ Google Account Connected
                </div>

                <div
                  style="
                    font-size:12px;
                    color:#475569;
                    margin-top:3px;
                    word-break:break-word;
                  "
                >
                  ${U.esc(email)}
                </div>

              </div>


              <button
                type="button"
                class="btn btn-primary"
                style="
                  width:100%;
                  margin-bottom:8px;
                "
                onclick="BackupModule.backupToDrive()"
              >
                ☁️ Backup to Google Drive
              </button>


              <button
                type="button"
                class="btn btn-soft"
                style="
                  width:100%;
                "
                onclick="BackupModule.restoreFromDrive()"
              >
                ♻️ Restore from Google Drive
              </button>

              `

              :

              `

              <button
                type="button"
                class="btn btn-primary"
                style="
                  width:100%;
                "
                onclick="BackupModule.googleSignIn()"
              >
                🔐 Sign in with Google
              </button>

              `
            }

          </div>


          <!-- EMAIL -->

          <div
            class="card"
            style="
              margin-bottom:12px;
            "
          >

            <div
              style="
                font-size:17px;
                font-weight:800;
                color:#0f172a;
                margin-bottom:5px;
              "
            >
              📧 Email Backup
            </div>


            <div
              class="text-xs text-slate-500"
              style="
                line-height:1.5;
                margin-bottom:14px;
              "
            >

              Backup JSON file attachment হিসেবে
              Email App-এর মাধ্যমে নিজের কাছে পাঠিয়ে রাখতে পারেন।

            </div>


            <button
              type="button"
              class="btn btn-soft"
              style="
                width:100%;
              "
              onclick="BackupModule.emailBackup()"
            >
              ✉️ Send Backup by Email
            </button>

          </div>


          <!-- LOCAL BACKUP -->

          <div
            class="card"
            style="
              margin-bottom:12px;
            "
          >

            <div
              style="
                font-size:17px;
                font-weight:800;
                color:#0f172a;
                margin-bottom:5px;
              "
            >
              📱 Local Backup
            </div>


            <div
              class="text-xs text-slate-500"
              style="
                line-height:1.5;
                margin-bottom:14px;
              "
            >

              Internet ছাড়া JSON file হিসেবে
              Backup রাখতে পারবেন।

            </div>


            <button
              type="button"
              class="btn btn-primary"
              style="
                width:100%;
                margin-bottom:8px;
              "
              onclick="BackupModule.downloadBackup()"
            >
              ⬇️ Backup Download
            </button>


            <button
              type="button"
              class="btn btn-soft"
              style="
                width:100%;
                margin-bottom:8px;
              "
              onclick="BackupModule.copyBackup()"
            >
              📋 Backup Copy
            </button>


            <button
              type="button"
              class="btn btn-soft"
              style="
                width:100%;
              "
              onclick="BackupModule.showBackupText()"
            >
              📄 Backup Text দেখুন
            </button>

          </div>


          <!-- RESTORE -->

          <div
            class="card"
            style="
              margin-top:12px;
            "
          >

            <div
              style="
                font-size:17px;
                font-weight:800;
                color:#0f172a;
                margin-bottom:5px;
              "
            >
              ♻️ Local Restore
            </div>


            <div
              class="text-xs text-slate-500"
              style="
                line-height:1.5;
                margin-bottom:14px;
              "
            >

              আগে তৈরি করা JSON backup file
              অথবা Backup Text থেকে data ফিরিয়ে আনুন।

            </div>


            <label
              class="btn btn-primary"
              style="
                display:block;
                width:100%;
                box-sizing:border-box;
                text-align:center;
                cursor:pointer;
                margin-bottom:8px;
              "
            >

              📂 Backup File নির্বাচন করুন

              <input
                type="file"
                accept=".json,application/json"
                style="display:none;"
                onchange="BackupModule.importFromFile(this)"
              >

            </label>


            <div
              style="
                text-align:center;
                color:#94a3b8;
                font-size:12px;
                margin:8px 0;
              "
            >
              অথবা
            </div>


            <textarea
              id="restoreTextArea"
              placeholder="এখানে Backup JSON paste করুন..."
              style="
                width:100%;
                min-height:180px;
                resize:vertical;
                box-sizing:border-box;
                border:1px solid #cbd5e1;
                border-radius:12px;
                padding:12px;
                background:#f8fafc;
                color:#334155;
                font-size:12px;
                line-height:1.5;
                outline:none;
              "
            ></textarea>


            <button
              type="button"
              class="btn btn-primary"
              style="
                width:100%;
                margin-top:8px;
              "
              onclick="BackupModule.pasteRestore()"
            >
              ♻️ Paste করে Restore
            </button>

          </div>


          <!-- WARNING -->

          <div
            style="
              margin-top:12px;
              padding:13px;
              border-radius:14px;
              background:#fff7ed;
              border:1px solid #fed7aa;
              color:#9a3412;
              font-size:12px;
              line-height:1.55;
            "
          >

            <b>⚠️ গুরুত্বপূর্ণ:</b>

            Restore করার সময় বর্তমান data
            backup-এর data দিয়ে replace হবে।
            তাই গুরুত্বপূর্ণ data থাকলে আগে
            একটি নতুন Backup তৈরি করে রাখুন।

          </div>

        </div>

      `;
    }
  };


  /* =========================================================
     APP NAVIGATION INTEGRATION
     ========================================================= */

  if (window.APP) {

    var originalGo =
      APP.go;


    var originalRender =
      APP.render;


    APP.backup = function () {

      this.go(
        "backup"
      );
    };


    APP.backupPage = function () {

      this.go(
        "backup"
      );
    };


    APP.go = function (
      page
    ) {

      if (
        page === "backup"
      ) {

        if (
          !Array.isArray(
            this.pageHistory
          )
        ) {

          this.pageHistory =
            [];
        }


        if (
          this.page !==
          "backup"
        ) {

          this.pageHistory.push(
            this.page
          );
        }


        this.page =
          "backup";


        this.search =
          "";


        this.render();


        return;
      }


      originalGo.call(
        this,
        page
      );
    };


    APP.render = function () {

      if (
        this.page ===
        "backup"
      ) {

        var container =
          document.getElementById(
            "app"
          );


        if (!container) {
          return;
        }


        container.innerHTML =
          BackupModule.render();


        return;
      }


      originalRender.call(
        this
      );
    };

  }


  /* =========================================================
     GLOBAL CALLBACKS
     ========================================================= */


  window.googleSignedIn =
    function (
      email
    ) {

      BackupModule
        .googleSignedIn(
          email
        );
    };


  window.googleSignedOut =
    function () {

      BackupModule
        .googleSignedOut();
    };


  window.googleSignInFailed =
    function (
      code
    ) {

      BackupModule
        .googleSignInFailed(
          code
        );
    };


  window.googleDriveBackupSuccess =
    function (
      fileId
    ) {

      BackupModule
        .googleBackupSuccess(
          fileId
        );
    };


  window.googleDriveBackupFailed =
    function (
      message
    ) {

      BackupModule
        .googleBackupFailed(
          message
        );
    };


  window.googleDriveRestoreSuccess =
    function (
      json
    ) {

      BackupModule
        .googleRestoreSuccess(
          json
        );
    };


  window.googleDriveRestoreFailed =
    function (
      message
    ) {

      BackupModule
        .googleRestoreFailed(
          message
        );
    };


  window.emailBackupOpened =
    function () {

      BackupModule
        .emailBackupOpened();
    };


  window.emailBackupFailed =
    function (
      message
    ) {

      BackupModule
        .emailBackupFailed(
          message
        );
    };

})();