#!/usr/bin/env node

/**
 * Production Migration Runner
 * Runs all necessary database migrations for production deployment
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

async function runMigrations() {
    let connection;

    try {
        console.log('🚀 Starting production database migrations...');

        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✅ Connected to database');

        // Migration files in order
        const migrations = [
            'backend/migrations/create-attendance-tables.sql',
            'backend/migrations/create-leave-balances-table.sql',
            'backend/migrations/create-leave-policies-table.sql',
            'backend/migrations/create-only-timesheet-tasks.sql',
            'backend/migrations/create-payroll-history-table.sql',
            'backend/migrations/create-reimbursements-table.sql',
            'backend/migrations/create-salary-structures-table.sql',
            'backend/migrations/create-tax-declarations-table.sql',
            'backend/migrations/notifications_table.sql',
            'backend/migrations/add-attendance-indexes.sql',
            'backend/migrations/add-candidate-role.sql',
            'backend/migrations/add-employee-approval-field.sql',
            'backend/migrations/add-employee-profile-fields.sql',
            'backend/migrations/add-location-fields.sql',
            'backend/migrations/add-plain-password-field.sql',
            'backend/migrations/add-profile-fields.sql',
            'backend/migrations/alter-attendance-breaks-table.sql',
            'backend/migrations/alter-payroll-history-table.sql',
            'backend/migrations/fix-attendance-breaks-column-names.sql',
            'backend/migrations/fix-attendance-breaks-columns.sql',
            'backend/migrations/fix-role-enum.sql'
        ];

        // Run each migration
        for (const migration of migrations) {
            const migrationPath = path.join(__dirname, migration);

            if (fs.existsSync(migrationPath)) {
                console.log(`📄 Running migration: ${migration}`);

                const sql = fs.readFileSync(migrationPath, 'utf8');

                // Split by semicolon and execute each statement
                const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

                for (const statement of statements) {
                    if (statement.trim()) {
                        try {
                            await connection.execute(statement);
                        } catch (error) {
                            // Ignore duplicate key/table errors in production
                            if (!error.message.includes('already exists') &&
                                !error.message.includes('Duplicate entry') &&
                                !error.message.includes('Duplicate key name')) {
                                console.warn(`⚠️  Warning in ${migration}: ${error.message}`);
                            }
                        }
                    }
                }

                console.log(`✅ Completed: ${migration}`);
            } else {
                console.warn(`⚠️  Migration file not found: ${migration}`);
            }
        }

        // Run database initialization if needed
        const initScriptPath = path.join(__dirname, 'backend/database/init-db-fixed.sql');
        if (fs.existsSync(initScriptPath)) {
            console.log('📄 Running database initialization...');

            const initSql = fs.readFileSync(initScriptPath, 'utf8');
            const initStatements = initSql.split(';').filter(stmt => stmt.trim().length > 0);

            for (const statement of initStatements) {
                if (statement.trim()) {
                    try {
                        await connection.execute(statement);
                    } catch (error) {
                        // Ignore errors for existing data
                        if (!error.message.includes('Duplicate entry')) {
                            console.warn(`⚠️  Warning in init script: ${error.message}`);
                        }
                    }
                }
            }

            console.log('✅ Database initialization completed');
        }

        console.log('🎉 All migrations completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Check if environment variables are set
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('❌ Database environment variables not set. Please configure .env.production file.');
    process.exit(1);
}

runMigrations();
