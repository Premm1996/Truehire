import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching employee profile for ID:', params.id);

    // Fetch from backend since employee data is in MySQL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/employees/${params.id}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log('Successfully fetched employee data from backend for ID:', params.id);
      return NextResponse.json(backendData);
    } else {
      console.log('Backend returned error for employee ID:', params.id, backendResponse.status);
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: backendResponse.status }
      );
    }

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
