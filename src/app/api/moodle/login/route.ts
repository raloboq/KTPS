// src/app/api/moodle/login/route.ts
import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/utils/demoMode';

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

    // Si estamos en modo demo, devolver un token ficticio
    if (IS_DEMO_MODE) {
      console.log('Modo demo activado - Login con:', username);
      
      // En modo demo, aceptamos cualquier contraseña para usuarios demo
      if (username === 'profesor_demo' || username.endsWith('@demo.com')) {
        return NextResponse.json({
          token: 'demo_token_123456',
          privatetoken: 'demo_private_token_123456'
        });
      }

      // Si llega aquí y sigue en modo demo, pero no es un usuario reconocido
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Si no estamos en modo demo, procedemos con la autenticación real

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
    console.error('Error en el proceso de login:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}