// src/app/api/obtener-datos-share/route.ts - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ success: false, error: 'ID de sala no proporcionado' }, { status: 400 });
  }

  try {
    console.log(`Obteniendo datos para room_id: ${roomId}`);
    
    // Paso 1: Obtener id_sesion_colaborativa correspondiente al roomId
    const sesionResult = await pool.query(
      `SELECT id_sesion_colaborativa, tema, fecha_inicio 
       FROM sesiones_colaborativas 
       WHERE id_room = $1 
       ORDER BY fecha_inicio DESC 
       LIMIT 1`,
      [roomId]
    );

    console.log(`Resultado sesiones_colaborativas:`, sesionResult.rows);

    if (sesionResult.rows.length === 0) {
      // Si no encontramos sesión colaborativa, devolvemos datos vacíos pero success true
      return NextResponse.json({ 
        success: true,
        colaboracion: {
          id: parseInt(roomId),
          roomName: "Sala No Encontrada",
          content: "No se encontró contenido para esta sala",
          timestamp: new Date().toISOString(),
          participants: []
        },
        reflexiones: []
      });
    }

    const sesionData = sesionResult.rows[0];
    const id_sesion_colaborativa = sesionData.id_sesion_colaborativa;
    
    console.log(`ID sesión colaborativa encontrada: ${id_sesion_colaborativa}`);

    // Paso 2: Obtener la última captura de contenido colaborativo
    const capturaResult = await pool.query(
      `SELECT contenido, timestamp
       FROM capturas_contenido_colaborativo
       WHERE id_sesion_colaborativa = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [id_sesion_colaborativa]
    );

    console.log(`Resultado capturas_contenido_colaborativo:`, capturaResult.rows);

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

    console.log(`Resultado participantes_colaborativos:`, participantesResult.rows);

    const participantes = participantesResult.rows.map(p => p.nombre_usuario);

    // Paso 4: Obtener reflexiones individuales
    const reflexionesIndividuales = [];
    
    // Si tenemos participantes, buscamos sus reflexiones
    if (participantes.length > 0) {
      for (const nombreUsuario of participantes) {
        console.log(`Buscando reflexión para: ${nombreUsuario}`);
        
        const reflexionResult = await pool.query(
          `SELECT id_reflexion, contenido, fecha_creacion, usuario
           FROM reflexiones
           WHERE usuario = $1
           ORDER BY fecha_creacion DESC
           LIMIT 1`,
          [nombreUsuario]
        );
        
        console.log(`Resultado reflexiones para ${nombreUsuario}:`, reflexionResult.rows);
        
        if (reflexionResult.rows.length > 0) {
          reflexionesIndividuales.push({
            id: reflexionResult.rows[0].id_reflexion,
            userName: reflexionResult.rows[0].usuario,
            content: reflexionResult.rows[0].contenido,
            timestamp: reflexionResult.rows[0].fecha_creacion
          });
        }
      }
    } else {
      // Si no hay participantes identificados, intentamos obtener reflexiones directamente
      console.log('No hay participantes, buscando reflexiones directamente');
      
      const reflexionesResult = await pool.query(
        `SELECT id_reflexion, contenido, fecha_creacion, usuario
         FROM reflexiones 
         ORDER BY fecha_creacion DESC 
         LIMIT 5`
      );
      
      console.log(`Resultado reflexiones generales:`, reflexionesResult.rows);
      
      for (const row of reflexionesResult.rows) {
        reflexionesIndividuales.push({
          id: row.id_reflexion,
          userName: row.usuario,
          content: row.contenido,
          timestamp: row.fecha_creacion
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
        participants: participantes
      },
      reflexiones: reflexionesIndividuales
    });
  } catch (error) {
    console.error('Error al obtener datos para la fase share:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener los datos necesarios para la fase share',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';