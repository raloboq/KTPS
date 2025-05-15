// src/app/api/moodle/student-login/route.ts
/*import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password, service, url } = await request.json();

    // Para depuración - eliminar en producción
    console.log('Modo demo activo:', IS_DEMO_MODE);
    console.log('Intento de login con:', { username, password });
    console.log('Estudiantes demo disponibles:', demoStudents.map(s => s.email));

    // Validar que los campos requeridos estén presentes
    if (!username || !password || !service || !url) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, usar credenciales del modo de demostración
    if (IS_DEMO_MODE) {
      // Validar credenciales contra la lista de estudiantes de demostración
      const student = demoStudents.find(
        (s) => (s.username === username || s.email === username) && s.password === password
      );

      if (student) {
        // Simular un token de acceso para el modo demo
        return NextResponse.json({
          token: `demo_token_${student.id}`,
          privatetoken: `demo_private_token_${student.id}`
        });
      } else {
        return NextResponse.json(
          { error: 'Credenciales incorrectas' },
          { status: 401 }
        );
      }
    }

    // En modo no-demo, conectar con Moodle real
    // Construir la URL para la autenticación
    const loginUrl = new URL(url);
    loginUrl.searchParams.append('username', username);
    loginUrl.searchParams.append('password', password);
    loginUrl.searchParams.append('service', service);

    // Realizar la petición a Moodle
    const response = await fetch(loginUrl.toString(), {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error en la respuesta de Moodle:', error);
      return NextResponse.json(
        { error: 'Error al autenticar con Moodle' },
        { status: response.status }
      );
    }

    // Obtener y devolver el token
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en el proceso de login de estudiante:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}*/
// src/app/api/moodle/student-login/route.ts
/*import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password, service, url } = await request.json();

    // Logs para depuración
    console.log('Autenticación de estudiante:');
    console.log('- Modo demo activo:', IS_DEMO_MODE);
    console.log('- Intento de login con username:', username);
    console.log('- Estudiantes demo disponibles:', demoStudents.length);

    // Validar que los campos requeridos estén presentes
    if (!username || !password) {
      console.log('Falta username o password');
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, usamos autenticación simplificada
    if (IS_DEMO_MODE) {
      console.log('Usando autenticación en modo demo');
      
      // En modo demo, permitimos inicio de sesión con cualquiera de las credenciales demo
      // o con cualquier correo que termine en @demo.com
      if (username.endsWith('@demo.com') || 
          demoStudents.some(s => s.email === username || s.username === username)) {
        
        // Buscar un ID de estudiante válido o usar uno predeterminado
        let studentId = 1001; // ID predeterminado
        const foundStudent = demoStudents.find(s => 
          s.email === username || s.username === username
        );
        
        if (foundStudent) {
          studentId = foundStudent.id;
        }
        
        console.log('Demo login exitoso para ID:', studentId);
        
        // Devolver token simulado
        return NextResponse.json({
          token: `demo_token_${studentId}`,
          privatetoken: `demo_private_token_${studentId}`
        });
      }
      
      console.log('Credenciales demo no válidas:', username);
      return NextResponse.json(
        { error: 'En modo demo, usa un email que termine en @demo.com o uno de los usuarios demo predefinidos' },
        { status: 401 }
      );
    }

    // Código original para modo producción
    // Construir la URL para la autenticación
    const loginUrl = new URL(url);
    loginUrl.searchParams.append('username', username);
    loginUrl.searchParams.append('password', password);
    loginUrl.searchParams.append('service', service);

    console.log('URL de autenticación de Moodle:', loginUrl.toString());
    
    // Realizar la petición a Moodle
    const response = await fetch(loginUrl.toString(), {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('Error completo de Moodle1:', error);
      console.error('Error en la respuesta de Moodle:', error);
      return NextResponse.json(
        { error: 'Error al autenticar con Moodle' },
        { status: response.status }
      );
    }

    // Obtener y devolver el token
    const data = await response.json();
    
    if (data.error) {
      console.log('Error completo de Moodle2:', data.error);
      return NextResponse.json(
        { error: data.error },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log('Error en el proceso de login de estudiante:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}*/
// src/app/api/moodle/student-login/route.ts
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password, service, url, isDirectUsername } = await request.json();

    // Logs para depuración
    console.log('Autenticación de estudiante:');
    console.log('- Modo demo activo:', IS_DEMO_MODE);
    console.log('- Intento de login con username:', username);
    console.log('- Es username directo:', isDirectUsername);

    // Validar que los campos requeridos estén presentes
    if (!username || !password) {
      console.log('Falta username o password');
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    // Si estamos en modo demo, usamos autenticación simplificada
    if (IS_DEMO_MODE) {
      console.log('Usando autenticación en modo demo');
      
      // En modo demo, permitimos inicio de sesión con cualquiera de las credenciales demo
      // o con cualquier correo que termine en @demo.com
      if (username.endsWith('@demo.com') || 
          demoStudents.some(s => s.email === username || s.username === username)) {
        
        // Buscar un ID de estudiante válido o usar uno predeterminado
        let studentId = 1001; // ID predeterminado
        const foundStudent = demoStudents.find(s => 
          s.email === username || s.username === username
        );
        
        if (foundStudent) {
          studentId = foundStudent.id;
        }
        
        console.log('Demo login exitoso para ID:', studentId);
        
        // Devolver token simulado
        return NextResponse.json({
          token: `demo_token_${studentId}`,
          privatetoken: `demo_private_token_${studentId}`
        });
      }
      
      console.log('Credenciales demo no válidas:', username);
      return NextResponse.json(
        { error: 'En modo demo, usa un email que termine en @demo.com o uno de los usuarios demo predefinidos' },
        { status: 401 }
      );
    }

    // Código para producción
    // Construir la URL para la autenticación
    const loginUrl = new URL(url);
    loginUrl.searchParams.append('username', username);
    loginUrl.searchParams.append('password', password);
    loginUrl.searchParams.append('service', service);

    console.log('URL de autenticación (sin contraseña):', 
      loginUrl.toString().replace(/password=[^&]*/, 'password=REDACTED'));

    // Realizar la petición a Moodle
    const response = await fetch(loginUrl.toString(), {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Moodle:', errorText);
      
      // Si el usuario intentó directamente con su username y falló, 
      // podríamos intentar otras estrategias aquí
      
      return NextResponse.json(
        { error: 'Acceso inválido. Por favor, inténtelo otra vez.' },
        { status: 401 }
      );
    }

    // Obtener y devolver el token
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en el proceso de login de estudiante:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}