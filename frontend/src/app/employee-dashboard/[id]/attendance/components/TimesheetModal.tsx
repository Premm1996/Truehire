'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface TimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (timesheetData: any) => void;
  punchInTime: string;
  punchOutTime: string;
  employeeId: string;
}

interface Task {
  id: string;
  description: string;
  hours: number;
  category: string;
}

export default function TimesheetModal({
  isOpen,
  onClose,
  onSubmit,
  punchInTime,
  punchOutTime,
  employeeId
}: TimesheetModalProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', description: '', hours: 0, category: 'Development' }
  ]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total hours when tasks change
  useEffect(() => {
    const total = tasks.reduce((sum, task) => sum + task.hours, 0);
    setTotalHours(total);
  }, [tasks]);

  // Calculate worked hours from punch times
  const calculateWorkedHours = () => {
    if (!punchInTime || !punchOutTime) return 0;
    const start = new Date(punchInTime).getTime();
    const end = new Date(punchOutTime).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  };

  const workedHours = calculateWorkedHours();

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      description: '',
      hours: 0,
      category: 'Development'
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof Task, value: string | number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async () => {
    // Validate tasks
    const validTasks = tasks.filter(task =>
      task.description.trim() !== '' && task.hours > 0
    );

    if (validTasks.length === 0) {
      setError('Please add at least one task with description and hours');
      return;
    }

    if (totalHours > workedHours + 0.5) { // Allow some tolerance
      setError('Total task hours cannot exceed worked hours significantly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const timesheetData = {
        employeeId,
        punchInTime,
        punchOutTime,
        workedHours,
        tasks: validTasks,
        totalTaskHours: totalHours,
        date: new Date().toISOString().split('T')[0]
      };

      await onSubmit(timesheetData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting timesheet');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Development',
    'Testing',
    'Design',
    'Documentation',
    'Meeting',
    'Training',
    'Support',
    'Research',
    'Other'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold">Daily Timesheet</h2>
            <p className="text-blue-100 mt-1">
              Record your work activities for today
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Work Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Work Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Punch In:</span>
                  <span className="ml-2 font-medium">
                    {new Date(punchInTime).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Punch Out:</span>
                  <span className="ml-2 font-medium">
                    {new Date(punchOutTime).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {workedHours}h
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Task Hours:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {totalHours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Tasks Completed</h3>
                <button
                  onClick={addTask}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                >
                  + Add Task
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Task {index + 1}
                      </span>
                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                          placeholder="Describe what you worked on..."
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={task.hours}
                            onChange={(e) => updateTask(task.id, 'hours', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={task.category}
                            onChange={(e) => updateTask(task.id, 'category', e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-md p-3"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                Total Task Hours: <span className="font-semibold">{totalHours}h</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Timesheet'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
