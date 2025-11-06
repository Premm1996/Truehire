'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AttendanceRule {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  settings: Record<string, any>;
}

interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'national' | 'company' | 'optional';
  recurring: boolean;
}

interface LeavePolicy {
  leave_type: string;
  annual_allocation: number;
  monthly_accrual: number;
  max_carry_forward: number;
  max_consecutive_days: number;
  notice_period_days: number;
  requires_documentation: boolean;
  is_active: boolean;
}

export default function SettingsPolicies() {
  const [activeTab, setActiveTab] = useState<'rules' | 'holidays' | 'policies' | 'leave' | 'system'>('rules');
  const [rules, setRules] = useState<AttendanceRule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setRules([
        {
          id: 1,
          name: 'Late Check-in Grace Period',
          description: 'Allow employees to check in up to 15 minutes late without penalty',
          enabled: true,
          settings: { gracePeriod: 15, unit: 'minutes' }
        },
        {
          id: 2,
          name: 'Auto Punch Out',
          description: 'Automatically punch out employees at end of workday',
          enabled: true,
          settings: { autoPunchOutTime: '18:00', enabled: true }
        },
        {
          id: 3,
          name: 'Break Time Enforcement',
          description: 'Require minimum break time between shifts',
          enabled: false,
          settings: { minBreakTime: 30, unit: 'minutes' }
        },
        {
          id: 4,
          name: 'Overtime Calculation',
          description: 'Calculate overtime after 8 hours per day',
          enabled: true,
          settings: { overtimeThreshold: 8, rate: 1.5 }
        }
      ]);

      setHolidays([
        { id: 1, name: 'New Year\'s Day', date: '2024-01-01', type: 'national', recurring: true },
        { id: 2, name: 'Christmas Day', date: '2024-12-25', type: 'national', recurring: true },
        { id: 3, name: 'Company Annual Picnic', date: '2024-07-15', type: 'company', recurring: false },
        { id: 4, name: 'Independence Day', date: '2024-07-04', type: 'national', recurring: true }
      ]);

      setLeavePolicies([
        {
          leave_type: 'annual',
          annual_allocation: 12.00,
          monthly_accrual: 1.00,
          max_carry_forward: 6.00,
          max_consecutive_days: 15,
          notice_period_days: 7,
          requires_documentation: false,
          is_active: true
        },
        {
          leave_type: 'sick',
          annual_allocation: 6.00,
          monthly_accrual: 0.50,
          max_carry_forward: 3.00,
          max_consecutive_days: 3,
          notice_period_days: 1,
          requires_documentation: true,
          is_active: true
        },
        {
          leave_type: 'casual',
          annual_allocation: 6.00,
          monthly_accrual: 0.50,
          max_carry_forward: 0.00,
          max_consecutive_days: 3,
          notice_period_days: 1,
          requires_documentation: false,
          is_active: true
        },
        {
          leave_type: 'maternity',
          annual_allocation: 84.00,
          monthly_accrual: 0.00,
          max_carry_forward: 0.00,
          max_consecutive_days: 84,
          notice_period_days: 30,
          requires_documentation: true,
          is_active: true
        },
        {
          leave_type: 'paternity',
          annual_allocation: 5.00,
          monthly_accrual: 0.00,
          max_carry_forward: 0.00,
          max_consecutive_days: 5,
          notice_period_days: 7,
          requires_documentation: true,
          is_active: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: number) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));

    // In real implementation, make API call to update rule
    try {
      await fetch(`/api/admin/attendance/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rules.find(r => r.id === ruleId)?.enabled })
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      // Revert on error
      setRules(prev => prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ));
    }
  };

  const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    try {
      const response = await fetch('/api/admin/attendance/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holiday)
      });

      if (response.ok) {
        const newHoliday = await response.json();
        setHolidays(prev => [...prev, newHoliday]);
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
    }
  };

  const deleteHoliday = async (holidayId: number) => {
    try {
      await fetch(`/api/admin/attendance/holidays/${holidayId}`, {
        method: 'DELETE'
      });
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  const RulesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rules</h3>
            <p className="text-gray-600">Configure automatic attendance policies and rules</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            + Add Rule
          </button>
        </div>

        <div className="space-y-4">
          {rules.map((rule) => (
            <motion.div
              key={rule.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  Settings: {Object.entries(rule.settings).map(([key, value]) => `${key}: ${value}`).join(', ')}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Configure
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const HolidaysTab = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHoliday, setNewHoliday] = useState({
      name: '',
      date: '',
      type: 'company' as 'national' | 'company' | 'optional',
      recurring: false
    });

    const handleAddHoliday = () => {
      if (newHoliday.name && newHoliday.date) {
        addHoliday(newHoliday);
        setNewHoliday({ name: '', date: '', type: 'company', recurring: false });
        setShowAddForm(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Holiday Management</h3>
              <p className="text-gray-600">Manage company holidays and non-working days</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Holiday
            </button>
          </div>

          {showAddForm && (
            <motion.div
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="font-medium text-gray-900 mb-3">Add New Holiday</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Holiday name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="national">National Holiday</option>
                  <option value="company">Company Holiday</option>
                  <option value="optional">Optional Holiday</option>
                </select>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={newHoliday.recurring}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">Recurring annually</label>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleAddHoliday}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Holiday
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">{new Date(holiday.date).toLocaleDateString()}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      holiday.type === 'national' ? 'bg-red-100 text-red-800' :
                      holiday.type === 'company' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {holiday.type}
                    </span>
                    {holiday.recurring && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Recurring
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteHoliday(holiday.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PoliciesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Policies</h3>
        <p className="text-gray-600 mb-6">Define company-wide attendance policies and procedures</p>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900">Work Hours Policy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Standard work hours are 9:00 AM to 6:00 PM, Monday through Friday.
              Flexible working hours are available with manager approval.
            </p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Edit Policy</button>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900">Leave Policy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Employees are entitled to 25 days of annual leave per year.
              Sick leave allowance is 10 days per year.
            </p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Edit Policy</button>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900">Overtime Policy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Overtime is calculated at 1.5x regular rate after 8 hours per day.
              Double time applies for work on holidays.
            </p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Edit Policy</button>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-gray-900">Disciplinary Policy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Three consecutive late arrivals may result in disciplinary action.
              Unauthorized absences require immediate notification.
            </p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">Edit Policy</button>
          </div>
        </div>
      </div>
    </div>
  );

  const LeavePoliciesTab = () => {
    const getLeaveTypeColor = (type: string) => {
      const colors = {
        annual: 'border-green-500',
        sick: 'border-blue-500',
        casual: 'border-yellow-500',
        maternity: 'border-purple-500',
        paternity: 'border-orange-500',
        emergency: 'border-indigo-500'
      };
      return colors[type as keyof typeof colors] || 'border-gray-500';
    };

    const getLeaveTypeDisplayName = (type: string) => {
      return type.charAt(0).toUpperCase() + type.slice(1) + ' Leave';
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Leave Policies</h3>
              <p className="text-gray-600">Manage leave types, entitlements, and approval processes</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              + Add Leave Policy
            </button>
          </div>

          <div className="space-y-6">
            {leavePolicies.map((policy, index) => (
              <motion.div
                key={policy.leave_type}
                className={`border-l-4 ${getLeaveTypeColor(policy.leave_type)} pl-4`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{getLeaveTypeDisplayName(policy.leave_type)}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Annual Allocation:</span> {policy.annual_allocation} days
                  </div>
                  <div>
                    <span className="font-medium">Monthly Accrual:</span> {policy.monthly_accrual} days
                  </div>
                  <div>
                    <span className="font-medium">Max Carry Forward:</span> {policy.max_carry_forward} days
                  </div>
                  <div>
                    <span className="font-medium">Max Consecutive:</span> {policy.max_consecutive_days} days
                  </div>
                  <div>
                    <span className="font-medium">Notice Period:</span> {policy.notice_period_days} days
                  </div>
                  <div>
                    <span className="font-medium">Documentation:</span> {policy.requires_documentation ? 'Required' : 'Not Required'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SystemTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
        <p className="text-gray-600 mb-6">Configure system-wide attendance settings</p>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Time Zone Settings</h4>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+5:30 (IST)</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Email notifications for late check-ins</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">SMS alerts for system downtime</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Push notifications for leave approvals</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Retention</h4>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Keep data for 1 year</option>
              <option>Keep data for 2 years</option>
              <option>Keep data for 5 years</option>
              <option>Keep data indefinitely</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Backup Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Daily automatic backups</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Cloud storage backup</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'rules', label: 'Attendance Rules', icon: '⚙️' },
              { id: 'holidays', label: 'Holidays', icon: '🎄' },
              { id: 'policies', label: 'Policies', icon: '📋' },
              { id: 'leave', label: 'Leave Policies', icon: '📅' },
              { id: 'system', label: 'System', icon: '🖥️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && <RulesTab />}
      {activeTab === 'holidays' && <HolidaysTab />}
      {activeTab === 'policies' && <PoliciesTab />}
      {activeTab === 'leave' && <LeavePoliciesTab />}
      {activeTab === 'system' && <SystemTab />}
    </div>
  );
}
