const db = require('./db-fixed');

async function checkOnboardingStatus() {
  try {
    console.log('Checking onboarding status for all users...');

    const [rows] = await db.query(
      'SELECT id, email, onboarding_step, onboarding_status, role, is_admin FROM users ORDER BY id'
    );

    console.log('Users onboarding status:');
    console.log('ID | Email | Step | Status | Role | Is Admin');
    console.log('---|-------|------|--------|------|---------');

    rows.forEach(user => {
      console.log(`${user.id} | ${user.email} | ${user.onboarding_step || 0} | ${user.onboarding_status || 'NULL'} | ${user.role} | ${user.is_admin}`);
    });

    // Check for users with potential issues
    const problematicUsers = rows.filter(user =>
      !user.onboarding_status ||
      user.onboarding_status === 'NULL' ||
      user.onboarding_step === null ||
      user.onboarding_step === undefined
    );

    if (problematicUsers.length > 0) {
      console.log('\n⚠️  Users with potential onboarding issues:');
      problematicUsers.forEach(user => {
        console.log(`- User ${user.id} (${user.email}): step=${user.onboarding_step}, status=${user.onboarding_status}`);
      });
    } else {
      console.log('\n✅ All users have valid onboarding status and step values.');
    }

  } catch (error) {
    console.error('Error checking onboarding status:', error);
  } finally {
    process.exit(0);
  }
}

checkOnboardingStatus();
