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
// src/app/api/moodle/find-user/route.ts
/*import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Logs para depuración
    console.log('Búsqueda de usuario:');
    console.log('- Modo demo activo:', IS_DEMO_MODE);
    console.log('- Buscando email:', email);

    // Validar que el email esté presente
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, buscar en datos de muestra con lógica flexible
    if (IS_DEMO_MODE) {
      console.log('Usando búsqueda en modo demo');
      
      // Para emails terminados en @demo.com, creamos un usuario demo al vuelo
      if (email.endsWith('@demo.com')) {
        // Extraer nombre de usuario del email
        const username = email.split('@')[0];
        const studentId = Math.floor(Math.random() * 1000) + 1000;
        
        console.log('Creando usuario demo al vuelo:', username);
        
        return NextResponse.json({
          id: studentId,
          username: username,
          firstname: "Estudiante",
          lastname: "Demo",
          fullname: "Estudiante Demo",
          email: email,
        });
      }
      
      // Buscar en estudiantes demo predefinidos
      const student = demoStudents.find(s => 
        s.email === email || s.username === email
      );
      
      if (student) {
        console.log('Usuario demo encontrado:', student.username);
        
        return NextResponse.json({
          id: student.id,
          username: student.username,
          firstname: student.fullname.split(' ')[0],
          lastname: student.fullname.split(' ').slice(1).join(' '),
          fullname: student.fullname,
          email: student.email,
        });
      }
      
      console.log('Usuario demo no encontrado para:', email);
      return NextResponse.json(
        { error: 'No se encontró ningún usuario con ese correo electrónico. En modo demo, use un email que termine en @demo.com o uno de los usuarios predefinidos' },
        { status: 404 }
      );
    }

    // Código original para modo producción
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
      id: user.id, 
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
}*/
// src/app/api/moodle/find-user/route.ts
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const email = requestData.email;
    const username = requestData.username; // Añadimos soporte para buscar por username

    // Logs para depuración
    console.log('Búsqueda de usuario:');
    console.log('- Modo demo activo:', IS_DEMO_MODE);
    console.log('- Buscando por email:', email);
    console.log('- Buscando por username:', username);

    // Validar que al menos un criterio esté presente
    if (!email && !username) {
      return NextResponse.json(
        { error: 'Se requiere email o username' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, buscar en datos de muestra con lógica flexible
    if (IS_DEMO_MODE) {
      console.log('Usando búsqueda en modo demo');
      
      // Para emails terminados en @demo.com, creamos un usuario demo al vuelo
      if (email && email.endsWith('@demo.com')) {
        // Extraer nombre de usuario del email
        const username = email.split('@')[0];
        const studentId = Math.floor(Math.random() * 1000) + 1000;
        
        console.log('Creando usuario demo al vuelo:', username);
        
        return NextResponse.json({
          id: studentId,
          username: username,
          firstname: "Estudiante",
          lastname: "Demo",
          fullname: "Estudiante Demo",
          email: email,
        });
      }
      
      // Buscar en estudiantes demo predefinidos
      const student = demoStudents.find(s => 
        (email && s.email === email) || (username && s.username === username)
      );
      
      if (student) {
        console.log('Usuario demo encontrado:', student.username);
        
        return NextResponse.json({
          id: student.id,
          username: student.username,
          firstname: student.fullname.split(' ')[0],
          lastname: student.fullname.split(' ').slice(1).join(' '),
          fullname: student.fullname,
          email: student.email,
        });
      }
      
      console.log('Usuario demo no encontrado para:', email || username);
      return NextResponse.json(
        { error: 'No se encontró ningún usuario. En modo demo, use un email que termine en @demo.com o uno de los usuarios predefinidos' },
        { status: 404 }
      );
    }

    // Código original para modo producción
    // Token para este webservice específico (debe ser configurado en las variables de entorno)
    const wsToken = process.env.MOODLE_WS_TOKEN;
    
    if (!wsToken) {
      console.error('Token de webservice no configurado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Construir la URL para buscar el usuario
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = new URL(`${moodleUrl}/webservice/rest/server.php`);
    
    // Agregar parámetros a la URL
    apiUrl.searchParams.append('wstoken', wsToken);
    apiUrl.searchParams.append('wsfunction', 'core_user_get_users_by_field');
    apiUrl.searchParams.append('moodlewsrestformat', 'json');
    
    if (email) {
      apiUrl.searchParams.append('field', 'email');
      apiUrl.searchParams.append('values[0]', email);
    } else {
      apiUrl.searchParams.append('field', 'username');
      apiUrl.searchParams.append('values[0]', username);
    }

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
        { error: 'No se encontró ningún usuario con ese correo electrónico o código' },
        { status: 404 }
      );
    }

    // Obtener el primer usuario encontrado
    const user = users[0];
    
    // Devolver los datos relevantes del usuario
    return NextResponse.json({
      id: user.id, 
      username: user.username || null, // Puede que no esté presente
      firstname: user.firstname || null,
      lastname: user.lastname || null,
      fullname: user.fullname || null,
      email: user.email || null,
    });
    
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de búsqueda de usuario' },
      { status: 500 }
    );
  }
}