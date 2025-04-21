// src/app/api/obtener-datos-share/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ success: false, error: 'ID de sala no proporcionado' }, { status: 400 });
  }

  try {
    // Paso 1: Obtener id_sesion_colaborativa correspondiente al roomId
    const sesionResult = await pool.query(
      `SELECT id_sesion_colaborativa, tema, fecha_inicio 
       FROM sesiones_colaborativas 
       WHERE id_room = $1 
       ORDER BY fecha_inicio DESC 
       LIMIT 1`,
      [roomId]
    );

    if (sesionResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Sesión colaborativa no encontrada' }, { status: 404 });
    }

    const sesionData = sesionResult.rows[0];
    const id_sesion_colaborativa = sesionData.id_sesion_colaborativa;

    // Paso 2: Obtener la última captura de contenido colaborativo
    const capturaResult = await pool.query(
      `SELECT contenido, timestamp
       FROM capturas_contenido_colaborativo
       WHERE id_sesion_colaborativa = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [id_sesion_colaborativa]
    );

    let contenidoColaborativo = '';
    let timestampColaborativo = new Date();
    
    if (capturaResult.rows.length > 0) {
      contenidoColaborativo = capturaResult.rows[0].contenido;
      timestampColaborativo = capturaResult.rows[0].timestamp;
    }

    // Paso 3: Obtener participantes de la sesión colaborativa
    const participantesResult = await pool.query(
      `SELECT nombre_usuario, fecha_union, fecha_salida
       FROM participantes_colaborativos
       WHERE id_sesion_colaborativa = $1`,
      [id_sesion_colaborativa]
    );

    const participantes = participantesResult.rows.map(p => ({
      nombre: p.nombre_usuario,
      fecha_union: p.fecha_union,
      fecha_salida: p.fecha_salida
    }));

    // Paso 4: Obtener reflexiones individuales relacionadas con esta sala
    // Como las reflexiones están en otra tabla, necesitamos relacionar por usuario
    const reflexionesIndividuales = [];
    
    for (const participante of participantes) {
      const reflexionResult = await pool.query(
        `SELECT r.id_reflexion, r.contenido, r.fecha_creacion, r.usuario
         FROM reflexiones r
         JOIN sesiones s ON r.id_sesion = s.id_sesion
         WHERE r.usuario = $1
         ORDER BY r.fecha_creacion DESC
         LIMIT 1`,
        [participante.nombre]
      );
      
      if (reflexionResult.rows.length > 0) {
        reflexionesIndividuales.push({
          id: reflexionResult.rows[0].id_reflexion,
          userName: reflexionResult.rows[0].usuario,
          content: reflexionResult.rows[0].contenido,
          timestamp: reflexionResult.rows[0].fecha_creacion
        });
      }
    }

    // Paso 5: Devolver todos los datos recopilados
    return NextResponse.json({ 
      success: true,
      colaboracion: {
        id: id_sesion_colaborativa,
        roomName: sesionData.tema,
        content: contenidoColaborativo,
        timestamp: timestampColaborativo,
        participants: participantes.map(p => p.nombre)
      },
      reflexiones: reflexionesIndividuales
    });
  } catch (error) {
    console.error('Error al obtener datos para la fase share:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener los datos necesarios para la fase share' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';