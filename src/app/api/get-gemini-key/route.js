import { NextResponse } from 'next/server';

export async function GET() {
  // Asegúrate de que esta variable de entorno esté configurada en tu servidor
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    return NextResponse.json({ apiKey });
  } else {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }
}