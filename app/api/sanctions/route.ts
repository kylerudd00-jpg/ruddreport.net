import { NextResponse } from "next/server";

// Live OFAC Specially Designated Nationals (SDN) search — keyless, sourced
// directly from the U.S. Treasury public downloads. sdn.csv holds the primary
// records; alt.csv holds a.k.a. aliases. Both are fetched with a 24h cache and
// the parsed index is memoized in module scope so warm requests are instant.

const SDN_URL = "https://www.treasury.gov/ofac/downloads/sdn.csv";
const ALT_URL = "https://www.treasury.gov/ofac/downloads/alt.csv";
const EMPTY = "-0-";

interface SdnEntry {
  entNum: string;
  name: string;
  type: string; // "Individual" | "Entity" | "Vessel" | "Aircraft"
  programs: string[];
  title: string;
  remarks: string;
  akas: string[];
}

let cache: { at: number; entries: SdnEntry[] } | null = null;
const TTL_MS = 24 * 60 * 60 * 1000;

// Minimal RFC-4180-ish CSV parser: handles quoted fields with embedded commas
// and CRLF line breaks. Returns an array of string[] rows.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function clean(v: string | undefined): string {
  if (!v) return "";
  const t = v.trim();
  return t === EMPTY ? "" : t;
}

function normType(raw: string): string {
  const t = clean(raw).toLowerCase();
  if (t.startsWith("individual")) return "Individual";
  if (t.startsWith("vessel")) return "Vessel";
  if (t.startsWith("aircraft")) return "Aircraft";
  return "Entity";
}

async function loadIndex(): Promise<SdnEntry[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.entries;

  const [sdnRes, altRes] = await Promise.all([
    fetch(SDN_URL, { next: { revalidate: 86400 } }),
    fetch(ALT_URL, { next: { revalidate: 86400 } }),
  ]);
  if (!sdnRes.ok) throw new Error(`OFAC SDN fetch failed: ${sdnRes.status}`);
  const [sdnText, altText] = await Promise.all([
    sdnRes.text(),
    altRes.ok ? altRes.text() : Promise.resolve(""),
  ]);

  // aliases: ent_num -> [alt_name]
  const akaMap = new Map<string, string[]>();
  for (const r of parseCsv(altText)) {
    const entNum = clean(r[0]);
    const altName = clean(r[3]);
    if (!entNum || !altName) continue;
    const arr = akaMap.get(entNum);
    if (arr) arr.push(altName); else akaMap.set(entNum, [altName]);
  }

  const entries: SdnEntry[] = [];
  for (const r of parseCsv(sdnText)) {
    const entNum = clean(r[0]);
    const name = clean(r[1]);
    if (!entNum || !name) continue;
    const program = clean(r[3]);
    const programs = program
      ? program.split(/\]\s*\[/).map((p) => p.replace(/[[\]]/g, "").trim()).filter(Boolean)
      : [];
    entries.push({
      entNum,
      name,
      type: normType(r[2]),
      programs,
      title: clean(r[4]),
      remarks: clean(r[11]),
      akas: akaMap.get(entNum) || [],
    });
  }

  cache = { at: Date.now(), entries };
  return entries;
}

// relevance: exact name (3) > name startsWith (2) > name includes (1) >
// alias includes (0) > remarks includes (-1); higher first.
function score(e: SdnEntry, q: string): number {
  const n = e.name.toLowerCase();
  if (n === q) return 3;
  if (n.startsWith(q)) return 2;
  if (n.includes(q)) return 1;
  if (e.akas.some((a) => a.toLowerCase().includes(q))) return 0;
  if (e.remarks.toLowerCase().includes(q)) return -1;
  return -99;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (query.length < 2) {
    return NextResponse.json({ error: "Enter at least 2 characters" }, { status: 400 });
  }

  try {
    const entries = await loadIndex();
    const q = query.toLowerCase();
    const matched = entries
      .map((e) => ({ e, s: score(e, q) }))
      .filter((x) => x.s > -99)
      .sort((a, b) => b.s - a.s || a.e.name.length - b.e.name.length)
      .slice(0, 50)
      .map((x) => x.e);

    return NextResponse.json({
      query,
      total: matched.length,
      source: "OFAC SDN (U.S. Treasury)",
      results: matched,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
