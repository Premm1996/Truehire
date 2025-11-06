'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday' | 'weekend';
  punchInTime?: string;
  punchOutTime?: string;
  totalHours?: number;
  breakDuration?: number;
}

export default function EmployeeDetailTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'current-day' | 'current-month' | 'previous-month' | 'calendar'>('current-day');
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<AttendanceDay | null>(null);

  // Modal states
  const [showEditPunchModal, setShowEditPunchModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showApproveCorrectionsModal, setShowApproveCorrectionsModal] = useState(false);
  const [showResetAttendanceModal, setShowResetAttendanceModal] = useState(false);

  // Form states
  const [editPunchForm, setEditPunchForm] = useState({
    date: '',
    punchInTime: '',
    punchOutTime: '',
    reason: ''
  });
  const [applyLeaveForm, setApplyLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'annual',
    reason: ''
  });
  const [corrections, setCorrections] = useState<any[]>([]);
  const [resetDate, setResetDate] = useState('');

  const subTabs = [
    { id: 'current-day', label: 'Current Day' },
    { id: 'current-month', label: 'Current Month' },
    { id: 'previous-month', label: 'Previous Month' },
    { id: 'calendar', label: 'Calendar View' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee && activeSubTab === 'calendar') {
      fetchCalendarData();
    }
  }, [selectedEmployee, activeSubTab, currentDate]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCalendarData = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await axios.get(`/api/attendance/calendar/${selectedEmployee}/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500 text-white';
      case 'absent': return 'bg-red-500 text-white';
      case 'half_day': return 'bg-yellow-500 text-white';
      case 'leave': return 'bg-blue-500 text-white';
      case 'holiday': return 'bg-purple-500 text-white';
      case 'weekend': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'half_day': return '⏳';
      case 'leave': return '🏖️';
      case 'holiday': return '🎉';
      case 'weekend': return '🏠';
      default: return '';
    }
  };

  const getDaysInMonth = (date: Date): (AttendanceDay | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (AttendanceDay | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = attendanceData.find(a => a.date === dateStr);
      days.push(attendance || { date: dateStr, status: 'absent' });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return '--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Admin action handlers
  const handleApplyLeave = () => {
    setShowApplyLeaveModal(true);
  };

  const handleEditPunchTimes = () => {
    if (selectedDate) {
      setEditPunchForm({
        date: selectedDate.date,
        punchInTime: selectedDate.punchInTime || '',
        punchOutTime: selectedDate.punchOutTime || '',
        reason: ''
      });
    }
    setShowEditPunchModal(true);
  };

  const handleApproveCorrections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/attendance/corrections/${selectedEmployee}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorrections(response.data.corrections || []);
      setShowApproveCorrectionsModal(true);
    } catch (error) {
      console.error('Error fetching corrections:', error);
      alert('Failed to fetch corrections');
    }
  };

  const handleResetAttendance = () => {
    if (selectedDate) {
      setResetDate(selectedDate.date);
    }
    setShowResetAttendanceModal(true);
  };

  // Form submission handlers
  const submitEditPunch = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/attendance/override', {
        employeeId: selectedEmployee,
        ...editPunchForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Punch times updated successfully');
      setShowEditPunchModal(false);
      fetchCalendarData(); // Refresh data
    } catch (error) {
      console.error('Error updating punch times:', error);
      alert('Failed to update punch times');
    }
  };

  const submitApplyLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/attendance/apply-leave', {
        employeeId: selectedEmployee,
        ...applyLeaveForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave applied successfully');
      setShowApplyLeaveModal(false);
      fetchCalendarData(); // Refresh data
    } catch (error) {
      console.error('Error applying leave:', error);
      alert('Failed to apply leave');
    }
  };

  const submitApproveCorrection = async (correctionId: string, approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/attendance/process-correction', {
        correctionId,
        approved
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(approved ? 'Correction approved' : 'Correction rejected');
      handleApproveCorrections(); // Refresh corrections
    } catch (error) {
      console.error('Error processing correction:', error);
      alert('Failed to process correction');
    }
  };

  const submitResetAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/attendance/reset', {
        employeeId: selectedEmployee,
        date: resetDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Attendance reset successfully');
      setShowResetAttendanceModal(false);
      fetchCalendarData(); // Refresh data
    } catch (error) {
      console.error('Error resetting attendance:', error);
      alert('Failed to reset attendance');
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Employee Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Employee</h2>
        <select
          value={selectedEmployee || ''}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose an employee...</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.department}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <>
          {/* Sub-tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {subTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as 'current-day' | 'current-month' | 'previous-month' | 'calendar')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeSubTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content based on sub-tab */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {activeSubTab === 'current-day' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Day Attendance</h3>
                <p className="text-gray-600">Current day attendance details will be displayed here.</p>
              </div>
            )}

            {activeSubTab === 'current-month' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Month Summary</h3>
                <p className="text-gray-600">Current month attendance summary and calendar will be displayed here.</p>
              </div>
            )}

            {activeSubTab === 'previous-month' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Previous Month Summary</h3>
                <p className="text-gray-600">Previous month attendance summary will be displayed here.</p>
              </div>
            )}

            {activeSubTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Calendar</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      ←
                    </button>
                    <h4 className="text-md font-medium text-gray-900">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Present</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Absent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Half Day</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Leave</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm">Holiday</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-sm">Weekend</span>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-6">
                      {/* Week day headers */}
                      {weekDays.map(day => (
                        <div key={day} className="p-3 text-center font-medium text-gray-700 bg-gray-100 rounded-md">
                          {day}
                        </div>
                      ))}

                      {/* Calendar days */}
                      {days.map((day, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.01 }}
                          className={`min-h-[80px] p-2 border rounded-md cursor-pointer hover:shadow-md transition-all ${
                            day ? getStatusColor(day.status) : 'bg-gray-50'
                          }`}
                          onClick={() => day && setSelectedDate(day)}
                        >
                          {day && (
                            <>
                              <div className="text-sm font-medium mb-1">
                                {new Date(day.date).getDate()}
                              </div>
                              <div className="text-xs">
                                {getStatusIcon(day.status)}
                              </div>
                              {day.totalHours && (
                                <div className="text-xs mt-1 opacity-75">
                                  {formatDuration(day.totalHours)}
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Selected Date Details */}
                    {selectedDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-blue-900">
                            {new Date(selectedDate.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <button
                            onClick={() => setSelectedDate(null)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-blue-600 font-medium">Status</div>
                            <div className="text-lg font-semibold text-blue-900 capitalize">
                              {selectedDate.status.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-blue-600 font-medium">Clock In</div>
                            <div className="text-lg font-semibold text-blue-900">
                              {formatTime(selectedDate.punchInTime)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-blue-600 font-medium">Clock Out</div>
                            <div className="text-lg font-semibold text-blue-900">
                              {formatTime(selectedDate.punchOutTime)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-blue-600 font-medium">Total Hours</div>
                            <div className="text-lg font-semibold text-blue-900">
                              {formatDuration(selectedDate.totalHours)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleApplyLeave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply Leave
              </button>
              <button
                onClick={handleEditPunchTimes}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Edit Punch Times
              </button>
              <button
                onClick={handleApproveCorrections}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Approve Corrections
              </button>
              <button
                onClick={handleResetAttendance}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Reset Attendance
              </button>
            </div>
          </div>

          {/* Modals */}
          {/* Edit Punch Times Modal */}
          {showEditPunchModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Edit Punch Times</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={editPunchForm.date}
                      onChange={(e) => setEditPunchForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punch In Time</label>
                    <input
                      type="time"
                      value={editPunchForm.punchInTime}
                      onChange={(e) => setEditPunchForm(prev => ({ ...prev, punchInTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punch Out Time</label>
                    <input
                      type="time"
                      value={editPunchForm.punchOutTime}
                      onChange={(e) => setEditPunchForm(prev => ({ ...prev, punchOutTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={editPunchForm.reason}
                      onChange={(e) => setEditPunchForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Reason for override..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditPunchModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEditPunch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Apply Leave Modal */}
          {showApplyLeaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Apply Leave</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={applyLeaveForm.startDate}
                      onChange={(e) => setApplyLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={applyLeaveForm.endDate}
                      onChange={(e) => setApplyLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={applyLeaveForm.leaveType}
                      onChange={(e) => setApplyLeaveForm(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="maternity">Maternity Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={applyLeaveForm.reason}
                      onChange={(e) => setApplyLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Reason for leave..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowApplyLeaveModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplyLeave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply Leave
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Approve Corrections Modal */}
          {showApproveCorrectionsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Approve Corrections</h3>
                {corrections.length === 0 ? (
                  <p className="text-gray-600">No pending corrections.</p>
                ) : (
                  <div className="space-y-4">
                    {corrections.map((correction) => (
                      <div key={correction.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{correction.employeeName}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(correction.date).toLocaleDateString()} - {correction.type}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => submitApproveCorrection(correction.id, true)}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => submitApproveCorrection(correction.id, false)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>Requested:</strong> {correction.requestedChange}
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>Reason:</strong> {correction.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowApproveCorrectionsModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Attendance Modal */}
          {showResetAttendanceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Reset Attendance</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to reset attendance for {new Date(resetDate).toLocaleDateString()}?
                  This will clear all punch times and reset the status to absent.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowResetAttendanceModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitResetAttendance}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
