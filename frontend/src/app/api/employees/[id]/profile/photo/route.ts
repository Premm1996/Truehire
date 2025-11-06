import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upload photo via backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const formData = await request.formData();

    const backendResponse = await fetch(`${backendUrl}/api/employees/${params.id}/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (backendResponse.ok) {
      const result = await backendResponse.json();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete photo via backend (if endpoint exists)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/employees/${params.id}/profile/photo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (backendResponse.ok) {
      const result = await backendResponse.json();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
