import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export async function POST(request: NextRequest) {
  try {
    const buyerInfo: BuyerInfo = await request.json();

    // Validate required fields
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.company) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Save to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `buyer-info-${timestamp}.json`;
    const filePath = join(dataDir, filename);

    // Also save latest buyer info
    const latestPath = join(dataDir, 'buyer-info-latest.json');

    const dataToSave = {
      ...buyerInfo,
      savedAt: new Date().toISOString(),
    };

    // Write both files
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    await writeFile(latestPath, JSON.stringify(dataToSave, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Buyer information saved successfully',
      filename,
    });
  } catch (error) {
    console.error('Error saving buyer info:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save buyer information',
      },
      { status: 500 }
    );
  }
}
