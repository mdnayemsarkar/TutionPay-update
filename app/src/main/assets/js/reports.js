
window.ReportModule = {
  monthRows(year) {
    return U.months.map((name, i) => {
      const month = i + 1;
      const total = PaymentModule.monthTotal(year, month);
      const due = APP.students.filter(s => StudentModule.status(s, year, month) !== "Paid").length;
      return { name, total, due };
    });
  }
};
