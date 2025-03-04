// src/app/api/moodle/login/route.ts
import { NextResponse } from 'next/server';

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