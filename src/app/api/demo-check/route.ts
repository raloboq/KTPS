// src/app/api/demo-check/route.ts
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export async function GET() {
  return NextResponse.json({
    isDemoMode: IS_DEMO_MODE,
    demoStudentsCount: demoStudents.length,
    demoStudents: demoStudents.map(s => ({
      id: s.id,
      username: s.username,
      email: s.email,
      password: s.password // Solo para depuración, eliminar en producción
    }))
  });
}

export const dynamic = 'force-dynamic';