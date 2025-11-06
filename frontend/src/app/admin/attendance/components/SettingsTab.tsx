'use client';

import React, { useState, useEffect } from 'react';

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

export default function SettingsTab() {
  const [activeSection, setActiveSection] = useState<'holidays' | 'leave' | 'auto-punch' | 'thresholds'>('holidays');
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: 'holidays', label: 'Holiday Management', icon: '🎉' },
    { id: 'leave', label: 'Leave Management', icon: '🏖️' },
    { id: 'auto-punch', label: 'Auto Punch Rules', icon: '⏰' },
    { id: 'thresholds', label: 'Threshold Configuration', icon: '⚙️' }
  ];

  useEffect(() => {
    if (activeSection === 'leave') {
      fetchLeavePolicies();
    }
  }, [activeSection]);

  const fetchLeavePolicies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/attendance/leave-policies');
      if (response.ok) {
        const data = await response.json();
        setLeavePolicies(data);
      }
    } catch (error) {
      console.error('Error fetching leave policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLeavePolicies = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/attendance/leave-policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leavePolicies),
      });

      if (response.ok) {
        alert('Leave policies updated successfully!');
      } else {
        alert('Failed to update leave policies');
      }
    } catch (error) {
      console.error('Error updating leave policies:', error);
      alert('Error updating leave policies');
    } finally {
      setSaving(false);
    }
  };

  const handlePolicyChange = (index: number, field: keyof LeavePolicy, value: string | number | boolean) => {
    const updatedPolicies = [...leavePolicies];
    updatedPolicies[index] = { ...updatedPolicies[index], [field]: value };
    setLeavePolicies(updatedPolicies);
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as 'holidays' | 'leave' | 'auto-punch' | 'thresholds')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {activeSection === 'holidays' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Holiday Management</h2>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Add Holiday
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">New Year's Day</div>
                  <div className="text-sm text-gray-600">January 1, 2025</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Republic Day</div>
                  <div className="text-sm text-gray-600">January 26, 2025</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Holi</div>
                  <div className="text-sm text-gray-600">March 14, 2025</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'leave' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Leave Policies</h2>
              <button
                onClick={handleSaveLeavePolicies}
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading leave policies...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {leavePolicies.map((policy, index) => (
                    <div key={policy.leave_type} className="p-6 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                        {policy.leave_type} Leave Policy
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Annual Allocation (days)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={policy.annual_allocation}
                            onChange={(e) => handlePolicyChange(index, 'annual_allocation', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Accrual (days)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={policy.monthly_accrual}
                            onChange={(e) => handlePolicyChange(index, 'monthly_accrual', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Carry Forward (days)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={policy.max_carry_forward}
                            onChange={(e) => handlePolicyChange(index, 'max_carry_forward', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Consecutive Days
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={policy.max_consecutive_days}
                            onChange={(e) => handlePolicyChange(index, 'max_consecutive_days', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notice Period (days)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={policy.notice_period_days}
                            onChange={(e) => handlePolicyChange(index, 'notice_period_days', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`requires-doc-${index}`}
                            checked={policy.requires_documentation}
                            onChange={(e) => handlePolicyChange(index, 'requires_documentation', e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor={`requires-doc-${index}`} className="text-sm font-medium text-gray-700">
                            Requires Documentation
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`is-active-${index}`}
                            checked={policy.is_active}
                            onChange={(e) => handlePolicyChange(index, 'is_active', e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor={`is-active-${index}`} className="text-sm font-medium text-gray-700">
                            Active Policy
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>Annual Allocation:</strong> {policy.annual_allocation} days per year
                          <br />
                          <strong>Monthly Accrual:</strong> {policy.monthly_accrual} days per month
                          <br />
                          <strong>Max Carry Forward:</strong> {policy.max_carry_forward} days can be carried to next year
                          <br />
                          <strong>Max Consecutive:</strong> {policy.max_consecutive_days} days
                          <br />
                          <strong>Notice Period:</strong> {policy.notice_period_days} days
                          <br />
                          <strong>Documentation Required:</strong> {policy.requires_documentation ? 'Yes' : 'No'}
                          <br />
                          <strong>Active:</strong> {policy.is_active ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Policy Explanations</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Annual Allocation: Number of leave days allocated per year for each employee</li>
                    <li>• Monthly Accrual: Number of leave days accrued per month</li>
                    <li>• Max Carry Forward: Maximum number of unused leave days that can be carried to the next year</li>
                    <li>• Max Consecutive Days: Maximum number of consecutive leave days allowed</li>
                    <li>• Notice Period: Minimum days notice required before leave start date</li>
                    <li>• Requires Documentation: Whether supporting documents are required for this leave type</li>
                    <li>• Active Policy: Whether this leave policy is currently active</li>
                    <li>• Changes will affect all employees' leave balances for future years</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'auto-punch' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Auto Punch Rules</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office Start Time</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office End Time</label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (minutes)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Punch Out After (hours)</label>
                  <input
                    type="number"
                    defaultValue="9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" id="auto-punch" defaultChecked className="rounded" />
                <label htmlFor="auto-punch" className="text-sm font-medium text-gray-700">
                  Enable automatic punch out at end of day
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" id="late-alerts" className="rounded" />
                <label htmlFor="late-alerts" className="text-sm font-medium text-gray-700">
                  Send alerts for late arrivals
                </label>
              </div>

              <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}

        {activeSection === 'thresholds' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Threshold Configuration</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Day Threshold (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Half Day Threshold (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Threshold (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue="9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Arrival Threshold (minutes)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Threshold Explanations</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Full Day: Minimum hours required for a full working day</li>
                  <li>• Half Day: Hours that count as half day attendance</li>
                  <li>• Overtime: Hours after which overtime calculation begins</li>
                  <li>• Late Arrival: Minutes after start time to be considered late</li>
                </ul>
              </div>

              <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Save Thresholds
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
