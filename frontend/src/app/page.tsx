'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateAccountModal from './CreateAccountModal';
import LoginModal from './LoginModal';
import AuthService from '../lib/auth';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'slideIn' | 'hold' | 'slideOut'>('initial');
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [hoverSignIn, setHoverSignIn] = useState(false);
  const [hoverCreateAccount, setHoverCreateAccount] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setWelcomeVisible(true);

    const animateHireConnect = () => {
      setAnimationPhase('slideIn');
      setTimeout(() => setAnimationPhase('hold'), 1000);
      setTimeout(() => setAnimationPhase('slideOut'), 4000);
      setTimeout(() => setAnimationPhase('initial'), 5000);
    };

    const initialDelay = setTimeout(animateHireConnect, 1000);
    const interval = setInterval(animateHireConnect, 6000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  // Check authentication status on page load and redirect if needed
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!AuthService.isAuthenticated()) {
        // User is not authenticated, stay on homepage
        return;
      }

      // If user is authenticated, redirect to appropriate dashboard
      try {
        const canAccess = await AuthService.canAccessDashboard();
        if (canAccess) {
          const employeeId = AuthService.getCurrentEmployeeId();
          if (employeeId) {
            router.push(`/employee-dashboard/${employeeId}/profile`);
          } else {
            router.push('/signin');
          }
        } else {
          // Cannot access dashboard, stay on homepage
          console.log('User authenticated but cannot access dashboard');
        }
      } catch (error) {
        console.error('Error checking dashboard access:', error);
        // On error, stay on homepage
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
      {/* Professional Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-blue-700/60 shadow-2xl" style={{height: '0.65in', backgroundColor: '#000035'}}>
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="relative group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden shadow-2xl ring-2 ring-cyan-400/30 group-hover:ring-cyan-400/60 transition-all duration-300">
                <img
                  src="/truerizelogon.png.jpg"
                  alt="Truerize IQ Logo"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-white font-bold text-lg sm:text-xl tracking-tight">Truerize HRMS</span>
              <span className="text-cyan-400/80 text-xs font-medium tracking-wider">TRUERIZE IQ</span>
            </div>
            <div className="flex flex-col sm:hidden">
              <span className="text-white font-bold text-sm tracking-tight">HRMS</span>
              <span className="text-cyan-400/80 text-xs font-medium tracking-wider">TRUERIZE</span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden ml-6 sm:ml-12 hidden lg:block">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-white font-semibold text-sm sm:text-lg tracking-wide px-4">
                Truerize IQ Strategic Solutions Pvt Ltd
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen pt-[0.65in]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[calc(100vh-0.65in)] items-center py-4 sm:py-8">
          <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] sm:min-h-[600px]">

              {/* Left Side - Illustration Panel */}
              <div className="bg-white p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center">
                {/* Logo Section */}
                <div className="mb-6 sm:mb-8 flex items-center space-x-3 sm:space-x-4 mt-10 sm:mt-20">
  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-md flex-shrink-0">
    <img
      src="/images/hrms_logo.png"
      alt="HRMS Logo"
      className="w-full h-full object-cover"
    />
  </div>

  <div className="flex flex-col">
    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Truerize HRMS</h1>
    <p className="text-xs text-blue-600 font-medium tracking-wide">TRUERIZE IQ</p>
  </div>
</div>


                {/* Illustration */}
                <div className="mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm lg:max-w-md">
                  <img
                    src="https://img.freepik.com/free-photo/young-concentrated-woman-striped-shirt-using-laptop-while-siting-table-light-apartment_171337-13026.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="HRMS Illustration"
                    className="w-full h-auto"
                  />
                </div>

                {/* Text Content */}
                <div className="text-center max-w-xs sm:max-w-sm lg:max-w-lg px-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Empowering Workforce Management with Truerize HRMS
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Streamline HR operations, boost productivity and unlock your team's full potential.
                  </p>
                </div>
              </div>

              {/* Right Side - Login Form Panel */}
              <div className="bg-[#1E90FF] p-6 sm:p-8 lg:p-12 flex items-center justify-center">
                <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back!</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      Please enter your details to access your dashboard.
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Login Button */}
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Login
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>

                    {/* Create Account Button */}
                    <button
                      onClick={() => setShowCreateAccountModal(true)}
                      className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Create Account
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <button className="text-white hover:text-blue-100 transition-colors text-xs sm:text-sm underline">
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {/* Footer Links */}
                  <div className="mt-6 sm:mt-8 text-center text-xs text-blue-100">
                    <p className="text-xs sm:text-xs">
                      By creating an account, you agree to our{' '}
                      <button className="text-white hover:underline font-medium">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button className="text-white hover:underline font-medium">
                        Privacy policy
                      </button>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={async () => {
            setShowLoginModal(false);
            // Check if user can access dashboard after login
            try {
              const canAccess = await AuthService.canAccessDashboard();
              if (canAccess) {
                const employeeId = AuthService.getCurrentEmployeeId();
                if (employeeId) {
                  router.push(`/employee-dashboard/${employeeId}/profile`);
                  router.push('/signin');
                }
              } else {
                // Stay on homepage if cannot access dashboard
                console.log('Login successful but cannot access dashboard');
              }
            } catch (error) {
              console.error('Error checking dashboard access after login:', error);
              router.push('/signin');
            }
          }}
          onBack={() => setShowLoginModal(false)}
          onShowSignup={() => {
            setShowLoginModal(false);
            setShowCreateAccountModal(true);
          }}
        />
      )}

      {showCreateAccountModal && (
        <CreateAccountModal onClose={() => setShowCreateAccountModal(false)} />
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
