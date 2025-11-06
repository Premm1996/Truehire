const { pool } = require('./db');

async function populateSampleData() {
  try {
    const userId = 4;

    // Insert sample attendance records for user 4 (last 3 months)
    const months = ['2024-01', '2024-02', '2024-03'];
    for (const month of months) {
      for (let day = 1; day <= 28; day++) {
        const date = `${month}-${day.toString().padStart(2, '0')}`;
        const punchIn = `2024-01-${day.toString().padStart(2, '0')} 09:00:00`; // Example times
        const punchOut = `2024-01-${day.toString().padStart(2, '0')} 18:00:00`;
        const totalHours = 9.0;
        const status = day % 7 === 0 || day % 7 === 6 ? 'week-off' : 'present'; // Weekends off

        // Check if record exists
        const [existing] = await pool.query(
          'SELECT id FROM attendance_records WHERE user_id = ? AND date = ?',
          [userId, date]
        );

        if (existing.length === 0) {
          await pool.query(
            'INSERT INTO attendance_records (user_id, date, punch_in_time, punch_out_time, total_hours, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, date, punchIn, punchOut, totalHours, status]
          );
          console.log(`Inserted attendance record for ${date}`);
        }
      }
    }

    // Insert sample payroll history for user 4 (last 3 months)
    const payrollMonths = ['2024-01', '2024-02', '2024-03'];
    for (const payrollMonth of payrollMonths) {
      const grossSalary = 50000;
      const netSalary = 45000;
      const deductions = 5000;
      const payDate = `${payrollMonth}-15`;

      // Check if record exists
      const [existingPayroll] = await pool.query(
        'SELECT id FROM payroll_history WHERE user_id = ? AND payroll_month = ?',
        [userId, payrollMonth]
      );

      if (existingPayroll.length === 0) {
        await pool.query(
          'INSERT INTO payroll_history (user_id, payroll_month, gross_salary, net_salary, deductions, pay_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, payrollMonth, grossSalary, netSalary, deductions, payDate, 'paid']
        );
        console.log(`Inserted payroll record for ${payrollMonth}`);
      }
    }

    console.log('Sample data populated successfully for user 4.');
  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    pool.end();
  }
}

populateSampleData();
