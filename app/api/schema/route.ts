import { NextResponse } from 'next/server';
import { getSgbdSchema } from '../../../src/lib/db-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await getSgbdSchema(body);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
