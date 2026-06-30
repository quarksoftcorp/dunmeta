import { NextRequest, NextResponse } from 'next/server';
import { searchCharacters } from '@/lib/neople';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const server = searchParams.get('server');
    const name = searchParams.get('name');

    if (!server || !name) {
      return NextResponse.json(
        { error: 'server and name query parameters are required.' },
        { status: 400 }
      );
    }

    const result = await searchCharacters(server, name);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error in search API route:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
