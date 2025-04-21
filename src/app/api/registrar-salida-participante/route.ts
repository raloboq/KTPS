// src/app/api/registrar-salida-participante/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa, nombre_usuario } = await request.json();
    
    if (!id_sesion_colaborativa || !nombre_usuario) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan datos requeridos' 
      }, { status: 400 });
    }
    
    // Actualizar el registro del participante para indicar su salida
    const result = await pool.query(
      `UPDATE participantes_colaborativos
       SET fecha_salida = CURRENT_TIMESTAMP
       WHERE id_sesion_colaborativa = $1 
         AND nombre_usuario = $2
         AND fecha_salida IS NULL
       RETURNING id_participante`,
      [id_sesion_colaborativa, nombre_usuario]
    );
    
    // También registrar la interacción
    await pool.query(
      `INSERT INTO interacciones_colaborativas
         (id_sesion_colaborativa, tipo_interaccion, detalles)
       VALUES ($1, $2, $3)`,
      [
        id_sesion_colaborativa, 
        'usuario_salido', 
        JSON.stringify({ nombre_usuario, timestamp: new Date() })
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Salida de participante registrada exitosamente',
      updated: (result.rowCount ?? 0) > 0
    });
  } catch (error) {
    console.error('Error al registrar salida del participante:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al registrar salida del participante',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';