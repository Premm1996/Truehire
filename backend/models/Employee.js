const db = require('../db');

class Employee {
  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ? AND u.role IN ('employee', 'admin')
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(query) {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin') AND ?
      `, [query]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin')
        ORDER BY u.createdAt DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      const [result] = await db.query('INSERT INTO users SET ?', {
        fullName: employeeData.fullName,
        email: employeeData.email,
        password: employeeData.password,
        plain_password: employeeData.plain_password,
        mobile: employeeData.mobile,
        position: employeeData.position,
        department: employeeData.department,
        role: employeeData.role || 'employee',
        is_admin: employeeData.is_admin || false,
        status: employeeData.status || 'active',
        onboarding_step: employeeData.onboarding_step || 0,
        onboarding_status: employeeData.onboarding_status || 'NOT_STARTED',
        approved: employeeData.approved || 1,
        createdAt: employeeData.createdAt || new Date(),
        updatedAt: employeeData.updatedAt || new Date()
      });
      const userId = result.insertId;

      // Insert into employee_profiles table
      await db.query('INSERT INTO employee_profiles SET ?', {
        user_id: userId,
        fullName: employeeData.fullName,
        email: employeeData.email,
        mobile: employeeData.mobile,
        dob: employeeData.dob,
        gender: employeeData.gender,
        skills: employeeData.skills,
        languages: employeeData.languages,
        position: employeeData.position,
        department: employeeData.department,
        experience: employeeData.experience,
        qualification: employeeData.qualification,
        expectedSalary: employeeData.expectedSalary,
        location: employeeData.location,
        noticePeriod: employeeData.noticePeriod,
        resume: employeeData.resume,
        interviewStatus: employeeData.interviewStatus || 'completed',
        selectionStatus: employeeData.selectionStatus || 'selected',
        created_at: new Date(),
        updated_at: new Date()
      });

      return { id: userId, ...employeeData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Update users table
        const userFields = [
          'fullName', 'email', 'password', 'plain_password', 'mobile', 'phone',
          'position', 'department', 'termsAgreed', 'companyName', 'profile',
          'isVerified', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire',
          'lastLogin', 'status', 'onboarding_step', 'onboarding_status', 'approved',
          'offer_letter_uploaded', 'offer_letter_url', 'id_card_generated',
          'last_step_completed_at', 'updatedAt'
        ];

        const userUpdateData = {};
        const profileUpdateData = {};

        Object.keys(updateData).forEach(key => {
          if (userFields.includes(key)) {
            userUpdateData[key] = updateData[key];
          } else {
            profileUpdateData[key] = updateData[key];
          }
        });

        if (Object.keys(userUpdateData).length > 0) {
          await connection.query('UPDATE users SET ? WHERE id = ?', [userUpdateData, id]);
        }

        if (Object.keys(profileUpdateData).length > 0) {
          await connection.query('UPDATE employee_profiles SET ? WHERE user_id = ?', [profileUpdateData, id]);
        }

        await connection.commit();
        return true;

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Delete from employee_profiles first (due to foreign key)
        await connection.query('DELETE FROM employee_profiles WHERE user_id = ?', [id]);

        // Delete from users table
        const [result] = await connection.query('DELETE FROM users WHERE id = ? AND role IN (?, ?)', [id, 'employee', 'admin']);

        await connection.commit();
        return result.affectedRows > 0;

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.email = ? AND u.role IN ('employee', 'admin')
      `, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByDepartment(department) {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin') AND u.department = ?
        ORDER BY u.fullName
      `, [department]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByManager(managerId) {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin') AND ep.managerId = ?
        ORDER BY u.fullName
      `, [managerId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateOnboardingStatus(id, status, step) {
    try {
      await db.query(
        'UPDATE users SET onboarding_status = ?, onboarding_step = ?, last_step_completed_at = NOW() WHERE id = ? AND role IN (?, ?)',
        [status, step, id, 'employee', 'admin']
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getActiveEmployees() {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin') AND u.approved = 1 AND u.status = 'active'
        ORDER BY u.fullName
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingApprovals() {
    try {
      const [rows] = await db.query(`
        SELECT u.*, ep.*,
               u.id as user_id,
               ep.id as profile_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('employee', 'admin') AND u.approved = 0
        ORDER BY u.createdAt DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async approveEmployee(id, approvedBy) {
    try {
      await db.query(
        'UPDATE users SET approved = 1, status = "active" WHERE id = ? AND role IN (?, ?)',
        [id, 'employee', 'admin']
      );

      // Log the approval - check if admin_id exists in audit_logs table
      try {
        await db.query(
          'INSERT INTO audit_logs (user_id, admin_id, action, entity_type, entity_id, details) VALUES (?, ?, "approve_employee", "employee", ?, "Employee approved")',
          [id, approvedBy, id]
        );
      } catch (auditError) {
        // If audit log fails, continue without failing the approval
        console.warn('Audit log failed:', auditError.message);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async deactivateEmployee(id, deactivatedBy, reason) {
    try {
      await db.query(
        'UPDATE users SET status = "inactive" WHERE id = ? AND role IN (?, ?)',
        [id, 'employee', 'admin']
      );

      // Log the deactivation
      await db.query(
        'INSERT INTO audit_logs (user_id, admin_id, action, entity_type, entity_id, details) VALUES (?, ?, "deactivate_employee", "employee", ?, ?)',
        [id, deactivatedBy, id, reason]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Employee;
