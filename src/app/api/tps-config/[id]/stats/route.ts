// src/app/api/tps-config/[id]/stats/route.ts
import { NextResponse } from 'next/server';
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
}