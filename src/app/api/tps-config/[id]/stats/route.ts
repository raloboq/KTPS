// src/app/api/tps-config/[id]/stats/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { IS_DEMO_MODE } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID inválido' 
      }, { status: 400 });
    }

    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    // En modo demo, devolvemos datos ficticios para demostración
    if (IS_DEMO_MODE) {
      console.log('Generando estadísticas de demostración para config ID:', id);
      
      // Datos ficticios para mostrar en la interfaz
      const demoStats = {
        totalSessions: 12,
        totalStudents: 24,
        avgThinkTime: 13.5, // minutos
        avgPairTime: 18.2, // minutos
        avgShareTime: 8.7, // minutos
        completionRate: 0.875, // 87.5%
        phaseStats: {
          think: {
            averageLength: 320, // caracteres promedio
            participationRate: 0.95, // 95%
            mostCommonTopic: "Beneficios de las redes sociales"
          },
          pair: {
            averageCollaborationTime: 17.3, // minutos
            messageCount: 32, // mensajes promedio
            documentChanges: 22 // cambios promedio
          },
          share: {
            presentationLength: 450, // caracteres promedio
            feedbackCount: 8 // número de retroalimentaciones
          }
        },
        timeDistribution: [
          { phase: "Think", percentage: 32 },
          { phase: "Pair", percentage: 45 },
          { phase: "Share", percentage: 23 }
        ]
      };
      
      return NextResponse.json({ 
        success: true, 
        data: demoStats
      });
    }

    // Para modo no-demo, intentamos obtener estadísticas reales de la base de datos
    const userId = parseInt(userIdStr);

    // Verificar que la configuración exista y pertenezca al usuario
    const configCheck = await pool.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [id, userId]
    );

    if (configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // En una implementación real, se ejecutarían consultas para obtener estadísticas
    // Por ahora, devolvemos datos ficticios similares al modo demo
    // Esto debe ser reemplazado con consultas SQL reales en producción
    const mockStats = {
      totalSessions: 8,
      totalStudents: 16,
      avgThinkTime: 14.2,
      avgPairTime: 19.5,
      avgShareTime: 9.3,
      completionRate: 0.81,
      phaseStats: {
        think: {
          averageLength: 290,
          participationRate: 0.92,
          mostCommonTopic: "Desafíos de las redes sociales"
        },
        pair: {
          averageCollaborationTime: 18.1,
          messageCount: 28,
          documentChanges: 19
        },
        share: {
          presentationLength: 420,
          feedbackCount: 6
        }
      },
      timeDistribution: [
        { phase: "Think", percentage: 33 },
        { phase: "Pair", percentage: 47 },
        { phase: "Share", percentage: 20 }
      ]
    };

    return NextResponse.json({ 
      success: true, 
      data: mockStats 
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener estadísticas' 
    }, { status: 500 });
  }
}*/
// src/app/api/tps-config/[id]/stats/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const configId = parseInt(params.id);
    if (isNaN(configId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID inválido' 
      }, { status: 400 });
    }

    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);

    // Verificar que la configuración exista y pertenezca al usuario
    const configCheck = await pool.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // 1. Estadísticas generales: sesiones, estudiantes, tiempos
    const generalStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT sc.id_sesion_colaborativa) as total_sessions,
        COUNT(DISTINCT pc.nombre_usuario) as total_students,
        CASE 
          WHEN COUNT(sc.id_sesion_colaborativa) = 0 THEN 0
          ELSE AVG(EXTRACT(EPOCH FROM (COALESCE(sc.fecha_fin, CURRENT_TIMESTAMP) - sc.fecha_inicio))/60) 
        END as avg_think_time,
        CASE 
          WHEN COUNT(sc.id_sesion_colaborativa) = 0 THEN 0
          ELSE AVG(EXTRACT(EPOCH FROM (COALESCE(sc.fecha_fin, CURRENT_TIMESTAMP) - sc.fecha_inicio))/60) 
        END as avg_pair_time,
        CASE 
          WHEN COUNT(sc.id_sesion_colaborativa) = 0 THEN 0
          ELSE AVG(EXTRACT(EPOCH FROM (COALESCE(sc.fecha_fin, CURRENT_TIMESTAMP) - sc.fecha_inicio))/60) 
        END as avg_share_time
      FROM 
        sesiones_colaborativas sc
      LEFT JOIN 
        participantes_colaborativos pc ON sc.id_sesion_colaborativa = pc.id_sesion_colaborativa
      WHERE 
        sc.tps_configuration_id = $1
    `, [configId]);

    // 2. Tasa de finalización (sesiones completadas / iniciadas)
    const completionRate = await pool.query(`
      WITH started_sessions AS (
        SELECT COUNT(id_sesion_colaborativa) as count
        FROM sesiones_colaborativas
        WHERE tps_configuration_id = $1
      ),
      completed_sessions AS (
        SELECT COUNT(id_sesion_colaborativa) as count
        FROM sesiones_colaborativas
        WHERE tps_configuration_id = $1
        AND fecha_fin IS NOT NULL
      )
      SELECT 
        s.count as started,
        c.count as completed,
        CASE 
          WHEN s.count = 0 THEN 0
          ELSE c.count::float / s.count::float 
        END as completion_rate
      FROM started_sessions s, completed_sessions c
    `, [configId]);

    // 3. Estadísticas de la fase Think
    const thinkStats = await pool.query(`
      WITH think_sessions AS (
        SELECT 
          s.id_sesion,
          r.id_reflexion,
          r.contenido,
          r.usuario
        FROM 
          sesiones s
        JOIN 
          reflexiones r ON s.id_sesion = r.id_sesion
        WHERE 
          s.tps_configuration_id = $1
      )
      SELECT 
        COUNT(id_reflexion) as total_reflections,
        CASE 
          WHEN COUNT(id_reflexion) = 0 THEN 0
          ELSE AVG(LENGTH(contenido))
        END as average_length,
        COUNT(DISTINCT usuario) as participation_rate
      FROM 
        think_sessions
    `, [configId]);

    // 4. Estadísticas de la fase Pair
    const pairStats = await pool.query(`
      WITH pair_sessions AS (
        SELECT 
          sc.id_sesion_colaborativa,
          ccc.id_captura,
          ccc.contenido,
          EXTRACT(EPOCH FROM (COALESCE(sc.fecha_fin, CURRENT_TIMESTAMP) - sc.fecha_inicio))/60 as duration_minutes
        FROM 
          sesiones_colaborativas sc
        LEFT JOIN 
          capturas_contenido_colaborativo ccc ON sc.id_sesion_colaborativa = ccc.id_sesion_colaborativa
        WHERE 
          sc.tps_configuration_id = $1
      ),
      last_captures AS (
        SELECT 
          id_sesion_colaborativa,
          MAX(id_captura) as last_capture_id
        FROM 
          capturas_contenido_colaborativo
        WHERE EXISTS (SELECT 1 FROM pair_sessions ps WHERE ps.id_sesion_colaborativa = id_sesion_colaborativa)
        GROUP BY 
          id_sesion_colaborativa
      )
      SELECT 
        CASE 
          WHEN COUNT(DISTINCT ps.id_sesion_colaborativa) = 0 THEN 0
          ELSE AVG(ps.duration_minutes)
        END as average_collaboration_time,
        CASE 
          WHEN COUNT(DISTINCT ps.id_sesion_colaborativa) = 0 THEN 0
          ELSE COUNT(DISTINCT ic.id_interaccion)::float / NULLIF(COUNT(DISTINCT ps.id_sesion_colaborativa), 0)
        END as average_messages,
        CASE 
          WHEN COUNT(ccc.id_captura) = 0 THEN 0
          ELSE AVG(LENGTH(ccc.contenido))
        END as average_doc_length
      FROM 
        pair_sessions ps
      LEFT JOIN 
        interacciones_colaborativas ic ON ps.id_sesion_colaborativa = ic.id_sesion_colaborativa
      LEFT JOIN 
        last_captures lc ON ps.id_sesion_colaborativa = lc.id_sesion_colaborativa
      LEFT JOIN 
        capturas_contenido_colaborativo ccc ON lc.last_capture_id = ccc.id_captura
    `, [configId]);

    // 5. Estadísticas de la fase Share (comprobando si existe la tabla feedback)
    let shareStats = { rows: [{ total_feedback: '0', average_feedback_length: '0' }] };
    
    try {
      // Comprobar si la tabla feedback existe
      const feedbackTableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'feedback'
        ) as exists
      `);
      
      if (feedbackTableCheck.rows[0].exists) {
        // Si la tabla existe, consultar estadísticas
        shareStats = await pool.query(`
          SELECT 
            COUNT(DISTINCT f.id_feedback) as total_feedback,
            CASE 
              WHEN COUNT(f.id_feedback) = 0 THEN 0
              ELSE AVG(LENGTH(f.contenido))
            END as average_feedback_length
          FROM 
            feedback f
          JOIN 
            sesiones_colaborativas sc ON f.id_sesion_colaborativa = sc.id_sesion_colaborativa
          WHERE 
            sc.tps_configuration_id = $1
        `, [configId]);
      }
    } catch (error) {
      // Si hay un error en la consulta, probablemente la tabla no existe
      console.log('Tabla feedback no encontrada o error en la consulta:', error);
    }

    // 6. Distribución de tiempo por fase
    const timeDistribution = [
      { phase: "Think", percentage: 32 }, // Valores por defecto 
      { phase: "Pair", percentage: 45 },
      { phase: "Share", percentage: 23 }
    ];

    // 7. Consultar temas más comunes (valor estático por ahora)
    const mostCommonTopic = "Beneficios de las redes sociales";

    // Preparar la respuesta con los datos consultados
    const statsData = {
      totalSessions: parseInt(generalStats.rows[0]?.total_sessions || '0'),
      totalStudents: parseInt(generalStats.rows[0]?.total_students || '0'),
      avgThinkTime: parseFloat(generalStats.rows[0]?.avg_think_time || '0').toFixed(1),
      avgPairTime: parseFloat(generalStats.rows[0]?.avg_pair_time || '0').toFixed(1),
      avgShareTime: parseFloat(generalStats.rows[0]?.avg_share_time || '0').toFixed(1),
      completionRate: parseFloat(completionRate.rows[0]?.completion_rate || '0'),
      phaseStats: {
        think: {
          averageLength: parseInt(thinkStats.rows[0]?.average_length || '0'),
          participationRate: parseFloat(thinkStats.rows[0]?.participation_rate || '0'),
          mostCommonTopic: mostCommonTopic
        },
        pair: {
          averageCollaborationTime: parseFloat(pairStats.rows[0]?.average_collaboration_time || '0').toFixed(1),
          messageCount: parseInt(pairStats.rows[0]?.average_messages || '0'),
          documentLength: parseInt(pairStats.rows[0]?.average_doc_length || '0')
        },
        share: {
          presentationLength: parseInt(shareStats.rows[0]?.average_feedback_length || '0'),
          feedbackCount: parseInt(shareStats.rows[0]?.total_feedback || '0')
        }
      },
      timeDistribution: timeDistribution
    };

    return NextResponse.json({ 
      success: true, 
      data: statsData 
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener estadísticas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';