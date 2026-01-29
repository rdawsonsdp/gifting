import { NextRequest, NextResponse } from 'next/server';

const FACTORY_ADDRESS = '7637 S Western Ave, Chicago, IL';
const MAX_DISTANCE_MILES = 25;

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    if (!destination || typeof destination !== 'string') {
      return NextResponse.json(
        { error: 'Destination address is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Fallback: no API key configured, allow with warning
      return NextResponse.json({
        distanceMiles: null,
        durationText: null,
        withinRange: true,
        warning: 'Google Maps API key not configured. Distance validation skipped.',
      });
    }

    const params = new URLSearchParams({
      origins: FACTORY_ADDRESS,
      destinations: destination,
      units: 'imperial',
      key: apiKey,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`);
    }

    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK') {
      return NextResponse.json(
        { error: 'Unable to calculate distance to that address. Please check the address and try again.' },
        { status: 422 }
      );
    }

    // Distance is returned in meters, convert to miles
    const distanceMeters = element.distance.value;
    const distanceMiles = Math.round((distanceMeters / 1609.344) * 10) / 10;
    const durationText = element.duration.text;

    return NextResponse.json({
      distanceMiles,
      durationText,
      withinRange: distanceMiles <= MAX_DISTANCE_MILES,
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance. Please try again.' },
      { status: 500 }
    );
  }
}
