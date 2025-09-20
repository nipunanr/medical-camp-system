import { NextRequest, NextResponse } from 'next/server';

// Import the same settings store from the main settings route
// In a real application, this would be a database
const settingsStore = new Map<string, { key: string; value: string; category: string; updatedAt: Date; updatedBy?: string }>();

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const setting = settingsStore.get(params.key);

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json();
    const { value, category, updatedBy } = body;

    // Validate required fields
    if (value === undefined) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // Get existing setting or create new one
    const existingSetting = settingsStore.get(params.key);
    
    const setting = {
      key: params.key,
      value: String(value),
      category: category || existingSetting?.category || 'general',
      updatedAt: new Date(),
      updatedBy
    };

    settingsStore.set(params.key, setting);

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    if (!settingsStore.has(params.key)) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    settingsStore.delete(params.key);

    return NextResponse.json(
      { message: 'Setting deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}