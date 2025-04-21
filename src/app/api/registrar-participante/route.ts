// src/app/api/registrar-participante/route.ts
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
    
    // Verificar si este participante ya está registrado
    const checkResult = await pool.query(
      `SELECT id_participante 
       FROM participantes_colaborativos
       WHERE id_sesion_colaborativa = $1 AND nombre_usuario = $2
       AND fecha_salida IS NULL`,
      [id_sesion_colaborativa, nombre_usuario]
    );
    
    // Si ya existe, no hace falta registrarlo de nuevo
    if ((checkResult.rowCount ?? 0) > 0) {
      return NextResponse.json({
        success: true,
        message: 'Participante ya registrado',
        id: checkResult.rows[0].id_participante
      });
    }
    
    // Registrar el nuevo participante
    const result = await pool.query(
      `INSERT INTO participantes_colaborativos
         (id_sesion_colaborativa, nombre_usuario)
       VALUES ($1, $2)
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
        'usuario_unido', 
        JSON.stringify({ nombre_usuario, timestamp: new Date() })
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Participante registrado exitosamente',
      id: result.rows[0].id_participante
    });
  } catch (error) {
    console.error('Error al registrar participante:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al registrar participante',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';