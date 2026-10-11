window.Store = {

  key: "tuition_collection_tailwind_v1",

  load: function() {

    try {

      var raw =
        localStorage.getItem(this.key);

      if (raw) {

        var db =
          JSON.parse(raw);


        // --------------------------------------------------
        // OLD DATA REPAIR
        // --------------------------------------------------

        if (!db.settings) {

          db.settings = {

            year:
              new Date().getFullYear(),

            month:
              new Date().getMonth() + 1

          };

        }


        if (!Array.isArray(db.students)) {

          db.students = [];

        }


        if (!Array.isArray(db.payments)) {

          db.payments = [];

        }


        // --------------------------------------------------
        // NEW BATCH DATA
        // --------------------------------------------------

        if (!Array.isArray(db.batches)) {

          db.batches = [];

        }


        // --------------------------------------------------
        // AUTO CURRENT MONTH / YEAR
        // --------------------------------------------------
        // অ্যাপ চালু হলে ফোনের বর্তমান
        // মাস ও বছর অনুযায়ী settings আপডেট হবে।
        //
        // পুরোনো payment data পরিবর্তন হবে না।
        // যেমন:
        // সেপ্টেম্বরের payment সেপ্টেম্বরেই থাকবে।
        // অক্টোবর শুরু হলে current month = অক্টোবর হবে।
        // --------------------------------------------------

        var now =
          new Date();

        var currentYear =
          now.getFullYear();

        var currentMonth =
          now.getMonth() + 1;


        if (
          db.settings.year !== currentYear ||
          db.settings.month !== currentMonth
        ) {

          db.settings.year =
            currentYear;

          db.settings.month =
            currentMonth;


          // নতুন current month/year
          // localStorage-এ সংরক্ষণ করা হচ্ছে।
          localStorage.setItem(
            this.key,
            JSON.stringify(db)
          );

        }


        return db;

      }

    } catch (e) {

      // If saved data is damaged,
      // create fresh database.

    }


    // ------------------------------------------------------
    // NEW DATABASE
    // ------------------------------------------------------

    return {

      settings: {

        year:
          new Date().getFullYear(),

        month:
          new Date().getMonth() + 1

      },

      batches: [],

      students: [],

      payments: []

    };

  },


  save: function(db) {

    try {

      localStorage.setItem(
        this.key,
        JSON.stringify(db)
      );

    } catch (e) {

      console.log(
        "Storage save error:",
        e
      );

    }

  }

};