
window.ReceiptModule = {
  open(id) {
    const p = APP.payments.find(x => x.id === id);
    if (!p) return;
    const s = StudentModule.get(p.studentId);
    APP.modal(`
      <div class="receipt" id="receipt">
        <h2>Tuition Collection</h2>
        <div class="center text-xs text-slate-500">Payment Receipt</div>
        <hr>
        <p><b>Student:</b> ${U.esc(s?.name || "")}</p>
        <p><b>Month:</b> ${U.months[p.month-1]} ${p.year}</p>
        <p><b>Date:</b> ${U.esc(p.date)}</p>
        <p><b>Amount:</b> ${U.money(p.amount)}</p>
        <p><b>Comment:</b> ${U.esc(p.comment || "—")}</p>
        <hr><div class="center">ধন্যবাদ</div>
      </div>
      <div class="flex gap-2" style="justify-content:flex-end;margin-top:15px">
        <button class="btn btn-soft no-print" onclick="APP.closeModal()">Close</button>
        <button class="btn btn-primary no-print" onclick="window.print()">🖨 Print</button>
      </div>
    `);
  }
};
