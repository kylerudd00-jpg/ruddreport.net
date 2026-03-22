import { NextResponse } from 'next/server';

// Major world airports — lat/lon for bounding box queries
const AIRPORTS: Record<string, { lat: number; lon: number; name: string; city: string }> = {
  // North America
  KLAX: { lat: 33.9425, lon: -118.4081, name: 'Los Angeles Intl', city: 'Los Angeles, CA' },
  KJFK: { lat: 40.6413, lon: -73.7781, name: 'John F. Kennedy Intl', city: 'New York, NY' },
  KORD: { lat: 41.9742, lon: -87.9073, name: "O'Hare Intl", city: 'Chicago, IL' },
  KATL: { lat: 33.6407, lon: -84.4277, name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta, GA' },
  KDFW: { lat: 32.8998, lon: -97.0403, name: 'Dallas/Fort Worth Intl', city: 'Dallas, TX' },
  KDEN: { lat: 39.8561, lon: -104.6737, name: 'Denver Intl', city: 'Denver, CO' },
  KSFO: { lat: 37.6213, lon: -122.3790, name: 'San Francisco Intl', city: 'San Francisco, CA' },
  KSEA: { lat: 47.4502, lon: -122.3088, name: 'Seattle-Tacoma Intl', city: 'Seattle, WA' },
  KMIA: { lat: 25.7959, lon: -80.2870, name: 'Miami Intl', city: 'Miami, FL' },
  KBOS: { lat: 42.3656, lon: -71.0096, name: 'Boston Logan Intl', city: 'Boston, MA' },
  KLAS: { lat: 36.0840, lon: -115.1537, name: 'Harry Reid Intl', city: 'Las Vegas, NV' },
  KPHX: { lat: 33.4373, lon: -112.0078, name: 'Phoenix Sky Harbor Intl', city: 'Phoenix, AZ' },
  KEWR: { lat: 40.6895, lon: -74.1745, name: 'Newark Liberty Intl', city: 'Newark, NJ' },
  KLGA: { lat: 40.7769, lon: -73.8740, name: 'LaGuardia Airport', city: 'New York, NY' },
  KIAD: { lat: 38.9531, lon: -77.4565, name: 'Washington Dulles Intl', city: 'Washington, DC' },
  KDCA: { lat: 38.8521, lon: -77.0377, name: 'Reagan National', city: 'Washington, DC' },
  KMSP: { lat: 44.8848, lon: -93.2223, name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis, MN' },
  KDTW: { lat: 42.2162, lon: -83.3554, name: 'Detroit Metropolitan', city: 'Detroit, MI' },
  KPHL: { lat: 39.8729, lon: -75.2437, name: 'Philadelphia Intl', city: 'Philadelphia, PA' },
  KIAH: { lat: 29.9902, lon: -95.3368, name: 'George Bush Intercontinental', city: 'Houston, TX' },
  KHOU: { lat: 29.6454, lon: -95.2789, name: 'William P. Hobby Airport', city: 'Houston, TX' },
  KSLC: { lat: 40.7884, lon: -111.9778, name: 'Salt Lake City Intl', city: 'Salt Lake City, UT' },
  KMCO: { lat: 28.4294, lon: -81.3089, name: 'Orlando Intl', city: 'Orlando, FL' },
  KTPA: { lat: 27.9755, lon: -82.5332, name: 'Tampa Intl', city: 'Tampa, FL' },
  KBWI: { lat: 39.1754, lon: -76.6683, name: 'Baltimore/Washington Intl', city: 'Baltimore, MD' },
  KCLT: { lat: 35.2140, lon: -80.9431, name: 'Charlotte Douglas Intl', city: 'Charlotte, NC' },
  KSAN: { lat: 32.7336, lon: -117.1897, name: 'San Diego Intl', city: 'San Diego, CA' },
  CYVR: { lat: 49.1967, lon: -123.1815, name: 'Vancouver Intl', city: 'Vancouver, BC' },
  CYYZ: { lat: 43.6777, lon: -79.6248, name: 'Toronto Pearson Intl', city: 'Toronto, ON' },
  CYUL: { lat: 45.4706, lon: -73.7408, name: 'Montréal-Trudeau Intl', city: 'Montreal, QC' },
  MMMX: { lat: 19.4363, lon: -99.0721, name: 'Mexico City Intl', city: 'Mexico City, MX' },
  // Europe
  EGLL: { lat: 51.4775, lon: -0.4614, name: 'London Heathrow', city: 'London, UK' },
  EGKK: { lat: 51.1481, lon: -0.1903, name: 'London Gatwick', city: 'London, UK' },
  EGSS: { lat: 51.8850, lon: 0.2350, name: 'London Stansted', city: 'London, UK' },
  EHAM: { lat: 52.3086, lon: 4.7639, name: 'Amsterdam Schiphol', city: 'Amsterdam, NL' },
  EDDF: { lat: 50.0379, lon: 8.5622, name: 'Frankfurt Airport', city: 'Frankfurt, DE' },
  EDDM: { lat: 48.3538, lon: 11.7861, name: 'Munich Airport', city: 'Munich, DE' },
  EDDB: { lat: 52.3667, lon: 13.5033, name: 'Berlin Brandenburg', city: 'Berlin, DE' },
  LFPG: { lat: 49.0097, lon: 2.5479, name: 'Paris Charles de Gaulle', city: 'Paris, FR' },
  LFPO: { lat: 48.7233, lon: 2.3794, name: 'Paris Orly', city: 'Paris, FR' },
  LEMD: { lat: 40.4936, lon: -3.5668, name: 'Madrid Barajas', city: 'Madrid, ES' },
  LEBL: { lat: 41.2971, lon: 2.0785, name: 'Barcelona El Prat', city: 'Barcelona, ES' },
  LIRF: { lat: 41.7999, lon: 12.2462, name: 'Rome Fiumicino', city: 'Rome, IT' },
  LIMC: { lat: 45.6306, lon: 8.7231, name: 'Milan Malpensa', city: 'Milan, IT' },
  LSZH: { lat: 47.4647, lon: 8.5492, name: 'Zurich Airport', city: 'Zurich, CH' },
  LOWW: { lat: 48.1103, lon: 16.5697, name: 'Vienna Intl', city: 'Vienna, AT' },
  EPWA: { lat: 52.1657, lon: 20.9671, name: 'Warsaw Chopin', city: 'Warsaw, PL' },
  EKCH: { lat: 55.6180, lon: 12.6508, name: 'Copenhagen Airport', city: 'Copenhagen, DK' },
  ESSA: { lat: 59.6519, lon: 17.9186, name: 'Stockholm Arlanda', city: 'Stockholm, SE' },
  ENGM: { lat: 60.1939, lon: 11.1004, name: 'Oslo Gardermoen', city: 'Oslo, NO' },
  EFHK: { lat: 60.3183, lon: 24.9630, name: 'Helsinki Vantaa', city: 'Helsinki, FI' },
  UUEE: { lat: 55.9736, lon: 37.4125, name: 'Moscow Sheremetyevo', city: 'Moscow, RU' },
  UUDD: { lat: 55.4088, lon: 37.9063, name: 'Moscow Domodedovo', city: 'Moscow, RU' },
  LTBA: { lat: 40.9769, lon: 28.8146, name: 'Istanbul Atatürk', city: 'Istanbul, TR' },
  LTFM: { lat: 41.2753, lon: 28.7519, name: 'Istanbul Airport', city: 'Istanbul, TR' },
  LGAV: { lat: 37.9364, lon: 23.9445, name: 'Athens Eleftherios Venizelos', city: 'Athens, GR' },
  LKPR: { lat: 50.1008, lon: 14.2600, name: 'Prague Václav Havel', city: 'Prague, CZ' },
  LHBP: { lat: 47.4298, lon: 19.2611, name: 'Budapest Ferenc Liszt', city: 'Budapest, HU' },
  EBBR: { lat: 50.9014, lon: 4.4844, name: 'Brussels Airport', city: 'Brussels, BE' },
  LPPT: { lat: 38.7756, lon: -9.1354, name: 'Lisbon Humberto Delgado', city: 'Lisbon, PT' },
  // Asia-Pacific
  RJTT: { lat: 35.5494, lon: 139.7798, name: 'Tokyo Haneda', city: 'Tokyo, JP' },
  RJAA: { lat: 35.7647, lon: 140.3864, name: 'Tokyo Narita', city: 'Tokyo, JP' },
  RJBB: { lat: 34.4347, lon: 135.2440, name: 'Osaka Kansai Intl', city: 'Osaka, JP' },
  ZBAA: { lat: 40.0799, lon: 116.6031, name: 'Beijing Capital Intl', city: 'Beijing, CN' },
  ZBAD: { lat: 39.5098, lon: 116.4105, name: 'Beijing Daxing Intl', city: 'Beijing, CN' },
  ZSPD: { lat: 31.1434, lon: 121.8052, name: 'Shanghai Pudong Intl', city: 'Shanghai, CN' },
  ZSSS: { lat: 31.1981, lon: 121.3364, name: 'Shanghai Hongqiao Intl', city: 'Shanghai, CN' },
  ZGGG: { lat: 23.3924, lon: 113.2990, name: 'Guangzhou Baiyun Intl', city: 'Guangzhou, CN' },
  VHHH: { lat: 22.3080, lon: 113.9185, name: 'Hong Kong Intl', city: 'Hong Kong' },
  WSSS: { lat: 1.3644, lon: 103.9915, name: 'Singapore Changi', city: 'Singapore' },
  YSSY: { lat: -33.9461, lon: 151.1772, name: 'Sydney Kingsford Smith', city: 'Sydney, AU' },
  YMML: { lat: -37.6690, lon: 144.8410, name: 'Melbourne Airport', city: 'Melbourne, AU' },
  YBBN: { lat: -27.3842, lon: 153.1175, name: 'Brisbane Airport', city: 'Brisbane, AU' },
  YPPH: { lat: -31.9403, lon: 115.9669, name: 'Perth Airport', city: 'Perth, AU' },
  OMDB: { lat: 25.2528, lon: 55.3644, name: 'Dubai Intl', city: 'Dubai, UAE' },
  OMDW: { lat: 24.8973, lon: 55.1614, name: 'Al Maktoum Intl', city: 'Dubai, UAE' },
  OTHH: { lat: 25.2609, lon: 51.6138, name: 'Hamad Intl', city: 'Doha, QA' },
  OJAI: { lat: 24.4331, lon: 54.6511, name: 'Abu Dhabi Intl', city: 'Abu Dhabi, UAE' },
  VIDP: { lat: 28.5562, lon: 77.1000, name: 'Indira Gandhi Intl', city: 'New Delhi, IN' },
  VABB: { lat: 19.0896, lon: 72.8656, name: 'Chhatrapati Shivaji Intl', city: 'Mumbai, IN' },
  VOMM: { lat: 12.9900, lon: 80.1693, name: 'Chennai Intl', city: 'Chennai, IN' },
  RKSI: { lat: 37.4691, lon: 126.4505, name: 'Incheon Intl', city: 'Seoul, KR' },
  VTBS: { lat: 13.6811, lon: 100.7470, name: 'Suvarnabhumi Airport', city: 'Bangkok, TH' },
  WIII: { lat: -6.1256, lon: 106.6559, name: 'Soekarno-Hatta Intl', city: 'Jakarta, ID' },
  WMKK: { lat: 2.7456, lon: 101.7099, name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur, MY' },
  RPLL: { lat: 14.5086, lon: 121.0197, name: 'Ninoy Aquino Intl', city: 'Manila, PH' },
  VVTS: { lat: 10.8188, lon: 106.6520, name: 'Tan Son Nhat Intl', city: 'Ho Chi Minh City, VN' },
  NZAA: { lat: -37.0082, lon: 174.7850, name: 'Auckland Airport', city: 'Auckland, NZ' },
  // Middle East & Africa
  HECA: { lat: 30.1219, lon: 31.4056, name: 'Cairo Intl', city: 'Cairo, EG' },
  FAOR: { lat: -26.1392, lon: 28.2460, name: 'O.R. Tambo Intl', city: 'Johannesburg, ZA' },
  FACT: { lat: -33.9648, lon: 18.6017, name: 'Cape Town Intl', city: 'Cape Town, ZA' },
  GMMN: { lat: 33.3675, lon: -7.5898, name: 'Casablanca Mohammed V', city: 'Casablanca, MA' },
  DNMM: { lat: 6.5774, lon: 3.3216, name: 'Murtala Muhammed Intl', city: 'Lagos, NG' },
  HAAB: { lat: 8.9779, lon: 38.7993, name: 'Addis Ababa Bole Intl', city: 'Addis Ababa, ET' },
  OKBK: { lat: 29.2267, lon: 47.9689, name: 'Kuwait Intl', city: 'Kuwait City, KW' },
  // South America
  SBGR: { lat: -23.4356, lon: -46.4731, name: 'São Paulo Guarulhos Intl', city: 'São Paulo, BR' },
  SBGL: { lat: -22.8100, lon: -43.2506, name: 'Rio de Janeiro Galeão Intl', city: 'Rio de Janeiro, BR' },
  SAEZ: { lat: -34.8222, lon: -58.5358, name: 'Buenos Aires Ezeiza Intl', city: 'Buenos Aires, AR' },
  SCEL: { lat: -33.3930, lon: -70.7858, name: 'Santiago Arturo Merino Benítez', city: 'Santiago, CL' },
  SKBO: { lat: 4.7016, lon: -74.1469, name: 'El Dorado Intl', city: 'Bogotá, CO' },
  SPIM: { lat: -12.0219, lon: -77.1143, name: 'Jorge Chávez Intl', city: 'Lima, PE' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const airport = searchParams.get('airport')?.toUpperCase()?.trim();
  const type = searchParams.get('type') || 'departure'; // 'departure' | 'arrival'

  if (!airport) return NextResponse.json({ error: 'No airport code provided' }, { status: 400 });

  const apt = AIRPORTS[airport];
  if (!apt) {
    const supported = Object.keys(AIRPORTS).slice(0, 12).join(', ');
    return NextResponse.json({
      error: `Airport "${airport}" not found. Use a 4-letter ICAO code for a major airport — e.g. ${supported}, and many more.`,
    }, { status: 404 });
  }

  // ~1.2° bounding box around airport (~100 km radius)
  const delta = 1.2;
  const params = new URLSearchParams({
    lamin: String(+(apt.lat - delta).toFixed(4)),
    lomin: String(+(apt.lon - delta).toFixed(4)),
    lamax: String(+(apt.lat + delta).toFixed(4)),
    lomax: String(+(apt.lon + delta).toFixed(4)),
  });

  try {
    const res = await fetch(`https://opensky-network.org/api/states/all?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
    const data = await res.json();

    const states: any[][] = data.states || [];
    const all = states
      .filter(s => s[5] != null && s[6] != null)
      .map(s => ({
        icao24: s[0] || '',
        callsign: (s[1] || '').trim(),
        country: s[2] || '',
        lon: s[5], lat: s[6],
        baroAlt: s[7] ?? 0,
        onGround: !!s[8],
        velocity: s[9] ?? 0,
        heading: s[10] ?? 0,
        vertRate: s[11] ?? 0,
        squawk: s[14] || '',
        positionSource: s[16] ?? 0,
        category: s[17] ?? 0,
      }));

    // Classify by flight phase
    let flights;
    if (type === 'departure') {
      // On ground OR low altitude climbing
      flights = all.filter(f => f.onGround || (f.vertRate > 0.5 && f.baroAlt < 12000));
      flights.sort((a, b) => {
        if (a.onGround !== b.onGround) return a.onGround ? -1 : 1;
        return a.baroAlt - b.baroAlt;
      });
    } else {
      // Descending toward airport OR just landed
      flights = all.filter(f => f.onGround || (f.vertRate < -0.5 && f.baroAlt < 12000));
      flights.sort((a, b) => {
        if (a.onGround !== b.onGround) return a.onGround ? -1 : 1;
        return a.baroAlt - b.baroAlt;
      });
    }

    return NextResponse.json({
      flights,
      airport,
      airportName: apt.name,
      airportCity: apt.city,
      nearbyTotal: all.length,
      type,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Request failed' }, { status: 500 });
  }
}
