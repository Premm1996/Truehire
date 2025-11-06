const { pool } = require('./db');

async function fixPhotoPaths() {
  try {
    console.log('Fixing photo paths in database...');

    // Update employee_profiles table
    const [profileResult] = await pool.query(`
      UPDATE employee_profiles 
      SET photo = CONCAT('/uploads/passport-photos/', SUBSTRING_INDEX(photo, '/', -1))
      WHERE photo IS NOT NULL 
      AND photo NOT LIKE '/uploads/passport-photos/%'`
    );
    console.log(`Updated ${profileResult.affectedRows} rows in employee_profiles`);

    // Update documents table
    const [docResult] = await pool.query(`
      UPDATE documents 
      SET file_path = CONCAT('/uploads/passport-photos/', SUBSTRING_INDEX(file_path, '/', -1))
      WHERE document_type = 'passport_photo' 
      AND file_path NOT LIKE '/uploads/passport-photos/%'`
    );
    console.log(`Updated ${docResult.affectedRows} rows in documents`);

    console.log('Photo paths fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing photo paths:', error);
    process.exit(1);
  }
}

fixPhotoPaths();
