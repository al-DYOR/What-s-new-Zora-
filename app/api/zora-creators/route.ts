import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.zora.co/api/v1/currencies?chain=base');
    const data = await response.json();
    
    const creators = data.currencies?.filter((c: any) => c.volume?.total > 0)?.slice(0, 50) || [];

    return NextResponse.json({
      thirtyDay: creators,
      sevenDay: creators,
      oneDay: creators
    });
  } catch (error) {
    return NextResponse.json({ error: 'API недоступен' });
  }
}