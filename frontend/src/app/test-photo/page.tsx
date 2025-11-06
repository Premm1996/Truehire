'use client';

import React, { useState, useEffect } from 'react';
import authService from '../../lib/auth';

export default function TestPhotoPage() {
  const [employee, setEmployee] = useState({
    fullName: '',
    photo: '',
    position: '',
    department: 'Engineering'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to construct full photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) {
      console.debug('No photo path provided');
      return '';
    }
    if (photoPath.startsWith('http')) {
      console.debug('Using absolute URL:', photoPath);
      return photoPath;
    }

    // Get backend URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Try to fetch from API endpoint first
    if (photoPath.includes('passport-photos') || photoPath.includes('profile-photos')) {
      // This is a direct file path, use it as is
      const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
      const finalUrl = `${backendUrl}${path}`.replace(/([^:])\/\//g, '$1/');
      console.debug('Using direct file path:', finalUrl);
      return finalUrl;
    } else {
      // Use the API endpoint for photos
      const employeeId = authService.getCurrentEmployeeId();
      const apiUrl = `${backendUrl}/api/employees/${employeeId}/profile/photo`;
      console.debug('Using API endpoint:', apiUrl);
      return apiUrl;
    }
  };

  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        const id = authService.getCurrentEmployeeId();
        if (!id) {
          setError('No employee ID found');
          setLoading(false);
          return;
        }

        // Test backend connection first
        try {
          const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/health`);
          console.debug('Backend health check:', healthCheck.ok);
        } catch (e) {
          console.error('Backend server not reachable:', e);
        }

        console.debug('Environment:', {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
        });

        console.log('Fetching employee data for ID:', id);
        const res = await fetch(`/api/employees/${id}/profile`);
        console.log('Response status:', res.status);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch employee data: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.debug('Employee data received:', {
          fullName: data.fullName,
          photoPath: data.photo,
          rawData: data
        });

        setEmployee({
          fullName: data.fullName || 'Unknown Employee',
          photo: data.photo || '',
          position: data.position || 'Employee',
          department: data.department || 'Engineering'
        });
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeeData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Photo Test Page</h1>
      <div>
        <h2>Employee Info:</h2>
        <p><strong>Name:</strong> {employee.fullName}</p>
        <p><strong>Position:</strong> {employee.position}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Photo Path from DB:</strong> {employee.photo || 'No photo path'}</p>
        <p><strong>Constructed Photo URL:</strong> {getPhotoUrl(employee.photo) || 'No URL'}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Photo Display:</h2>
        {employee.photo ? (
          <div>
            <img
              src={getPhotoUrl(employee.photo)}
              alt="Profile"
              style={{ width: '200px', height: '200px', objectFit: 'cover', border: '1px solid #ccc' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('Image failed to load:', {
                  url: target.src,
                  naturalWidth: target.naturalWidth,
                  naturalHeight: target.naturalHeight,
                  error: e
                });
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                console.log('Image loaded successfully:', {
                  url: target.src,
                  naturalWidth: target.naturalWidth,
                  naturalHeight: target.naturalHeight
                });
              }}
            />
            <p>✅ Image should be visible above</p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <p>Raw photo path: {employee.photo}</p>
              <p>Constructed URL: {getPhotoUrl(employee.photo)}</p>
              <p>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}</p>
            </div>
          </div>
        ) : (
          <p>❌ No photo path available</p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Debug Info:</h2>
        <p><strong>NEXT_PUBLIC_BACKEND_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set (using default localhost:5000)'}</p>
        <p><strong>Current window location:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
      </div>
    </div>
  );
}
