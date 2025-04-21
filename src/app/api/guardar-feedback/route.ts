// src/app/api/guardar-feedback/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { tipo_contenido, id_contenido, nombre_usuario, contenido } = await request.json();
    
    if (!tipo_contenido || !id_contenido || !nombre_usuario || !contenido) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }
    
    const result = await pool.query(
      `INSERT INTO feedback (tipo_contenido, id_contenido, nombre_usuario, contenido)
       VALUES ($1, $2, $3, $4)
       RETURNING id_feedback`,
      [tipo_contenido, id_contenido, nombre_usuario, contenido]
    );
    
    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id_feedback 
    });
  } catch (error) {
    console.error('Error al guardar feedback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al guardar feedback' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';