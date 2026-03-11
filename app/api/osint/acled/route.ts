import { NextResponse } from 'next/server';

const FALLBACK_DATA: Record<string, number> = {
  'Ukraine': 1840,
  'Sudan': 1120,
  'Myanmar': 980,
  'Palestine': 760,
  'Yemen': 640,
  'DR Congo': 590,
  'Mali': 420,
  'Somalia': 380,
  'Ethiopia': 310,
  'Syria': 290,
  'Haiti': 240,
  'Iran': 180,
  'Nigeria': 160,
  'Burkina Faso': 140,
};

export async function GET() {
  return NextResponse.json(FALLBACK_DATA);
}