// src/app/api/moodle/student-login/route.ts
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE, demoStudents } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password, service, url } = await request.json();

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
}