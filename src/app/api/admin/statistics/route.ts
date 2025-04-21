// src/app/api/admin/statistics/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);
    
    // Obtener el ID de configuración TPS si se proporciona
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');
    
    // Construir la consulta base para filtrar por configId o mostrar totales
    let whereClause = '';
    let params = [];
    
    if (configId) {
      whereClause = 'WHERE tc.id = $1 AND tc.moodle_user_id = $2';
      params = [configId, userId];
    } else {
      whereClause = 'WHERE tc.moodle_user_id = $1';
      params = [userId];
    }

    // Obtener estadísticas generales
    const generalStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT sc.id_sesion_colaborativa) as total_sessions,
        COUNT(DISTINCT pc.nombre_usuario) as total_students,
        AVG(EXTRACT(EPOCH FROM (sc.fecha_fin - sc.fecha_inicio))/60) as avg_session_time
      FROM 
        sesiones_colaborativas sc
      JOIN 
        tps_configurations tc ON sc.tps_configuration_id = tc.id
      LEFT JOIN 
        participantes_colaborativos pc ON sc.id_sesion_colaborativa = pc.id_sesion_colaborativa
      ${whereClause}
    `, params);
    
    // Obtener estadísticas por fase
    // Fase Think
    const thinkStats = await pool.query(`
      SELECT 
        AVG(LENGTH(r.contenido)) as average_length,
        COUNT(r.id_reflexion) as total_reflections
      FROM 
        reflexiones r
      JOIN 
        sesiones s ON r.id_sesion = s.id_sesion
      JOIN 
        tps_configurations tc ON s.tps_configuration_id = tc.id
      ${whereClause}
    `, params);
    
    // Fase Pair
    const pairStats = await pool.query(`
      SELECT 
        AVG(LENGTH(ccc.contenido)) as average_content_length,
        COUNT(DISTINCT ccc.id_sesion_colaborativa) as total_collaborative_sessions
      FROM 
        capturas_contenido_colaborativo ccc
      JOIN 
        sesiones_colaborativas sc ON ccc.id_sesion_colaborativa = sc.id_sesion_colaborativa
      JOIN 
        tps_configurations tc ON sc.tps_configuration_id = tc.id
      ${whereClause}
    `, params);
    
    // Actividad por fases
    const activityByPhase = await pool.query(`
      SELECT 
        'Think' as phase,
        COUNT(r.id_reflexion) as activity_count
      FROM 
        reflexiones r
      JOIN 
        sesiones s ON r.id_sesion = s.id_sesion
      JOIN 
        tps_configurations tc ON s.tps_configuration_id = tc.id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'Pair' as phase,
        COUNT(ic.id_interaccion) as activity_count
      FROM 
        interacciones_colaborativas ic
      JOIN 
        sesiones_colaborativas sc ON ic.id_sesion_colaborativa = sc.id_sesion_colaborativa
      JOIN 
        tps_configurations tc ON sc.tps_configuration_id = tc.id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'Share' as phase,
        COUNT(f.id_feedback) as activity_count
      FROM 
        feedback f
      JOIN 
        sesiones_colaborativas sc ON f.id_sesion_colaborativa = sc.id_sesion_colaborativa
      JOIN 
        tps_configurations tc ON sc.tps_configuration_id = tc.id
      ${whereClause}
    `, params.concat(params).concat(params)); // Repetimos params por los UNIONs

    // Calcular tasa de finalización
    const completionRate = await pool.query(`
      WITH started_sessions AS (
        SELECT COUNT(DISTINCT sc.id_sesion_colaborativa) as count
        FROM sesiones_colaborativas sc
        JOIN tps_configurations tc ON sc.tps_configuration_id = tc.id
        ${whereClause}
      ),
      completed_sessions AS (
        SELECT COUNT(DISTINCT sc.id_sesion_colaborativa) as count
        FROM sesiones_colaborativas sc
        JOIN tps_configurations tc ON sc.tps_configuration_id = tc.id
        ${whereClause}
        AND sc.fecha_fin IS NOT NULL
      )
      SELECT 
        s.count as started,
        c.count as completed,
        CASE 
          WHEN s.count = 0 THEN 0
          ELSE c.count::float / s.count::float 
        END as completion_rate
      FROM started_sessions s, completed_sessions c
    `, params.concat(params));

    // Preparar respuesta
    const statsData = {
      totalSessions: parseInt(generalStats.rows[0]?.total_sessions || '0'),
      totalStudents: parseInt(generalStats.rows[0]?.total_students || '0'),
      avgSessionTime: parseFloat(generalStats.rows[0]?.avg_session_time || '0').toFixed(1),
      completionRate: parseFloat(completionRate.rows[0]?.completion_rate || '0').toFixed(2),
      phaseStats: {
        think: {
          averageLength: parseInt(thinkStats.rows[0]?.average_length || '0'),
          totalReflections: parseInt(thinkStats.rows[0]?.total_reflections || '0')
        },
        pair: {
          averageContentLength: parseInt(pairStats.rows[0]?.average_content_length || '0'),
          totalCollaborativeSessions: parseInt(pairStats.rows[0]?.total_collaborative_sessions || '0')
        }
      },
      activityDistribution: activityByPhase.rows.map(row => ({
        phase: row.phase,
        activityCount: parseInt(row.activity_count)
      }))
    };

    return NextResponse.json({ 
      success: true, 
      data: statsData
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener estadísticas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';