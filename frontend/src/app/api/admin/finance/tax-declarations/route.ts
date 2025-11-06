import { NextRequest, NextResponse } from 'next/server';

async function parseJsonOrThrow(res) {
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON, got ${ct}. status=${res.status}. head=${text.slice(0,300)}`);
  }
  return JSON.parse(text);
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${backendUrl}/api/admin/finance/tax-declarations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch tax declarations' }, { status: response.status });
    }

    const data = await parseJsonOrThrow(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching tax declarations:', error);
    return NextResponse.json({ error: 'Failed to fetch tax declarations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/admin/finance/tax-declarations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to create tax declaration' }, { status: response.status });
    }

    const data = await parseJsonOrThrow(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating tax declaration:', error);
    return NextResponse.json({ error: 'Failed to create tax declaration' }, { status: 500 });
  }
}
