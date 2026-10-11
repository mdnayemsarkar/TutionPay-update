window.ReceiptModule = {

  open: function (id) {

    var p = APP.payments.find(function (item) {
      return item.id === id;
    });

    if (!p) {
      alert("Payment পাওয়া যায়নি।");
      return;
    }

    var s = StudentModule.get(p.studentId);

    var receiptNo =
      String(p.id || "")
        .replace(/[^0-9]/g, "")
        .slice(-8);

    if (!receiptNo) {
      receiptNo = Date.now().toString().slice(-8);
    }

    var monthName =
      U.months[Number(p.month || 1) - 1] || "";

    var studentName = U.esc((s && s.name) || p.studentName || "Student");
    var className = U.esc((s && s.className) || "");
    var phone = U.esc((s && s.phone) || "");
    var guardian = U.esc((s && s.guardian) || "");
    var address = U.esc((s && s.address) || "");
    var comment = U.esc(p.comment || "");

    APP.modal(`

      <div id="receiptPrintArea">

        <div class="receipt-card">

          <!-- HEADER -->

          <div class="receipt-header">

            <div class="receipt-logo">
              NS
            </div>

            <div class="receipt-brand">

              <div class="brand-name">
                Ns Tution Fee Collection
              </div>

              <div class="brand-subtitle">
                Student Tuition Payment System
              </div>

            </div>

          </div>


          <!-- TITLE -->

          <div class="receipt-heading">

            <div>

              <div class="receipt-title">
                TUTION PAYMENT RECEIPT
              </div>

              <div class="receipt-caption">
                Official payment acknowledgement
              </div>

            </div>

            <div class="paid-badge">
              PAID
            </div>

          </div>


          <!-- RECEIPT META -->

          <div class="receipt-meta">

            <div class="meta-item">

              <span>
                RECEIPT NO.
              </span>

              <strong>
                #${U.esc(receiptNo)}
              </strong>

            </div>

            <div class="meta-item">

              <span>
                PAYMENT DATE
              </span>

              <strong>
                ${U.esc(p.date || "")}
              </strong>

            </div>

            <div class="meta-item">

              <span>
                PAYMENT MONTH
              </span>

              <strong>
                ${U.esc(monthName)}
              </strong>

            </div>

          </div>


          <!-- STUDENT -->

          <div class="receipt-section">

            <div class="section-heading">
              STUDENT INFORMATION
            </div>

            <div class="student-content">

              <div class="student-profile">

                <div class="student-avatar">
                  ${U.esc(
                    (s.name || "S")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>

                  <div class="student-name">
                    ${studentName}
                  </div>

                  ${
                    className
                      ? `
                        <div class="student-class">
                          Class: ${className}
                        </div>
                      `
                      : ""
                  }

                </div>

              </div>


              <div class="student-info-list">

                ${
                  phone
                    ? `
                      <div>
                        <span>Phone</span>
                        <strong>${phone}</strong>
                      </div>
                    `
                    : ""
                }

                ${
                  guardian
                    ? `
                      <div>
                        <span>Guardian</span>
                        <strong>${guardian}</strong>
                      </div>
                    `
                    : ""
                }

                ${
                  address
                    ? `
                      <div>
                        <span>Address</span>
                        <strong>${address}</strong>
                      </div>
                    `
                    : ""
                }

              </div>

            </div>

          </div>


          <!-- PAYMENT DETAILS -->

          <div class="receipt-section">

            <div class="section-heading">
              PAYMENT DETAILS
            </div>

            <div class="payment-table">

              <div class="table-row table-header">

                <div>
                  DESCRIPTION
                </div>

                <div>
                  AMOUNT
                </div>

              </div>


              <div class="table-row payment-item">

                <div>

                  <strong>
                    Tuition Fee
                  </strong>

                  <small>
                    ${U.esc(monthName)}
                  </small>

                </div>

                <div class="amount">
                  ${U.money(p.amount)}
                </div>

              </div>

            </div>

          </div>


          <!-- TOTAL -->

          <div class="total-area">

            <div class="total-text">

              <span>
                TOTAL PAID
              </span>

              <small>
                Payment received successfully
              </small>

            </div>

            <div class="total-amount">
              ${U.money(p.amount)}
            </div>

          </div>


          <!-- COMMENT -->

          ${
            p.comment
              ? `
                <div class="comment-area">

                  <div class="comment-title">
                    NOTE
                  </div>

                  <div class="comment-text">
                    ${comment}
                  </div>

                </div>
              `
              : ""
          }


          <!-- SIGNATURE -->

          <div class="signature-area">

            <div class="signature-box">

              <div class="signature-line"></div>

              <div class="signature-label">
                Receiver's Signature
              </div>

            </div>


            <div class="signature-box">

              <div class="signature-line"></div>

              <div class="signature-label">
                Authorized Signature
              </div>

            </div>

          </div>


          <!-- FOOTER -->

          <div class="receipt-footer">

            <div class="footer-main">
              Thank you for your payment
            </div>

            <div class="footer-small">
              This is a computer generated receipt.
            </div>

            <div class="footer-brand">
              Ns Tution Fee Collection
            </div>

          </div>

        </div>

      </div>


      <!-- BUTTONS -->

      <div
        class="flex gap-2 no-print"
        style="
          justify-content:flex-end;
          margin-top:16px;
        "
      >

        <button
          class="btn btn-soft"
          onclick="APP.closeModal()"
        >
          Close
        </button>

        <button
          class="btn btn-primary"
          onclick="ReceiptModule.print()"
        >
          🖨 Print Receipt
        </button>

      </div>


      <!-- RECEIPT CSS -->

      <style>

        * {
          box-sizing: border-box;
        }


        #receiptPrintArea {
          width: 100%;
        }


        .receipt-card {

          width: 100%;
          max-width: 720px;

          margin: 0 auto;

          background: #ffffff;

          border: 1px solid #d9e1ec;

          border-radius: 14px;

          overflow: hidden;

          color: #172033;

          font-family:
            Arial,
            sans-serif;

        }


        /* =========================
           HEADER
        ========================== */

        .receipt-header {

          display: flex;

          align-items: center;

          gap: 14px;

          padding: 22px 25px;

          background: #2563eb;

          color: #ffffff;

        }


        .receipt-logo {

          width: 50px;
          height: 50px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          background: rgba(
            255,
            255,
            255,
            0.18
          );

          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.35
            );

          font-size: 17px;

          font-weight: 900;

        }


        .brand-name {

          font-size: 21px;

          font-weight: 800;

          line-height: 1.25;

        }


        .brand-subtitle {

          margin-top: 5px;

          font-size: 11px;

          opacity: 0.9;

        }


        /* =========================
           TITLE
        ========================== */

        .receipt-heading {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          padding: 22px 25px 16px;

        }


        .receipt-title {

          font-size: 19px;

          font-weight: 900;

          color: #111827;

          letter-spacing: 0.3px;

        }


        .receipt-caption {

          margin-top: 4px;

          font-size: 10px;

          color: #94a3b8;

        }


        .paid-badge {

          padding: 7px 14px;

          border-radius: 20px;

          background: #dcfce7;

          color: #15803d;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 0.5px;

        }


        /* =========================
           META
        ========================== */

        .receipt-meta {

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;

          padding: 0 25px 20px;

        }


        .meta-item {

          padding: 11px 13px;

          background: #f8fafc;

          border: 1px solid #e2e8f0;

          border-radius: 8px;

        }


        .meta-item span {

          display: block;

          margin-bottom: 5px;

          color: #64748b;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.3px;

        }


        .meta-item strong {

          display: block;

          color: #1e293b;

          font-size: 12px;

        }


        /* =========================
           SECTION
        ========================== */

        .receipt-section {

          margin:
            0 25px 16px;

          border: 1px solid #e2e8f0;

          border-radius: 9px;

          overflow: hidden;

        }


        .section-heading {

          padding: 10px 13px;

          background: #f8fafc;

          border-bottom:
            1px solid #e2e8f0;

          color: #475569;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 0.4px;

        }


        /* =========================
           STUDENT
        ========================== */

        .student-content {

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 20px;

          padding: 15px;

        }


        .student-profile {

          display: flex;

          align-items: center;

          gap: 11px;

        }


        .student-avatar {

          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background: #dbeafe;

          color: #1d4ed8;

          font-size: 16px;

          font-weight: 900;

        }


        .student-name {

          font-size: 14px;

          font-weight: 800;

          color: #0f172a;

        }


        .student-class {

          margin-top: 4px;

          color: #64748b;

          font-size: 11px;

        }


        .student-info-list {

          display: flex;

          flex-direction: column;

          gap: 7px;

        }


        .student-info-list div {

          display: flex;

          justify-content:
            space-between;

          gap: 10px;

          font-size: 11px;

        }


        .student-info-list span {

          color: #64748b;

        }


        .student-info-list strong {

          color: #334155;

          text-align: right;

          max-width: 65%;

        }


        /* =========================
           PAYMENT TABLE
        ========================== */

        .payment-table {

          width: 100%;

        }


        .table-row {

          display: grid;

          grid-template-columns:
            1fr 130px;

          align-items: center;

          gap: 15px;

          padding: 13px 15px;

        }


        .table-header {

          background: #f8fafc;

          color: #64748b;

          font-size: 9px;

          font-weight: 800;

        }


        .table-header div:last-child {

          text-align: right;

        }


        .payment-item {

          min-height: 58px;

        }


        .payment-item strong {

          display: block;

          font-size: 13px;

          color: #1e293b;

        }


        .payment-item small {

          display: block;

          margin-top: 3px;

          color: #94a3b8;

          font-size: 10px;

        }


        .amount {

          text-align: right;

          color: #2563eb;

          font-size: 16px;

          font-weight: 900;

        }


        /* =========================
           TOTAL
        ========================== */

        .total-area {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin:
            0 25px 16px;

          padding: 16px 18px;

          background: #eff6ff;

          border: 1px solid #bfdbfe;

          border-radius: 10px;

        }


        .total-text span {

          display: block;

          color: #1e3a8a;

          font-size: 12px;

          font-weight: 900;

        }


        .total-text small {

          display: block;

          margin-top: 4px;

          color: #64748b;

          font-size: 9px;

        }


        .total-amount {

          color: #1d4ed8;

          font-size: 23px;

          font-weight: 900;

          white-space: nowrap;

        }


        /* =========================
           COMMENT
        ========================== */

        .comment-area {

          margin:
            0 25px 16px;

          padding: 11px 13px;

          background: #f8fafc;

          border: 1px solid #e2e8f0;

          border-radius: 8px;

        }


        .comment-title {

          margin-bottom: 5px;

          color: #64748b;

          font-size: 9px;

          font-weight: 900;

        }


        .comment-text {

          color: #334155;

          font-size: 11px;

          line-height: 1.5;

        }


        /* =========================
           SIGNATURE
        ========================== */

        .signature-area {

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 45px;

          margin:
            28px 25px 20px;

        }


        .signature-box {

          text-align: center;

        }


        .signature-line {

          height: 1px;

          width: 100%;

          background: #94a3b8;

          margin-bottom: 6px;

        }


        .signature-label {

          color: #64748b;

          font-size: 9px;

        }


        /* =========================
           FOOTER
        ========================== */

        .receipt-footer {

          text-align: center;

          padding:
            15px 25px 20px;

          border-top:
            1px dashed #cbd5e1;

        }


        .footer-main {

          color: #334155;

          font-size: 12px;

          font-weight: 800;

        }


        .footer-small {

          margin-top: 4px;

          color: #94a3b8;

          font-size: 9px;

        }


        .footer-brand {

          margin-top: 7px;

          color: #2563eb;

          font-size: 9px;

          font-weight: 800;

        }


        /* =========================
           PRINT
        ========================== */

        @media print {

          .no-print {

            display: none !important;

          }

          .receipt-card {

            max-width: none;

            border-radius: 0;

            border: 1px solid #d9e1ec;

            box-shadow: none;

          }

        }


        /* =========================
           MOBILE
        ========================== */

        @media (max-width: 520px) {

          .receipt-header {

            padding: 18px;

          }

          .brand-name {

            font-size: 18px;

          }

          .receipt-heading {

            padding-left: 18px;
            padding-right: 18px;

          }

          .receipt-meta {

            grid-template-columns: 1fr;

            padding-left: 18px;
            padding-right: 18px;

          }

          .receipt-section {

            margin-left: 18px;
            margin-right: 18px;

          }

          .student-content {

            grid-template-columns: 1fr;

          }

          .total-area {

            margin-left: 18px;
            margin-right: 18px;

          }

          .comment-area {

            margin-left: 18px;
            margin-right: 18px;

          }

          .signature-area {

            margin-left: 18px;
            margin-right: 18px;

            gap: 20px;

          }

          .total-amount {

            font-size: 20px;

          }

        }

      </style>

    `);
  },


  /* ==============================
     PRINT RECEIPT
  ============================== */

  print: function () {

  var receipt =
    document.getElementById("receiptPrintArea");

  if (!receipt) {

    alert("Receipt পাওয়া যায়নি।");
    return;
  }

  if (typeof AndroidPrint === "undefined") {

    alert("Android Print System পাওয়া যায়নি।");
    return;
  }

  // Receipt-এর জন্য প্রয়োজনীয় CSS সংগ্রহ
  var styles = "";

  document
    .querySelectorAll("style")
    .forEach(function (style) {

      styles += style.outerHTML;
    });

  // সম্পূর্ণ printable HTML তৈরি
  var printableHTML = `
    <!DOCTYPE html>
    <html lang="en">

    <head>

      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      >

      ${styles}

      <style>

        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        #receiptPrintArea {
          width: 100%;
        }

        .receipt-card {
          margin: 0 auto;
        }

        @page {
          size: A4;
          margin: 10mm;
        }

      </style>

    </head>

    <body>

      ${receipt.outerHTML}

    </body>

    </html>
  `;

  AndroidPrint.printReceipt(
    printableHTML
  );

}

};