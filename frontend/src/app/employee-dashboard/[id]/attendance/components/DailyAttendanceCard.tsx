'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DailyAttendanceCardProps {
  data?: {
    clockInTime?: string;
    clockOutTime?: string;
    totalWorkHours?: number;
    breakDurations?: Array<{
      start: string;
      end?: string;
      duration: number;
      reason?: string;
    }>;
    attendanceStatus: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
  };
}

export default function DailyAttendanceCard({ data }: DailyAttendanceCardProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'half_day': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'holiday': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'half_day': return '⏳';
      case 'absent': return '❌';
      case 'leave': return '🏖️';
      case 'holiday': return '🎉';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Today's Attendance</h2>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data?.attendanceStatus || 'absent')}`}>
          {getStatusIcon(data?.attendanceStatus || 'absent')} {data?.attendanceStatus?.replace('_', ' ').toUpperCase() || 'NOT RECORDED'}
        </span>
      </div>

      {/* Clock Times */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <div className="text-sm text-green-600 font-medium mb-1">Clock In</div>
          <div className="text-2xl font-bold text-green-800">
            {formatTime(data?.clockInTime)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center p-4 bg-red-50 rounded-lg border border-red-200"
        >
          <div className="text-sm text-red-600 font-medium mb-1">Clock Out</div>
          <div className="text-2xl font-bold text-red-800">
            {formatTime(data?.clockOutTime)}
          </div>
        </motion.div>
      </div>

      {/* Total Work Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6"
      >
        <div className="text-sm text-blue-600 font-medium mb-1">Total Work Hours</div>
        <div className="text-3xl font-bold text-blue-800">
          {formatDuration(data?.totalWorkHours)}
        </div>
      </motion.div>

      {/* Break Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Break Details</h3>
        {data?.breakDurations && data.breakDurations.length > 0 ? (
          <div className="space-y-3">
            {data.breakDurations.map((breakItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(breakItem.start)} - {formatTime(breakItem.end)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Duration: {formatDuration(breakItem.duration)}
                    </div>
                  </div>
                </div>
                {breakItem.reason && (
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {breakItem.reason}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">☕</div>
            <p>No breaks recorded today</p>
          </div>
        )}
      </div>
    </div>
  );
}
