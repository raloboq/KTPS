/*
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validar que el email esté presente
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Token para este webservice específico (debe ser configurado en las variables de entorno)
    const wsToken = process.env.MOODLE_WS_TOKEN;
    
    if (!wsToken) {
      console.error('Token de webservice no configurado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Construir la URL para buscar el usuario por email
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = new URL(`${moodleUrl}/webservice/rest/server.php`);
    
    // Agregar parámetros a la URL
    apiUrl.searchParams.append('wstoken', wsToken);
    apiUrl.searchParams.append('wsfunction', 'core_user_get_users_by_field');
    apiUrl.searchParams.append('moodlewsrestformat', 'json');
    apiUrl.searchParams.append('field', 'email');
    apiUrl.searchParams.append('values[0]', email);

    // Realizar la petición a Moodle
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Moodle:', errorText);
      return NextResponse.json(
        { error: 'Error al buscar el usuario' },
        { status: response.status }
      );
    }

    // Obtener datos del usuario
    const users = await response.json();
    
    // Verificar si se encontró algún usuario
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ningún usuario con ese correo electrónico' },
        { status: 404 }
      );
    }

    // Obtener el primer usuario encontrado
    const user = users[0];
    
    // Guardar el usuario en nuestra base de datos local si no existe
    try {
      await saveUserToLocalDB(user);
    } catch (error) {
      console.error('Error al guardar usuario en la base de datos local:', error);
      // Continuamos con el proceso aunque falle el guardado local
    }
    
    // Devolver los datos relevantes del usuario
    return NextResponse.json({
      id: user.id, // Importante: Este es el ID de usuario en Moodle
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      email: user.email,
    });
    
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de búsqueda de usuario' },
      { status: 500 }
    );
  }
}

// Función para guardar el usuario en nuestra base de datos local
async function saveUserToLocalDB(user: any) {
  try {
    // Verificar si el usuario ya existe en nuestra base de datos
    const checkResult: QueryResult = await pool.query(
      'SELECT id FROM moodle_users WHERE moodle_user_id = $1',
      [user.id]
    );
    
    // Si no existe, lo agregamos
    if (!checkResult.rowCount || checkResult.rowCount === 0) {
      await pool.query(
        `INSERT INTO moodle_users (
          moodle_user_id, 
          username, 
          email, 
          fullname
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (moodle_user_id) DO UPDATE
        SET 
          username = $2,
          email = $3,
          fullname = $4`,
        [user.id, user.username, user.email, user.fullname]
      );
    }
  } catch (error) {
    console.error('Error durante saveUserToLocalDB:', error);
    throw error; // Re-lanzar el error para que sea manejado por el llamador
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';
*/
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validar que el email esté presente
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, buscar en datos de muestra
    if (IS_DEMO_MODE) {
      // Para profesores en modo demo, aceptar cualquier correo que termine en @demo.com
      if (email.endsWith('@demo.com') || email === 'profesor_demo@konradlorenz.edu.co') {
        return NextResponse.json({
          id: 999,
          username: "profesor_demo",
          firstname: "Profesor",
          lastname: "Demostración",
          fullname: "Profesor Demostración",
          email: "profesor_demo@konradlorenz.edu.co",
        });
      }
      
      // Buscar estudiantes demo
      const student = demoStudents.find(s => 
        s.email === email || s.username === email
      );
      
      if (!student) {
        return NextResponse.json(
          { error: 'No se encontró ningún usuario con ese correo electrónico' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        id: student.id,
        username: student.username,
        firstname: student.fullname.split(' ')[0],
        lastname: student.fullname.split(' ').slice(1).join(' '),
        fullname: student.fullname,
        email: student.email,
      });
    }

    // Si no estamos en modo demo, continuar con el código original
    // Token para este webservice específico (debe ser configurado en las variables de entorno)
    const wsToken = process.env.MOODLE_WS_TOKEN;
    
    if (!wsToken) {
      console.error('Token de webservice no configurado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Construir la URL para buscar el usuario por email
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = new URL(`${moodleUrl}/webservice/rest/server.php`);
    
    // Agregar parámetros a la URL
    apiUrl.searchParams.append('wstoken', wsToken);
    apiUrl.searchParams.append('wsfunction', 'core_user_get_users_by_field');
    apiUrl.searchParams.append('moodlewsrestformat', 'json');
    apiUrl.searchParams.append('field', 'email');
    apiUrl.searchParams.append('values[0]', email);

    // Realizar la petición a Moodle
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Moodle:', errorText);
      return NextResponse.json(
        { error: 'Error al buscar el usuario' },
        { status: response.status }
      );
    }

    // Obtener datos del usuario
    const users = await response.json();
    
    // Verificar si se encontró algún usuario
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ningún usuario con ese correo electrónico' },
        { status: 404 }
      );
    }

    // Obtener el primer usuario encontrado
    const user = users[0];
    
    // Devolver los datos relevantes del usuario
    return NextResponse.json({
      id: user.id, // Importante: Este es el ID de usuario en Moodle
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      email: user.email,
    });
    
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de búsqueda de usuario' },
      { status: 500 }
    );
  }
}