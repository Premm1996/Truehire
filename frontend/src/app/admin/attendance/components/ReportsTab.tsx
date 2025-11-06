'use client';

import React, { useState } from 'react';

export default function ReportsTab() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [department, setDepartment] = useState('');
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('pdf');

  const reportTypes = [
    { id: 'daily', label: 'Daily Report' },
    { id: 'weekly', label: 'Weekly Report' },
    { id: 'monthly', label: 'Monthly Report' }
  ];

  const formats = [
    { id: 'csv', label: 'CSV' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' }
  ];

  const handleGenerateReport = () => {
    // Implementation for report generation
    console.log('Generating report:', { reportType, dateRange, department, format });
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
            </select>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="flex space-x-4">
            {formats.map(fmt => (
              <label key={fmt.id} className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value={fmt.id}
                  checked={format === fmt.id}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'excel' | 'pdf')}
                  className="mr-2"
                />
                {fmt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerateReport}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Generate & Download Report
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Monthly Attendance Report - October 2024</div>
              <div className="text-sm text-gray-600">Generated on Oct 31, 2024 • PDF • 2.3 MB</div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Weekly Attendance Report - Week 43</div>
              <div className="text-sm text-gray-600">Generated on Oct 27, 2024 • Excel • 1.8 MB</div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Daily Attendance Report - Oct 25, 2024</div>
              <div className="text-sm text-gray-600">Generated on Oct 25, 2024 • CSV • 456 KB</div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
          </div>
        </div>
      </div>

      {/* Auto Reports */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Auto Reports</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Monthly Summary Email</div>
              <div className="text-sm text-gray-600">Sent to managers on the 1st of each month</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              <button className="text-gray-600 hover:text-gray-800">Configure</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Weekly Department Reports</div>
              <div className="text-sm text-gray-600">Sent to department heads every Friday</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              <button className="text-gray-600 hover:text-gray-800">Configure</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Daily Late Arrivals Alert</div>
              <div className="text-sm text-gray-600">Sent to HR when employees arrive late</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
              <button className="text-gray-600 hover:text-gray-800">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
