'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import RealTimeDashboard from './components/RealTimeDashboard';
import EmployeeLiveList from './components/EmployeeLiveList';
import EmployeeManagement from './components/EmployeeManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import SettingsPolicies from './components/SettingsPolicies';

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live-list' | 'management' | 'reports' | 'settings'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Real-time Dashboard', icon: '📊' },
    { id: 'live-list', label: 'Employee Live List', icon: '👥' },
    { id: 'management', label: 'Employee Management', icon: '⚙️' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📋' },
    { id: 'settings', label: 'Settings & Policies', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Attendance Management</h1>
          <p className="text-gray-600">Comprehensive real-time attendance monitoring and management system</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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
        <div className="space-y-6">
          {activeTab === 'dashboard' && <RealTimeDashboard />}
          {activeTab === 'live-list' && <EmployeeLiveList />}
          {activeTab === 'management' && <EmployeeManagement />}
          {activeTab === 'reports' && <ReportsAnalytics />}
          {activeTab === 'settings' && <SettingsPolicies />}
        </div>
      </div>
    </div>
  );
}
