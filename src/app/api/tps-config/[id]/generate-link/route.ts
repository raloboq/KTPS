// src/app/api/tps-config/[id]/generate-link/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export async function POST(
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
    
    const userId = parseInt(userIdStr);

    // Verificar que la configuración exista, esté activa y pertenezca al usuario
    const existingConfig = await sql`
      SELECT id FROM tps_configurations 
      WHERE id = ${id} 
        AND moodle_user_id = ${userId}
        AND is_active = TRUE
    `;

    if (existingConfig.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada, no autorizada o inactiva' 
      }, { status: 404 });
    }

    // Generar un token único para el acceso a la actividad
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar el token en la base de datos (podríamos crear una tabla específica para esto)
    // Por ahora, solo generamos el enlace
    
    // Construir la URL de acceso
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accessUrl = `${baseUrl}/tps-activity/${id}?token=${accessToken}`;

    return NextResponse.json({ 
      success: true, 
      data: {
        link: accessUrl,
        token: accessToken
      },
      message: 'Enlace de acceso generado exitosamente'
    });
  } catch (error) {
    console.error('Error al generar enlace de acceso:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al generar enlace de acceso' 
    }, { status: 500 });
  }
}*/
// src/app/api/tps-config/[id]/generate-link/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import crypto from 'crypto';

export async function POST(
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
    
    const userId = parseInt(userIdStr);

    // Verificar que la configuración exista, esté activa y pertenezca al usuario
    const existingConfig = await pool.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 
         AND moodle_user_id = $2
         AND is_active = TRUE`,
      [id, userId]
    );

    if (existingConfig.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada, no autorizada o inactiva' 
      }, { status: 404 });
    }

    // Generar un token único para el acceso a la actividad
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar el token en la base de datos (podríamos crear una tabla específica para esto)
    // Por ahora, solo generamos el enlace
    
    // Construir la URL de acceso
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accessUrl = `${baseUrl}/tps-activity/${id}?token=${accessToken}`;

    return NextResponse.json({ 
      success: true, 
      data: {
        link: accessUrl,
        token: accessToken
      },
      message: 'Enlace de acceso generado exitosamente'
    });
  } catch (error) {
    console.error('Error al generar enlace de acceso:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al generar enlace de acceso' 
    }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';