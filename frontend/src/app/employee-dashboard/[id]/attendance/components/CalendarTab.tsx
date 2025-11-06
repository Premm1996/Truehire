'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface CalendarTabProps {
  employeeId: string;
}

interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday' | 'weekend';
  punchInTime?: string;
  punchOutTime?: string;
  totalHours?: number;
  breakDuration?: number;
}

export default function CalendarTab({ employeeId }: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<AttendanceDay | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [employeeId, currentDate]);

  const fetchCalendarData = async () => {
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await axios.get(`/api/attendance/calendar/${employeeId}/${year}/${month}`, {
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

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Attendance Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
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
            <h3 className="text-lg font-semibold text-blue-900">
              {new Date(selectedDate.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
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
    </div>
  );
}
