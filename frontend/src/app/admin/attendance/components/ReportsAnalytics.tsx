'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ReportData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHours: number;
  attendanceRate: number;
  departmentStats: Array<{
    department: string;
    present: number;
    total: number;
    rate: number;
  }>;
}

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'custom' | 'automated' | 'export'>('overview');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedDepartments, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setReportData({
        totalEmployees: 150,
        presentToday: 142,
        absentToday: 5,
        lateToday: 3,
        averageHours: 8.2,
        attendanceRate: 94.7,
        departmentStats: [
          { department: 'Engineering', present: 45, total: 50, rate: 90 },
          { department: 'Marketing', present: 18, total: 20, rate: 90 },
          { department: 'Sales', present: 25, total: 28, rate: 89.3 },
          { department: 'HR', present: 12, total: 15, rate: 80 },
          { department: 'Finance', present: 22, total: 25, rate: 88 }
        ]
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/admin/attendance/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          dateRange,
          departments: selectedDepartments,
          format: 'pdf'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{reportData?.presentToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((reportData?.presentToday || 0) / (reportData?.totalEmployees || 1) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-red-600">{reportData?.absentToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((reportData?.absentToday || 0) / (reportData?.totalEmployees || 1) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">✗</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData?.lateToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((reportData?.lateToday || 0) / (reportData?.totalEmployees || 1) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Hours</p>
              <p className="text-2xl font-bold text-blue-600">{reportData?.averageHours?.toFixed(1)}h</p>
              <p className="text-xs text-gray-500 mt-1">Daily average</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">🕐</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Department-wise Attendance */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Attendance</h3>
        <div className="space-y-4">
          {reportData?.departmentStats.map((dept, index) => (
            <div key={dept.department} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                  <span className="text-sm text-gray-600">{dept.present}/{dept.total} ({dept.rate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attendance Trend Chart Placeholder */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend (Last 30 Days)</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">Chart visualization would be implemented here</p>
            <p className="text-sm text-gray-500 mt-1">Using Chart.js or similar library</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const CustomReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Custom Report</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Departments (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'].map(dept => (
              <label key={dept} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDepartments(prev => [...prev, dept]);
                    } else {
                      setSelectedDepartments(prev => prev.filter(d => d !== dept));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => generateReport('attendance')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Attendance Report
          </button>
          <button
            onClick={() => generateReport('leave')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Generate Leave Report
          </button>
          <button
            onClick={() => generateReport('overtime')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Generate Overtime Report
          </button>
        </div>
      </div>
    </div>
  );

  const AutomatedReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Reports</h3>
        <p className="text-gray-600 mb-6">Set up automatic report generation and delivery</p>

        <div className="space-y-4">
          {[
            { name: 'Daily Attendance Summary', schedule: 'Daily at 6:00 PM', recipients: 'HR Team' },
            { name: 'Weekly Department Report', schedule: 'Weekly on Monday', recipients: 'Department Heads' },
            { name: 'Monthly Compliance Report', schedule: 'Monthly on 1st', recipients: 'Management' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-600">{report.schedule} • {report.recipients}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Edit</span>
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            + Create New Automated Report
          </button>
        </div>
      </div>
    </div>
  );

  const ExportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <p className="text-gray-600 mb-6">Export attendance data in various formats</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quick Exports</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                📊 Today's Attendance (CSV)
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                📅 This Month's Data (Excel)
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                👥 Employee List (PDF)
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Advanced Exports</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                📈 Analytics Report (PDF)
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                🔔 Leave Requests (Excel)
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                ⏰ Overtime Records (CSV)
              </button>
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
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'custom', label: 'Custom Reports', icon: '🔧' },
              { id: 'automated', label: 'Automated', icon: '🤖' },
              { id: 'export', label: 'Export', icon: '📤' }
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
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'custom' && <CustomReportsTab />}
      {activeTab === 'automated' && <AutomatedReportsTab />}
      {activeTab === 'export' && <ExportTab />}
    </div>
  );
}
