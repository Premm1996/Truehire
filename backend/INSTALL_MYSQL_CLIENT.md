# Installing MySQL Client on Windows

To run the MySQL schema script and manage your MySQL database, you need the MySQL client installed and available in your system PATH.

## Steps to Install MySQL Client on Windows

1. Download MySQL Installer from the official site:
   https://dev.mysql.com/downloads/installer/

2. Run the installer and select "Custom" installation.

3. In the product selection, choose "MySQL Server" and "MySQL Shell" or "MySQL Command Line Client".

4. Complete the installation.

5. Add MySQL `bin` directory to your system PATH environment variable:
   - Usually located at `C:\Program Files\MySQL\MySQL Server X.Y\bin`
   - Add this path to the PATH variable in System Environment Variables.

6. Open a new Command Prompt and verify installation:
   ```
   mysql --version
   ```

7. Run the schema script:
   ```
   mysql -u root -p < path\to\complete-updated-mysql-script-updated.sql
   ```

## Alternative: Use MySQL Workbench or other GUI tools to run the SQL script.

---

If you want, I can guide you through these steps interactively or help with alternative database setup options.
