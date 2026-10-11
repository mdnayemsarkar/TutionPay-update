
window.StudentModule = {
  add(form) {
    const name = form.name.trim();
    if (!name) return false;
    APP.students.push({
      id: U.id(), name, phone: form.phone.trim(), className: form.className.trim(),
      fee: Number(form.fee || 0), joinDate: form.joinDate,
      guardian: form.guardian.trim(), address: form.address.trim(), comment: form.comment.trim()
    });
    return true;
  },
  get(id) { return APP.students.find(s => s.id === id); },
  paid(id, year, month) {
    return APP.payments.filter(p => p.studentId === id && p.year == year && p.month == month)
      .reduce((sum,p) => sum + Number(p.amount || 0), 0);
  },
  status(s, year, month) {
    const paid = this.paid(s.id, year, month), fee = Number(s.fee || 0);
    if (fee > 0 && paid >= fee) return "Paid";
    if (paid > 0) return "Partial";
    return "Due";
  }
};
