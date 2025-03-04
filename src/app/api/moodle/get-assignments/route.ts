// src/app/api/moodle/get-assignments/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Obtener el token de las cookies de la solicitud
    const cookieStore = cookies();
    const token = cookieStore.get('moodleToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No se encontró un token de autenticación válido' },
        { status: 401 }
      );
    }

    // Obtener el courseId de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del curso' },
        { status: 400 }
      );
    }

    // Obtener las actividades del curso
    const assignments = await getCourseAssignments(token, courseId);
    
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return NextResponse.json(
      { error: 'Error al obtener las actividades del curso' },
      { status: 500 }
    );
  }
}

// Función para obtener las actividades del curso
async function getCourseAssignments(token: string, courseId: string): Promise<any> {
  try {
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = `${moodleUrl}/webservice/rest/server.php`;
    
    const params = new URLSearchParams({
      wstoken: token,
      wsfunction: 'mod_assign_get_assignments',
      moodlewsrestformat: 'json',
      'courseids[0]': courseId
    });
    
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Error al obtener actividades:', await response.text());
      return { courses: [] };
    }
    
    const data = await response.json();
    return data || { courses: [] };
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return { courses: [] };
  }
}