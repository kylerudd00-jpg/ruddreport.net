import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postal = searchParams.get('postal')?.trim();
  const country = searchParams.get('country')?.trim() || 'us';

  if (!postal) return NextResponse.json({ error: 'No postal code provided' }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postal)}&countrycodes=${country}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RuddReport-SatelliteTracker/1.0 (contact@ruddreport.net)' },
    });
    const data = await res.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: `No location found for postal code "${postal}" in selected country` }, { status: 404 });
    }
    const result = data[0];
    return NextResponse.json({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || result.address?.county || '',
      state: result.address?.state || '',
      country: result.address?.country || '',
    });
  } catch {
    return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 500 });
  }
}
