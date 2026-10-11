(function () {

  /* =========================================================
     NS TUITION COLLECTION
     AUTOMATIC GOOGLE DRIVE BACKUP
     
     এই module মূল Backup/Restore system পরিবর্তন করে না।
     APP.save() সম্পন্ন হওয়ার পর Auto Backup trigger করে।
     ========================================================= */


  window.AutoBackup = {


    /* =========================================================
       SETTINGS
       ========================================================= */

    enabled: true,

    /* Data change হওয়ার পর কত ms অপেক্ষা করবে */
    debounceDelay: 5000,

    /* দুইটি Auto Backup-এর মধ্যে minimum gap */
    minimumInterval: 15 * 60 * 1000,

    /* localStorage metadata key */
    metaKey: "ns_tuition_auto_backup_meta_v1",

    /* Backup চলমান কি না */
    running: false,

    /* Pending timer */
    timer: null,

    /* Restore চলাকালীন backup বন্ধ */
    suspended: false,



    /* =========================================================
       INITIALIZE
       ========================================================= */

    init: function () {

      try {

        this.loadMeta();

        this.installSaveHook();

        console.log(
          "Auto Backup initialized."
        );

      } catch (e) {

        console.error(
          "Auto Backup initialization error:",
          e
        );
      }
    },



    /* =========================================================
       META
       ========================================================= */

    loadMeta: function () {

      this.lastBackupTime = 0;

      try {

        var raw =
          localStorage.getItem(
            this.metaKey
          );

        if (!raw) {
          return;
        }

        var data =
          JSON.parse(raw);

        if (
          data &&
          typeof data.lastBackupTime ===
            "number"
        ) {

          this.lastBackupTime =
            data.lastBackupTime;
        }

      } catch (e) {

        console.error(
          "Auto Backup meta load error:",
          e
        );

        this.lastBackupTime = 0;
      }
    },


    saveMeta: function () {

      try {

        localStorage.setItem(
          this.metaKey,
          JSON.stringify({
            lastBackupTime:
              this.lastBackupTime
          })
        );

      } catch (e) {

        console.error(
          "Auto Backup meta save error:",
          e
        );
      }
    },



    /* =========================================================
       INSTALL APP.SAVE HOOK
       ========================================================= */

    installSaveHook: function () {

      if (
        !window.APP ||
        typeof APP.save !== "function"
      ) {

        console.warn(
          "APP.save() পাওয়া যায়নি। Auto Backup hook পরে retry করবে।"
        );

        var self = this;

        setTimeout(
          function () {

            self.installSaveHook();

          },
          1000
        );

        return;
      }


      /* একই hook দ্বিতীয়বার install করা যাবে না */

      if (
        APP.__autoBackupSaveHookInstalled
      ) {

        return;
      }


      var originalSave =
        APP.save;


      var self = this;


      APP.save = function () {

        /* প্রথমে normal local save */

        var result;

        try {

          result =
            originalSave.apply(
              this,
              arguments
            );

        } catch (e) {

          console.error(
            "APP.save() error:",
            e
          );

          throw e;
        }


        /*
         * Local save সফল হওয়ার পর
         * Auto Backup schedule হবে।
         */

        try {

          self.schedule();

        } catch (e) {

          console.error(
            "Auto Backup schedule error:",
            e
          );
        }


        return result;
      };


      APP.__autoBackupSaveHookInstalled =
        true;


      console.log(
        "APP.save() Auto Backup hook installed."
      );
    },



    /* =========================================================
       SCHEDULE
       ========================================================= */

    schedule: function () {

      if (!this.enabled) {
        return;
      }


      if (this.suspended) {
        return;
      }


      /*
       * Google Account connected না থাকলে
       * এখনই backup করার দরকার নেই।
       */

      if (
        !this.isGoogleSignedIn()
      ) {

        return;
      }


      /*
       * আগের timer থাকলে সেটি বাতিল।
       *
       * ফলে একসাথে অনেক save হলে
       * শেষে মাত্র একটি backup হবে।
       */

      if (this.timer) {

        clearTimeout(
          this.timer
        );

        this.timer = null;
      }


      var self = this;


      this.timer =
        setTimeout(
          function () {

            self.timer = null;

            self.run();

          },
          this.debounceDelay
        );
    },



    /* =========================================================
       CHECK GOOGLE SIGN-IN
       ========================================================= */

    isGoogleSignedIn: function () {

      try {

        if (
          !window.AndroidGoogle
        ) {

          return false;
        }


        if (
          typeof AndroidGoogle.isSignedIn !==
            "function"
        ) {

          return false;
        }


        return Boolean(
          AndroidGoogle.isSignedIn()
        );

      } catch (e) {

        console.error(
          "Auto Backup Google sign-in check error:",
          e
        );

        return false;
      }
    },



    /* =========================================================
       CHECK DATA
       ========================================================= */

    hasData: function () {

      try {

        if (
          !window.BackupModule
        ) {

          return false;
        }


        var db =
          BackupModule.getDatabase();


        if (!db) {
          return false;
        }


        var students =
          Array.isArray(db.students)
            ? db.students
            : [];


        var payments =
          Array.isArray(db.payments)
            ? db.payments
            : [];


        var batches =
          Array.isArray(db.batches)
            ? db.batches
            : [];


        /*
         * Student / Payment / Batch থাকলেই
         * backup করার মতো data আছে।
         */

        return (
          students.length > 0 ||
          payments.length > 0 ||
          batches.length > 0
        );

      } catch (e) {

        console.error(
          "Auto Backup data check error:",
          e
        );

        return false;
      }
    },



    /* =========================================================
       CHECK BACKUP INTERVAL
       ========================================================= */

    canRunByInterval: function () {

      var now =
        Date.now();


      if (
        !this.lastBackupTime ||
        this.lastBackupTime <= 0
      ) {

        return true;
      }


      var elapsed =
        now -
        this.lastBackupTime;


      return (
        elapsed >=
        this.minimumInterval
      );
    },



    /* =========================================================
       RUN AUTO BACKUP
       ========================================================= */

    run: function () {

      if (!this.enabled) {
        return;
      }


      if (this.suspended) {
        return;
      }


      if (this.running) {

        /*
         * Backup already চলছে।
         * নতুন backup শুরু করব না।
         */

        return;
      }


      if (
        !this.isGoogleSignedIn()
      ) {

        return;
      }


      if (
        !this.hasData()
      ) {

        /*
         * Empty database backup করা যাবে না।
         */

        return;
      }


      if (
        !this.canRunByInterval()
      ) {

        /*
         * 15 মিনিটের মধ্যে আগে backup হয়েছে।
         */

        return;
      }


      if (
        !window.BackupModule
      ) {

        return;
      }


      if (
        typeof BackupModule.createBackupJSON !==
          "function"
      ) {

        return;
      }


      if (
        !window.AndroidGoogle ||
        typeof AndroidGoogle.backupToDrive !==
          "function"
      ) {

        return;
      }


      var json;


      try {

        json =
          BackupModule.createBackupJSON();

      } catch (e) {

        console.error(
          "Auto Backup JSON create error:",
          e
        );

        return;
      }


      if (
        !json ||
        !json.trim()
      ) {

        return;
      }


      this.running = true;


      /*
       * Backup request পাঠানোর সময়েই
       * interval mark করছি।
       *
       * এতে rapid repeated save থেকেও
       * duplicate upload হবে না।
       */

      this.lastBackupTime =
        Date.now();

      this.saveMeta();


      try {

        AndroidGoogle.backupToDrive(
          json
        );

        console.log(
          "Automatic Google Drive backup started."
        );

      } catch (e) {

        /*
         * Request শুরুই না হলে timestamp
         * rollback করা হবে, যাতে পরে retry হতে পারে।
         */

        this.lastBackupTime = 0;

        this.saveMeta();

        console.error(
          "Automatic Google Drive backup failed:",
          e
        );

        this.running = false;
      }
    },



    /* =========================================================
       BACKUP SUCCESS
       ========================================================= */

    success: function () {

      this.running = false;

      this.lastBackupTime =
        Date.now();

      this.saveMeta();

      console.log(
        "Automatic Google Drive backup completed."
      );
    },



    /* =========================================================
       BACKUP FAILED
       ========================================================= */

    failed: function () {

      this.running = false;

      /*
       * Failure হলে interval reset করছি।
       * পরবর্তী data change-এ retry করার সুযোগ থাকবে।
       */

      this.lastBackupTime = 0;

      this.saveMeta();

      console.warn(
        "Automatic Google Drive backup failed."
      );
    },



    /* =========================================================
       SUSPEND
       ========================================================= */

    suspend: function () {

      this.suspended = true;


      if (this.timer) {

        clearTimeout(
          this.timer
        );

        this.timer = null;
      }
    },



    /* =========================================================
       RESUME
       ========================================================= */

    resume: function () {

      this.suspended = false;
    }



  };



  /* =========================================================
     GOOGLE BACKUP CALLBACK HOOK
     
     Main backup module-এর callback-এর সঙ্গে
     Auto Backup status synchronize করা হচ্ছে।
     ========================================================= */


  function installGoogleCallbackHooks() {

    if (
      !window.BackupModule
    ) {

      setTimeout(
        installGoogleCallbackHooks,
        1000
      );

      return;
    }


    /*
     * Success callback
     */

    if (
      typeof BackupModule.googleDriveBackupSuccess ===
        "function" &&
      !BackupModule.__autoBackupSuccessHook
    ) {

      var originalSuccess =
        BackupModule.googleDriveBackupSuccess;


      BackupModule.googleDriveBackupSuccess =
        function () {

          try {

            AutoBackup.success();

          } catch (e) {

            console.error(
              "Auto Backup success hook error:",
              e
            );
          }


          return originalSuccess.apply(
            this,
            arguments
          );
        };


      BackupModule.__autoBackupSuccessHook =
        true;
    }


    /*
     * Failed callback
     */

    if (
      typeof BackupModule.googleDriveBackupFailed ===
        "function" &&
      !BackupModule.__autoBackupFailedHook
    ) {

      var originalFailed =
        BackupModule.googleDriveBackupFailed;


      BackupModule.googleDriveBackupFailed =
        function () {

          try {

            AutoBackup.failed();

          } catch (e) {

            console.error(
              "Auto Backup failed hook error:",
              e
            );
          }


          return originalFailed.apply(
            this,
            arguments
          );
        };


      BackupModule.__autoBackupFailedHook =
        true;
    }
  }



  /* =========================================================
     RESTORE PROTECTION
     
     Restore-এর সময় APP.save() হলে Auto Backup যেন
     সঙ্গে সঙ্গে নতুন restored data Drive-এ upload না করে।
     ========================================================= */


  function installRestoreProtection() {

    if (
      !window.BackupModule
    ) {

      setTimeout(
        installRestoreProtection,
        1000
      );

      return;
    }


    /*
     * Existing restoreBackup function
     */

    if (
      typeof BackupModule.restoreBackup ===
        "function" &&
      !BackupModule.__autoBackupRestoreHook
    ) {

      var originalRestore =
        BackupModule.restoreBackup;


      BackupModule.restoreBackup =
        function () {

          AutoBackup.suspend();


          try {

            return originalRestore.apply(
              this,
              arguments
            );

          } finally {

            /*
             * Restore-এর local save শেষ হওয়ার পর
             * কিছুক্ষণ পরে Auto Backup আবার চালু হবে।
             */

            setTimeout(
              function () {

                AutoBackup.resume();

              },
              2000
            );
          }
        };


      BackupModule.__autoBackupRestoreHook =
        true;
    }


    /*
     * Google Restore callback
     *
     * বর্তমান BackupModule-এর implementation-এ
     * callback নাম আলাদা হতে পারে।
     *
     * তাই যেগুলো পাওয়া যায় সেগুলো safely hook করছি।
     */


    var restoreNames = [
      "googleDriveRestoreSuccess",
      "googleRestoreData"
    ];


    for (
      var i = 0;
      i < restoreNames.length;
      i++
    ) {

      var name =
        restoreNames[i];


      if (
        typeof BackupModule[name] ===
          "function" &&
        !BackupModule[
          "__autoBackupRestoreHook_" +
          name
        ]
      ) {

        (function (methodName) {

          var original =
            BackupModule[
              methodName
            ];


          BackupModule[
            methodName
          ] = function () {

            AutoBackup.suspend();


            try {

              return original.apply(
                this,
                arguments
              );

            } finally {

              setTimeout(
                function () {

                  AutoBackup.resume();

                },
                3000
              );
            }
          };


          BackupModule[
            "__autoBackupRestoreHook_" +
            methodName
          ] = true;

        })(name);
      }
    }
  }



  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function initialize() {

    if (
      !window.APP
    ) {

      setTimeout(
        initialize,
        500
      );

      return;
    }


    AutoBackup.init();


    installGoogleCallbackHooks();


    installRestoreProtection();
  }


  initialize();



})();