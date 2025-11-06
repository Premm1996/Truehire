# TODO: Fix MySQL Promise Error in Login

## Steps:

- [x] Edit `backend/routes/auth.js`: Change the import from `const { pool } = require('../db-fixed');` to `const pool = require('../db-fixed');`
- [x] Edit `backend/middleware/auth.js`: Change the import from `const { pool } = require('../db-fixed');` to `const pool = require('../db-fixed');`
- [x] Edit `backend/routes/employees-profile.js`: Change the import from `const { pool } = require('../db-fixed');` to `const pool = require('../db-fixed');`
- [ ] Test the login endpoint to confirm the fix (manual testing by user)

## Notes:
- This fixes the destructuring issue where `pool` was undefined, causing the promise error on queries.
- After all edits, restart the backend server if necessary.
