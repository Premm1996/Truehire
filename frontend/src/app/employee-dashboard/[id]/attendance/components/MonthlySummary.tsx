'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MonthlySummaryProps {
  data?: {
    present: number;
    absent: number;
    halfDays: number;
    weekOffs: number;
    holidays: number;
    totalDays: number;
    workingDays: number;
    attendancePercentage: number;
    averageDailyHours: number;
  };
}

export default function MonthlySummary({ data }: MonthlySummaryProps) {
  const summaryCards = [
    {
      title: 'Present',
      value: data?.present || 0,
      icon: '✅',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      title: 'Absent',
      value: data?.absent || 0,
      icon: '❌',
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      title: 'Half Days',
      value: data?.halfDays || 0,
      icon: '⏳',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      title: 'Week-offs',
      value: data?.weekOffs || 0,
      icon: '🏖️',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      title: 'Holidays',
      value: data?.holidays || 0,
      icon: '🎉',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      title: 'Total Days',
      value: data?.totalDays || 0,
      icon: '📅',
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    },
    {
      title: 'Working Days',
      value: data?.workingDays || 0,
      icon: '💼',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      title: 'Attendance %',
      value: `${data?.attendancePercentage || 0}%`,
      icon: '📊',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Monthly Summary</h2>
        <div className="text-sm text-gray-500">
          Average Daily Hours: {data?.averageDailyHours ? `${data.averageDailyHours.toFixed(1)}h` : '0.0h'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${card.color} text-center`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-sm font-medium">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar for Attendance Percentage */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
          <span className="text-sm text-gray-500">{data?.attendancePercentage || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data?.attendancePercentage || 0}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
