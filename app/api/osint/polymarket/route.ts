import { NextResponse } from "next/server";

type Mode = "volume" | "new" | "mixed";

const GAMMA = "https://gamma-api.polymarket.com/markets";

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

async function fetchMarketsPage(opts: {
  limit: number;
  offset: number;
  order: string;
  ascending: boolean;
  active: boolean;
  closed: boolean;
  tagId?: string | null;
}) {
  const url = new URL(GAMMA);
  url.searchParams.set("limit", String(opts.limit));
  url.searchParams.set("offset", String(opts.offset));
  url.searchParams.set("order", opts.order);
  url.searchParams.set("ascending", String(opts.ascending));
  url.searchParams.set("active", String(opts.active));
  url.searchParams.set("closed", String(opts.closed));
  if (opts.tagId) url.searchParams.set("tag_id", opts.tagId);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { accept: "application/json" },
      // small cache to avoid hammering Gamma; UI still feels “live” at 30s refresh
      next: { revalidate: 10 },
    });

    if (!r.ok) throw new Error(`Gamma error: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = (searchParams.get("mode") as Mode) || "mixed";

  // Tune these safely (Vercel + browser rendering)
  const limit = clampInt(searchParams.get("limit"), 200, 25, 300);
  const pages = clampInt(searchParams.get("pages"), 5, 1, 12); // 5 * 200 = 1000 markets
  const tagId = searchParams.get("tag_id");

  try {
    const tasks: Promise<any[]>[] = [];

    // Big list: either top volume OR newest
    const mainOrder =
      mode === "new" ? "createdAt" : "volume24hr";
    const mainAscending = false;

    for (let p = 0; p < pages; p++) {
      tasks.push(
        fetchMarketsPage({
          limit,
          offset: p * limit,
          order: mainOrder,
          ascending: mainAscending,
          active: true,
          closed: false,
          tagId,
        })
      );
    }

    // “Guarantee-like” behavior: always also fetch the newest page 0
    // so brand-new markets appear on the next refresh even if they have no volume yet.
    if (mode === "mixed") {
      tasks.push(
        fetchMarketsPage({
          limit: Math.min(limit, 200),
          offset: 0,
          order: "createdAt",
          ascending: false,
          active: true,
          closed: false,
          tagId,
        })
      );
    }

    const pagesData = await Promise.all(tasks);
    const flat = pagesData.flat();

    // De-dupe by market id
    const byId = new Map<string, any>();
    for (const m of flat) {
      if (!m?.id) continue;
      byId.set(String(m.id), m);
    }

    // Slim payload (keeps response light)
    const slim = Array.from(byId.values()).map((m: any) => ({
      id: m.id,
      question: m.question,
      slug: m.slug,
      outcomes: m.outcomes,
      outcomePrices: m.outcomePrices,
      volume24hr: m.volume24hr,
      volumeNum: m.volumeNum,
      liquidityNum: m.liquidityNum,
      createdAt: m.createdAt,
      events: m.events,
    }));

    return NextResponse.json(slim);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Polymarket fetch failed" },
      { status: 500 }
    );
  }
}