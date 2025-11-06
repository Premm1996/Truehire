'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LeaveBalanceProps {
  data?: {
    pendingEL: number;
    usedEL: number;
    upcomingApprovedLeaves: Array<{
      date: string;
      type: string;
      reason?: string;
    }>;
  };
}

export default function LeaveBalance({ data }: LeaveBalanceProps) {
  const leaveStats = [
    {
      title: 'Pending EL',
      value: data?.pendingEL || 0,
      icon: '⏳',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      title: 'Used EL',
      value: data?.usedEL || 0,
      icon: '✅',
      color: 'bg-green-50 border-green-200 text-green-800'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Leave Balance</h2>

      {/* Leave Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {leaveStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${stat.color} text-center`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Approved Leaves */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Approved Leaves</h3>
        {data?.upcomingApprovedLeaves && data.upcomingApprovedLeaves.length > 0 ? (
          <div className="space-y-3">
            {data.upcomingApprovedLeaves.map((leave, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(leave.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{leave.type}</div>
                  </div>
                </div>
                {leave.reason && (
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No upcoming approved leaves</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium">
            Apply Leave
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
            Leave History
          </button>
        </div>
      </div>
    </div>
  );
}
