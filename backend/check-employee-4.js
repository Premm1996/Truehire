const db = require('./db');

db.get('SELECT id, email, fullName, role, is_admin, status FROM users WHERE id = 4', (err, row) => {
  if (err) {
    console.error('Error fetching user:', err);
  } else {
    console.log('User:', row);
  }

  db.get('SELECT * FROM employee_profiles WHERE user_id = 4', (err, row) => {
    if (err) {
      console.error('Error fetching profile:', err);
    } else {
      console.log('Profile:', row);
    }

    db.close();
  });
});
