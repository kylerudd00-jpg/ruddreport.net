import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('reg') || '';
  if (!raw.trim()) return NextResponse.json({ error: 'No registration provided' }, { status: 400 });

  const reg = raw.trim().toUpperCase();

  try {
    const [adsbRes, photoRes] = await Promise.allSettled([
      // adsbdb.com aircraft lookup by registration
      fetch(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(reg)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }).then(r => r.ok ? r.json() : null).catch(() => null),

      // Planespotters.net — photo + embedded aircraft/airline info
      fetch(`https://api.planespotters.net/pub/photos/reg/${encodeURIComponent(reg)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const adsbData = adsbRes.status === 'fulfilled' ? adsbRes.value : null;
    const photoData = photoRes.status === 'fulfilled' ? photoRes.value : null;

    // adsbdb returns { response: { aircraft: {...} } }
    const aircraft = adsbData?.response?.aircraft ?? null;

    // Best photo (first result from planespotters)
    const photo = photoData?.photos?.[0] ?? null;
    // Fallback aircraft info from photo metadata
    const photoAircraft = photo?.aircraft?.name ?? null;
    const photoAirline = photo?.airline?.name ?? null;

    const found = !!(aircraft || photo);
    if (!found) return NextResponse.json({ found: false, registration: reg });

    return NextResponse.json({
      found: true,
      registration: reg,
      aircraft: aircraft ? {
        type:           aircraft.type ?? photoAircraft ?? null,
        icaoType:       aircraft.icao_type ?? null,
        manufacturer:   aircraft.manufacturer ?? null,
        registration:   aircraft.registration ?? reg,
        modeS:          aircraft.mode_s ?? null,
        owner:          aircraft.registered_owner ?? photoAirline ?? null,
        ownerCountry:   aircraft.registered_owner_country_name ?? null,
        ownerIso:       aircraft.registered_owner_country_iso_name ?? null,
        flagCode:       aircraft.registered_owner_operator_flag_code ?? null,
      } : {
        type:         photoAircraft,
        manufacturer: null,
        registration: reg,
        owner:        photoAirline,
        modeS:        null,
        ownerCountry: null,
      },
      photo: photo ? {
        src:          photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
        link:         photo.link ?? null,
        photographer: photo.photographer ?? null,
        airline:      photo.airline?.name ?? null,
        airport:      photo.airport?.name ?? null,
        date:         photo.date ?? null,
      } : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lookup failed' }, { status: 500 });
  }
}
