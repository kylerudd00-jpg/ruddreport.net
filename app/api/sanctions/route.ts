import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.opensanctions.org/search/entities?q=${encodeURIComponent(query)}&limit=10&threshold=0.7`
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      results: data.results || []
    });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Lookup failed" },
      { status: 500 }
    );
  }
}