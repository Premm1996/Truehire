'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import authService from '../../lib/auth';
import {
  Home,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  User,
  FileCheck,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  IndianRupee,
  BookOpen,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = authService.getCurrentEmployeeId();
    setEmployeeId(id);
    setLoading(false);
  }, []);

  // If no employeeId after loading, show disabled state
  if (!loading && !employeeId) {
    return (
      <aside className="w-64 bg-white text-gray-900 min-h-screen p-6 flex flex-col border-r border-gray-300 rounded-3xl shadow-sm">
        <div className="flex justify-center items-center flex-grow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
            <p className="text-gray-500 text-sm">Unable to load employee ID</p>
            <p className="text-gray-400 text-xs mt-2">Please refresh or contact support</p>
          </div>
        </div>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="w-64 bg-white text-gray-900 min-h-screen p-6 flex flex-col border-r border-gray-300 rounded-3xl shadow-sm">
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
        </div>
      </aside>
    );
  }

  const navigation = [
    { name: 'Home', href: `/employee-dashboard/${employeeId}/profile`, icon: Home },
    { name: 'Attendance', href: `/employee-dashboard/${employeeId}/attendance`, icon: Calendar },
    { name: 'Policy', href: `/employee-dashboard/${employeeId}/policy`, icon: BookOpen },
    { name: 'My Documents', href: `/employee-dashboard/${employeeId}/documents`, icon: FileText },
    { name: 'Onboarding Tasks', href: `/employee-dashboard/${employeeId}/onboarding`, icon: CheckSquare },
    { name: 'Schedule', href: `/employee-dashboard/${employeeId}/schedule`, icon: Clock },
    { name: 'Finance Hub', href: `/employee-dashboard/${employeeId}/finance`, icon: IndianRupee },
    { name: 'Notifications', href: `/employee-dashboard/${employeeId}/notifications`, icon: Bell },
    { name: 'Support', href: `/employee-dashboard/${employeeId}/support`, icon: HelpCircle },
    { name: 'Settings', href: `/employee-dashboard/${employeeId}/settings`, icon: Settings },
  ];

  const isActive = (href: string) => pathname?.startsWith(href) || false;

  return (
    <aside className="w-64 bg-white text-gray-900 min-h-screen p-4 md:p-6 flex flex-col border-r border-gray-300 rounded-3xl shadow-sm">
      {/* Logo */}
      <div className="flex items-center mb-6 md:mb-10 space-x-2 md:space-x-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden shadow-md border border-gray-300 bg-white">
          {employeeId ? (
            <>
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/employees/${employeeId}/photo`}
                alt="Employee Photo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center hidden">
                <span className="text-white font-bold text-sm md:text-lg">E</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-lg">E</span>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <span className="text-lg md:text-xl font-semibold tracking-wide text-gray-900">Employee Portal</span>
          <p className="text-gray-500 text-xs">HireConnect</p>
        </div>
        <div className="md:hidden">
          <span className="text-sm font-semibold tracking-wide text-gray-900">Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1 md:space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive(item.href) ? 'text-white' : 'text-gray-700'}`} />
              <span className="font-medium text-sm md:text-base hidden md:inline">{item.name}</span>
              <span className="font-medium text-xs md:text-base md:hidden">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={() => authService.logout()}
          className="flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium text-sm md:text-base hidden md:inline">Logout</span>
          <span className="font-medium text-xs md:text-base md:hidden">Exit</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
