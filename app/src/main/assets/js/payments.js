
window.PaymentModule = {
  add(form) {
    const amount = Number(form.amount || 0);
    if (!form.studentId || !amount) return false;
    const d = new Date(form.date || U.today());
    APP.payments.push({
      id: U.id(), studentId: form.studentId, year: d.getFullYear(),
      month: Number(form.month), date: form.date || U.today(),
      amount, comment: form.comment.trim()
    });
    return true;
  },
  monthTotal(year, month) {
    return APP.payments.filter(p => p.year == year && p.month == month)
      .reduce((sum,p) => sum + Number(p.amount || 0), 0);
  },
  yearTotal(year) {
    return APP.payments.filter(p => p.year == year)
      .reduce((sum,p) => sum + Number(p.amount || 0), 0);
  }
};
