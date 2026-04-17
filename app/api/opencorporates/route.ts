import { NextResponse } from 'next/server';

const BASE = 'https://api.opencorporates.com/v0.4';
const API_KEY = process.env.OPENCORPORATES_API_KEY || '';

function apiUrl(path: string, params: Record<string, string> = {}): string {
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) u.searchParams.set(k, v);
  }
  if (API_KEY) u.searchParams.set('api_token', API_KEY);
  return u.toString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'companies';
  const q = searchParams.get('q') || '';
  const jurisdiction = searchParams.get('jurisdiction') || '';
  const number = searchParams.get('number') || '';

  try {
    // Company detail
    if (type === 'detail' && jurisdiction && number) {
      const res = await fetch(apiUrl(`/companies/${jurisdiction}/${number}`), {
        next: { revalidate: 3600 },
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`OpenCorporates returned ${res.status}`);
      const data = await res.json();
      const co = data.results?.company;
      if (!co) throw new Error('Company not found');

      const officers = (co.officers || []).map((o: any) => {
        const off = o.officer || o;
        return {
          name: off.name,
          role: off.role,
          start_date: off.start_date || null,
          end_date: off.end_date || null,
          inactive: off.inactive || false,
          occupation: off.occupation || null,
          opencorporates_url: off.opencorporates_url || null,
        };
      });

      return NextResponse.json({
        company: {
          name: co.name,
          company_number: co.company_number,
          jurisdiction_code: co.jurisdiction_code,
          current_status: co.current_status,
          company_type: co.company_type,
          incorporation_date: co.incorporation_date,
          dissolution_date: co.dissolution_date,
          registered_address_in_full: co.registered_address_in_full,
          registered_agent_name: co.registered_agent_name,
          alternative_names: co.alternative_names || [],
          previous_names: co.previous_names || [],
          opencorporates_url: co.opencorporates_url,
          officers,
        },
      });
    }

    // Officer search
    if (type === 'officers') {
      if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 });
      const res = await fetch(apiUrl('/officers/search', { q, per_page: '20' }), {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`OpenCorporates returned ${res.status}`);
      const data = await res.json();
      const officers = (data.results?.officers || []).map((o: any) => {
        const off = o.officer || o;
        return {
          id: off.id,
          name: off.name,
          role: off.role,
          start_date: off.start_date || null,
          end_date: off.end_date || null,
          inactive: off.inactive || false,
          occupation: off.occupation || null,
          nationality: off.nationality || null,
          date_of_birth: off.date_of_birth || null,
          company: off.company || null,
          opencorporates_url: off.opencorporates_url || null,
        };
      });
      return NextResponse.json({
        results: officers,
        total: data.results?.total_count || officers.length,
      });
    }

    // Company search (default)
    if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 });
    const params: Record<string, string> = { q, per_page: '20' };
    if (jurisdiction) params.jurisdiction_code = jurisdiction;
    const res = await fetch(apiUrl('/companies/search', params), {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`OpenCorporates returned ${res.status}`);
    const data = await res.json();
    const companies = (data.results?.companies || []).map((c: any) => {
      const co = c.company || c;
      return {
        name: co.name,
        company_number: co.company_number,
        jurisdiction_code: co.jurisdiction_code,
        current_status: co.current_status,
        company_type: co.company_type,
        incorporation_date: co.incorporation_date,
        dissolution_date: co.dissolution_date,
        registered_address_in_full: co.registered_address_in_full,
        opencorporates_url: co.opencorporates_url,
      };
    });
    return NextResponse.json({
      results: companies,
      total: data.results?.total_count || companies.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lookup failed' }, { status: 500 });
  }
}
