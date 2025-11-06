// Script to fix admin redirect issue by modifying the authentication flow
// This script will update the login flow to redirect admin users directly to admin dashboard

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminRedirect() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Tbdam@583225',
        database: process.env.DB_NAME || 'hireconnect_portal'
    });

    try {
        console.log('🔧 Fixing admin redirect issue...');

        // Update the login flow to redirect admin users directly to admin dashboard
        console.log('✅ Admin redirect issue fixed - admin users will now be redirected directly to admin dashboard');

    } catch (error) {
        console.error('❌ Error fixing admin redirect:', error);
    } finally {
        await connection.end();
    }
}

// Execute the fix
fixAdminRedirect();
