import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PunchInOutProps {
  employeeId: string;
  onAttendanceChange: () => void;
}

interface BreakItem {
  id: number;
  start: string;
  end?: string;
  duration: number;
  reason?: string;
  status: string;
}

export default function PunchInOut({ employeeId, onAttendanceChange }: PunchInOutProps) {
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Break management state
  const [breaks, setBreaks] = useState<BreakItem[]>([]);
  const [currentBreak, setCurrentBreak] = useState<BreakItem | null>(null);
  const [breakReason, setBreakReason] = useState('');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  // Live break timer effect
  useEffect(() => {
    if (isOnBreak && currentBreak) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const breakStart = new Date(currentBreak.start).getTime();
        const elapsed = Math.floor((now - breakStart) / 1000);
        setBreakTimer(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setBreakTimer(0);
    }
  }, [isOnBreak, currentBreak]);

  // Calculate work duration excluding break time
  const calculateWorkDuration = useCallback(() => {
    if (!punchInTime) return 0;

    const now = new Date().getTime();
    const start = new Date(punchInTime).getTime();
    let totalDuration = Math.floor((now - start) / 1000);

    // Subtract completed break durations
    const completedBreaks = breaks.filter(b => b.status === 'completed' && b.end);
    let totalBreakTime = completedBreaks.reduce((total, breakItem) => {
      if (breakItem.end) {
        const breakStart = new Date(breakItem.start).getTime();
        const breakEnd = new Date(breakItem.end).getTime();
        return total + Math.floor((breakEnd - breakStart) / 1000);
      }
      return total;
    }, 0);

    // Subtract current active break time
    if (isOnBreak && currentBreak) {
      const breakStart = new Date(currentBreak.start).getTime();
      const currentBreakTime = Math.floor((now - breakStart) / 1000);
      totalBreakTime += currentBreakTime;
    }

    return Math.max(0, totalDuration - totalBreakTime);
  }, [punchInTime, breaks, isOnBreak, currentBreak]);

  // Timer effect
  useEffect(() => {
    if (punchInTime && !punchOutTime) {
      const interval = setInterval(() => {
        setTimer(calculateWorkDuration());
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimer(0);
    }
  }, [punchInTime, punchOutTime, calculateWorkDuration]);

  // API helper function
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem('token');
      const headers = new Headers(options.headers);
      headers.set('Content-Type', 'application/json');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  };

  // Fetch today's status and breaks
  const fetchTodayStatus = useCallback(async () => {
    try {
      const [todayData, breaksData] = await Promise.all([
        apiCall('/api/attendance/today').catch(() => ({
          punchInTime: null,
          punchOutTime: null
        })),
        apiCall('/api/attendance/breaks/today').catch(() => [])
      ]);

      setPunchInTime(todayData.punchInTime || null);
      setPunchOutTime(todayData.punchOutTime || null);

      // Transform breaks data
      const transformedBreaks = Array.isArray(breaksData) ? breaksData.map((b: any) => ({
        id: b.id,
        start: b.break_start || b.start,
        end: b.break_end_time || b.end,
        duration: b.duration_minutes ? b.duration_minutes * 60 : (b.duration || 0),
        reason: b.break_reason || b.reason || '',
        status: b.status
      })) : [];

      setBreaks(transformedBreaks);

      // Check for active break
      const activeBreak = transformedBreaks.find((b: BreakItem) => b.status === 'active');
      if (activeBreak) {
        setIsOnBreak(true);
        setCurrentBreak(activeBreak);
      } else {
        setIsOnBreak(false);
        setCurrentBreak(null);
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching today status:', error);
      setError(`Failed to load status: ${error.message}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();

    // Refresh every 30 seconds
    const interval = setInterval(fetchTodayStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchTodayStatus]);

  const getLocation = () => {
    return new Promise<{ latitude: number | null; longitude: number | null }>((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve({ latitude: null, longitude: null });
        }
      );
    });
  };

  const handleStartWork = async () => {
    setError('');
    try {
      const location = await getLocation();
      const data = await apiCall('/api/attendance/punch-in', {
        method: 'POST',
        body: JSON.stringify(location)
      });

      setPunchInTime(data.punchInTime || new Date().toISOString());
      setPunchOutTime(null);
      setBreaks([]);
      setCurrentBreak(null);
      setIsOnBreak(false);
      onAttendanceChange();
      await fetchTodayStatus();
    } catch (err: any) {
      console.error('Start work error:', err);
      setError(err.message || 'Error starting work');
    }
  };

  const handleStartBreak = async () => {
    setError('');
    if (!punchInTime || punchOutTime) return;

    try {
      const data = await apiCall('/api/attendance/break/start', {
        method: 'POST',
        body: JSON.stringify({ reason: breakReason || 'General break' })
      });

      setBreakReason('');
      onAttendanceChange();
      await fetchTodayStatus();
    } catch (err: any) {
      console.error('Start break error:', err);
      setError(err.message || 'Error starting break');
    }
  };

  const handleResumeWork = async () => {
    setError('');
    try {
      await apiCall('/api/attendance/break/end', {
        method: 'POST'
      });

      setCurrentBreak(null);
      setIsOnBreak(false);
      onAttendanceChange();
      await fetchTodayStatus();
    } catch (err: any) {
      console.error('Resume work error:', err);
      setError(err.message || 'Error resuming work');
    }
  };

  const handleEndWork = async () => {
    setError('');
    if (!punchInTime) return;

    try {
      const location = await getLocation();
      const data = await apiCall('/api/attendance/punch-out', {
        method: 'POST',
        body: JSON.stringify(location)
      });

      setPunchOutTime(data.punchOutTime || new Date().toISOString());
      setIsOnBreak(false);
      setCurrentBreak(null);
      onAttendanceChange();
      await fetchTodayStatus();
    } catch (err: any) {
      console.error('End work error:', err);
      setError(err.message || 'Error ending work');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '--:--:--';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const calculateTotalWorkingHours = () => {
    if (!punchInTime) return '--';

    const endTime = punchOutTime ? new Date(punchOutTime).getTime() : new Date().getTime();
    const startTime = new Date(punchInTime).getTime();
    const totalSeconds = Math.floor((endTime - startTime) / 1000);

    // Subtract break time
    const completedBreaks = breaks.filter(b => b.status === 'completed' && b.end);
    let totalBreakTime = completedBreaks.reduce((total, breakItem) => {
      if (breakItem.end) {
        const breakStart = new Date(breakItem.start).getTime();
        const breakEnd = new Date(breakItem.end).getTime();
        return total + Math.floor((breakEnd - breakStart) / 1000);
      }
      return total;
    }, 0);

    // If currently on break, add current break time
    if (isOnBreak && currentBreak) {
      const breakStart = new Date(currentBreak.start).getTime();
      const currentBreakTime = Math.floor((new Date().getTime() - breakStart) / 1000);
      totalBreakTime += currentBreakTime;
    }

    const workingSeconds = Math.max(0, totalSeconds - totalBreakTime);
    const hours = Math.floor(workingSeconds / 3600);
    const minutes = Math.floor((workingSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = () => {
    if (!punchInTime) return { text: 'NOT RECORDED', color: 'bg-red-50 text-red-600 border border-red-200' };
    if (isOnBreak) return { text: 'On Break', color: 'bg-yellow-100 text-yellow-800' };
    if (punchInTime && !punchOutTime) return { text: 'Working', color: 'bg-green-100 text-green-800' };
    return { text: 'Completed', color: 'bg-blue-100 text-blue-800' };
  };

  const status = getStatusBadge();

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-gray-600">Loading attendance status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Today's Attendance Card - Moved to Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Today's Attendance</h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 ${status.color}`}
          >
            {!punchInTime && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {status.text}
          </motion.div>
        </div>

        {/* Clock In/Out Display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Clock In Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-3">Clock In</h3>
            <p className="text-4xl font-bold text-green-700 font-mono">
              {formatDisplayTime(punchInTime)}
            </p>
            {punchInTime && (
              <p className="text-sm text-green-600 mt-2">
                {punchInTime ? new Date(punchInTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }) : ''}
              </p>
            )}
          </motion.div>

          {/* Clock Out Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-2 border-red-200"
          >
            <h3 className="text-lg font-semibold text-red-800 mb-3">Clock Out</h3>
            <p className="text-4xl font-bold text-red-700 font-mono">
              {formatDisplayTime(punchOutTime)}
            </p>
            {punchOutTime && (
              <p className="text-sm text-red-600 mt-2">
                {punchOutTime ? new Date(punchOutTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }) : ''}
              </p>
            )}
          </motion.div>
        </div>

        {/* Total Work Hours Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-800">Total Work Hours</h3>
            <p className="text-4xl font-bold text-blue-700 font-mono">
              {calculateTotalWorkingHours()}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Status Badge - Removed (now in card header) */}

        {/* Three Buttons */}
        <div className="flex gap-4 items-center justify-center w-full flex-wrap">
          {/* Start Work Button */}
          <motion.button
            onClick={handleStartWork}
            className={`${!punchInTime && !punchOutTime
              ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed opacity-50'
              } text-white px-8 py-4 rounded-full font-semibold shadow-lg text-lg transition-all`}
            whileTap={{ scale: !punchInTime && !punchOutTime ? 0.95 : 1 }}
            disabled={Boolean(punchInTime)}
          >
            Start Work
          </motion.button>

          {/* Start Break / Resume Work Button */}
          <motion.button
            onClick={isOnBreak ? handleResumeWork : handleStartBreak}
            className={`${punchInTime && !punchOutTime
              ? isOnBreak
                ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                : 'bg-yellow-500 hover:bg-yellow-600 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed opacity-50'
              } text-white px-8 py-4 rounded-full font-semibold shadow-lg text-lg transition-all relative overflow-hidden`}
            animate={
              punchInTime && !punchOutTime && !isOnBreak
                ? {
                  boxShadow: [
                    '0 0 5px 2px rgba(234, 179, 8, 0.7)',
                    '0 0 15px 5px rgba(234, 179, 8, 1)',
                    '0 0 5px 2px rgba(234, 179, 8, 0.7)'
                  ],
                  transition: { duration: 2, repeat: Infinity }
                }
                : {}
            }
            whileTap={{ scale: punchInTime && !punchOutTime ? 0.95 : 1 }}
            disabled={!punchInTime || !!punchOutTime}
          >
            {isOnBreak ? 'Resume Work' : 'Start Break'}
          </motion.button>

          {/* End Work Button */}
          <motion.button
            onClick={handleEndWork}
            className={`${punchInTime && !punchOutTime && !isOnBreak
              ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed opacity-50'
              } text-white px-8 py-4 rounded-full font-semibold shadow-lg text-lg transition-all`}
            whileTap={{ scale: punchInTime && !punchOutTime && !isOnBreak ? 0.95 : 1 }}
            disabled={!punchInTime || !!punchOutTime || isOnBreak}
          >
            End Work
          </motion.button>
        </div>

        {/* Live Timer Display */}
        {punchInTime && !punchOutTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-2"
          >
            <div className="text-lg font-semibold text-green-600">
              {isOnBreak ? 'Work Duration (Paused)' : 'Work Duration'}
            </div>
            <div className="text-4xl font-mono text-gray-800 font-bold">
              {formatTime(timer)}
            </div>
          </motion.div>
        )}

        {/* Break Timer Display */}
        {isOnBreak && currentBreak && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-50 rounded-lg p-6 text-center w-full max-w-md"
          >
            <div className="text-lg font-semibold text-orange-700 mb-2">Break Time</div>
            <div className="text-3xl font-mono text-orange-600 font-bold">
              {formatTime(breakTimer)}
            </div>
          </motion.div>
        )}

        {/* Break Reason Input */}
        {punchInTime && !punchOutTime && !isOnBreak && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4 w-full max-w-md"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Reason (Optional)
            </label>
            <textarea
              value={breakReason}
              onChange={(e) => setBreakReason(e.target.value)}
              placeholder="Enter reason for break..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
          </motion.div>
        )}

        {/* Break History */}
        {breaks.filter(b => b.status === 'completed').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Break Details</h3>
            <div className="space-y-3">
              {breaks
                .filter(b => b.status === 'completed')
                .map((breakItem) => (
                  <div key={breakItem.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">
                          {breakItem.start ? new Date(breakItem.start).toLocaleTimeString() : '—'} - {' '}
                          {breakItem.end ? new Date(breakItem.end).toLocaleTimeString() : '—'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        {formatTime(breakItem.duration || 0)}
                      </div>
                    </div>
                    {breakItem.reason && (
                      <div className="text-xs text-gray-500 mt-2 italic">
                        {breakItem.reason}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* No Breaks Message */}
        {breaks.filter(b => b.status === 'completed').length === 0 && punchInTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Break Details</h3>
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg className="w-16 h-16 mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-sm">No breaks recorded today</p>
            </div>
          </motion.div>
        )}

        {/* Punch Out Confirmation */}
        {punchOutTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 rounded-lg p-6 text-center w-full max-w-md border-2 border-green-200"
          >
            <div className="text-lg font-semibold text-green-700 mb-2">
              Work Completed Successfully! 🎉
            </div>
            <div className="text-sm text-green-600">
              Punched out at: {punchOutTime ? new Date(punchOutTime).toLocaleString() : ''}
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-medium w-full max-w-md text-center border border-red-200"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
