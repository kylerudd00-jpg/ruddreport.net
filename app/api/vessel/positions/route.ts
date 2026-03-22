import { NextResponse } from 'next/server';
import WebSocket from 'ws';

interface VesselPos {
  mmsi: string; name: string; lat: number; lon: number;
  speed: number; course: number; shipType: number; ts: number;
}

// Module-level state — persists between requests in the same process
const vessels = new Map<string, VesselPos>();
let wsInstance: WebSocket | null = null;
let wsState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

function connect() {
  const key = process.env.AISSTREAM_API_KEY;
  if (!key || wsState !== 'disconnected') return;
  wsState = 'connecting';

  const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
  wsInstance = ws;

  ws.on('open', () => {
    wsState = 'connected';
    ws.send(JSON.stringify({
      APIKey: key,
      BoundingBoxes: [[[-90, -180], [90, 180]]],
      FilterMessageTypes: ['PositionReport'],
    }));
  });

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.MessageType !== 'PositionReport') return;
      const meta = msg.MetaData;
      const pr = msg.Message?.PositionReport;
      const lat = meta.latitude ?? pr?.Latitude;
      const lon = meta.longitude ?? pr?.Longitude;
      if (!lat || !lon) return;
      vessels.set(String(meta.MMSI), {
        mmsi: String(meta.MMSI),
        name: (meta.ShipName || '').trim(),
        lat, lon,
        speed: pr?.Sog ?? 0,
        course: pr?.Cog ?? 0,
        shipType: 0,
        ts: Date.now(),
      });
    } catch { /* ignore */ }
  });

  ws.on('close', () => {
    wsState = 'disconnected';
    wsInstance = null;
    // Reconnect after 10 seconds
    setTimeout(connect, 10_000);
  });

  ws.on('error', () => {
    wsState = 'disconnected';
    wsInstance = null;
    setTimeout(connect, 15_000);
  });
}

// Start connection immediately when this module loads
connect();

export async function GET(request: Request) {
  const key = process.env.AISSTREAM_API_KEY;
  if (!key) return NextResponse.json({ error: 'NO_KEY' }, { status: 503 });

  // Ensure connection is alive
  if (wsState === 'disconnected') connect();

  const { searchParams } = new URL(request.url);
  const south = parseFloat(searchParams.get('south') || '-90');
  const north = parseFloat(searchParams.get('north') || '90');
  const west  = parseFloat(searchParams.get('west')  || '-180');
  const east  = parseFloat(searchParams.get('east')  || '180');

  // Remove stale entries (older than 15 minutes)
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [mmsi, v] of vessels) {
    if (v.ts < cutoff) vessels.delete(mmsi);
  }

  const inView = Array.from(vessels.values()).filter(
    v => v.lat >= south && v.lat <= north && v.lon >= west && v.lon <= east
  );

  return NextResponse.json({ vessels: inView, total: vessels.size, wsState });
}
