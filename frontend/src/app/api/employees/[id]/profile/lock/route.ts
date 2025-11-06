import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Fetch lock state from backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/employees/${params.id}/profile/lock`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (backendResponse.ok) {
      const lockState = await backendResponse.json();
      return NextResponse.json(lockState);
    } else {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error checking profile lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Update lock state via backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/employees/${params.id}/profile/lock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (backendResponse.ok) {
      const result = await backendResponse.json();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Failed to update lock state' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error updating profile lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
