import { NextResponse } from 'next/server';
import { getSgbdTelemetry } from '../../../src/lib/db-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await getSgbdTelemetry(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
