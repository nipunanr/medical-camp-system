import { NextRequest, NextResponse } from 'next/server';

// For now, we'll use a simple in-memory store for settings
// In production, this would be stored in the database
const settingsStore = new Map<string, { key: string; value: string; category: string; updatedAt: Date; updatedBy?: string }>();

// Initialize with some default settings
if (settingsStore.size === 0) {
  settingsStore.set('camp_name', { 
    key: 'camp_name', 
    value: 'Medical Camp', 
    category: 'general', 
    updatedAt: new Date(),
    updatedBy: 'system'
  });
  settingsStore.set('camp_location', { 
    key: 'camp_location', 
    value: '', 
    category: 'general', 
    updatedAt: new Date(),
    updatedBy: 'system'
  });
  settingsStore.set('contact_number', { 
    key: 'contact_number', 
    value: '', 
    category: 'general', 
    updatedAt: new Date(),
    updatedBy: 'system'
  });
  settingsStore.set('email', { 
    key: 'email', 
    value: '', 
    category: 'general', 
    updatedAt: new Date(),
    updatedBy: 'system'
  });
  settingsStore.set('low_stock_threshold', { 
    key: 'low_stock_threshold', 
    value: '10', 
    category: 'medical', 
    updatedAt: new Date(),
    updatedBy: 'system'
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    let filteredSettings = Array.from(settingsStore.values());
    
    if (category) {
      filteredSettings = filteredSettings.filter(setting => setting.category === category);
    }
    
    if (key) {
      filteredSettings = filteredSettings.filter(setting => setting.key === key);
    }

    // If a specific key is requested, return just the value
    if (key && filteredSettings.length === 1) {
      return NextResponse.json({ 
        key: filteredSettings[0].key, 
        value: filteredSettings[0].value,
        category: filteredSettings[0].category 
      });
    }

    // Group settings by category for easier frontend consumption
    const groupedSettings = filteredSettings.reduce((acc: Record<string, Record<string, string>>, setting) => {
      const cat = setting.category || 'general';
      if (!acc[cat]) {
        acc[cat] = {};
      }
      acc[cat][setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      settings: groupedSettings,
      raw: filteredSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, category, updatedBy } = body;

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    if (settingsStore.has(key)) {
      return NextResponse.json(
        { error: 'Setting already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create new setting
    const setting = {
      key,
      value: String(value), // Store as string
      category: category || 'general',
      updatedAt: new Date(),
      updatedBy
    };

    settingsStore.set(key, setting);

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, category, updatedBy } = body;

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Get existing setting or create new one
    const existingSetting = settingsStore.get(key);
    
    const setting = {
      key,
      value: String(value),
      category: category || existingSetting?.category || 'general',
      updatedAt: new Date(),
      updatedBy
    };

    settingsStore.set(key, setting);

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, updatedBy } = body;

    // Validate that settings is an array or object
    if (!settings || (typeof settings !== 'object')) {
      return NextResponse.json(
        { error: 'Settings must be provided as an object or array' },
        { status: 400 }
      );
    }

    const settingsArray = Array.isArray(settings) 
      ? settings 
      : Object.entries(settings).map(([key, value]) => ({ key, value }));

    // Update multiple settings
    const updatedSettings = settingsArray.map((settingData: any) => {
      const existingSetting = settingsStore.get(settingData.key);
      
      const setting = {
        key: settingData.key,
        value: String(settingData.value),
        category: settingData.category || existingSetting?.category || 'general',
        updatedAt: new Date(),
        updatedBy
      };

      settingsStore.set(settingData.key, setting);
      return setting;
    });

    return NextResponse.json({
      message: `Updated ${updatedSettings.length} settings`,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error batch updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}