import { NextResponse } from "next/server";

const RX_ADDR = /^0x[a-fA-F0-9]{40}$/;

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

async function getJSON(url: string, revalidate = 15) {
  const r = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate },
  });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function resolveUsername(username: string): Promise<string | null> {
  // strip leading @
  const slug = username.replace(/^@/, "");
  try {
    const r = await fetch(
      `https://gamma-api.polymarket.com/public-profile?username=${encodeURIComponent(slug)}`,
      { headers: { accept: "application/json" }, next: { revalidate: 60 } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    // profile array or single object
    const profile = Array.isArray(data) ? data[0] : data;
    const addr = profile?.address || profile?.proxyWallet;
    return RX_ADDR.test(addr) ? addr : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let address = (searchParams.get("address") || "").trim();

  // resolve @username or plain username to address
  if (!RX_ADDR.test(address)) {
    const resolved = await resolveUsername(address);
    if (!resolved) {
      return NextResponse.json(
        { error: `Could not resolve "${address}" to a wallet address.` },
        { status: 400 }
      );
    }
    address = resolved;
  }

  const positionsLimit = clampInt(searchParams.get("positionsLimit"), 250, 25, 500);
  const closedLimit    = clampInt(searchParams.get("closedLimit"),    250, 25, 500);
  const tradesLimit    = clampInt(searchParams.get("tradesLimit"),    400, 25, 10000);
  const activityLimit  = clampInt(searchParams.get("activityLimit"),  400, 25, 500);

  try {
    const profileUrl   = `https://gamma-api.polymarket.com/public-profile?address=${address}`;
    const valueUrl     = `https://data-api.polymarket.com/value?user=${address}`;
    const tradedUrl    = `https://data-api.polymarket.com/traded?user=${address}`;
    const positionsUrl = `https://data-api.polymarket.com/positions?user=${address}&limit=${positionsLimit}&offset=0&sortBy=CURRENT&sortDirection=DESC`;
    const closedUrl    = `https://data-api.polymarket.com/closed-positions?user=${address}&limit=${closedLimit}&offset=0&sortBy=TIMESTAMP&sortDirection=DESC`;
    const tradesUrl    = `https://data-api.polymarket.com/trades?user=${address}&limit=${tradesLimit}&offset=0&takerOnly=true`;
    const activityUrl  = `https://data-api.polymarket.com/activity?user=${address}&limit=${activityLimit}&offset=0&sortBy=TIMESTAMP&sortDirection=DESC`;

    const [profile, value, traded, positions, closedPositions, trades, activity] =
      await Promise.all([
        getJSON(profileUrl, 60),
        getJSON(valueUrl, 20),
        getJSON(tradedUrl, 60),
        getJSON(positionsUrl, 20),
        getJSON(closedUrl, 60),
        getJSON(tradesUrl, 20),
        getJSON(activityUrl, 20),
      ]);

    return NextResponse.json({
      address,
      profile,
      value,
      traded,
      positions,
      closedPositions,
      trades,
      activity,
      fetchedAt: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Account lookup failed" },
      { status: 502 }
    );
  }
}