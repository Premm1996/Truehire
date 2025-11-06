const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function grantAdminAccess() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Tbdam@583225',
        database: process.env.DB_NAME || 'hireconnect_portal'
    });

    try {
        const email = 'employer@gmail.com';
        const password = 'Employer@123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const [existingUser] = await connection.execute(
            'SELECT id, email, role, is_admin FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            // Update existing user
            await connection.execute(
                'UPDATE users SET role = ?, is_admin = TRUE, isVerified = TRUE, updatedAt = NOW() WHERE email = ?',
                ['employer', email]
            );
            console.log(`✅ Updated existing user ${email} with admin and employer access`);
        } else {
            // Create new user
            await connection.execute(
                `INSERT INTO users (fullName, email, password, mobile, role, is_admin, termsAgreed, isVerified, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, TRUE, TRUE, TRUE, NOW(), NOW())`,
                ['Employer Admin', email, hashedPassword, '9999999999', 'employer']
            );
            console.log(`✅ Created new user ${email} with admin and employer access`);
        }

        // Verify the update
        const [updatedUser] = await connection.execute(
            'SELECT id, fullName, email, role, is_admin, isVerified FROM users WHERE email = ?',
            [email]
        );

        console.log('User details:', updatedUser[0]);

        // Log the access grant
        if (updatedUser.length > 0) {
            await connection.execute(
                'INSERT INTO account_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())',
                [updatedUser[0].id, 'account_updated', 'Granted admin and employer access']
            );
        }

        console.log('✅ Successfully granted admin and employer access to employer@gmail.com');
        console.log('📧 Email: employer@gmail.com');
        console.log('🔑 Default Password: Employer@123');
        console.log('🎯 Role: employer');
        console.log('👑 Admin: true');

    } catch (error) {
        console.error('❌ Error granting admin access:', error);
    } finally {
        await connection.end();
    }
}

// Execute the function
grantAdminAccess();
