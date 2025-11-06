import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET() {
  // Return default leave policies for static generation to avoid build errors
  const defaultPolicies = [
    {
      id: 1,
      name: 'Annual Leave',
      days: 30,
      description: 'Annual leave entitlement for full-time employees',
      type: 'paid',
      carry_forward: true,
      max_carry_forward: 60
    },
    {
      id: 2,
      name: 'Sick Leave',
      days: 12,
      description: 'Medical leave for illness or injury',
      type: 'paid',
      carry_forward: false,
      max_carry_forward: 0
    },
    {
      id: 3,
      name: 'Casual Leave',
      days: 12,
      description: 'Personal leave for unforeseen circumstances',
      type: 'paid',
      carry_forward: false,
      max_carry_forward: 0
    },
    {
      id: 4,
      name: 'Maternity Leave',
      days: 180,
      description: 'Maternity leave for female employees',
      type: 'paid',
      carry_forward: false,
      max_carry_forward: 0
    },
    {
      id: 5,
      name: 'Paternity Leave',
      days: 15,
      description: 'Paternity leave for male employees',
      type: 'paid',
      carry_forward: false,
      max_carry_forward: 0
    }
  ];

  // During build/static generation, return default data to avoid backend dependency
  if (process.env.NODE_ENV === 'production' || !API_BASE_URL.includes('localhost')) {
    return NextResponse.json(defaultPolicies);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/attendance/leave-policies`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leave policies');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leave policies:', error);
    // Fallback to default policies if backend is unavailable
    return NextResponse.json(defaultPolicies);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/admin/attendance/leave-policies`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update leave policies');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating leave policies:', error);
    return NextResponse.json(
      { error: 'Failed to update leave policies' },
      { status: 500 }
    );
  }
}
