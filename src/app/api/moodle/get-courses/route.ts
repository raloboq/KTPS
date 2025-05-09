// src/app/api/moodle/get-courses/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IS_DEMO_MODE, sampleCourses } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Si estamos en modo demo, devolver cursos de muestra
    if (IS_DEMO_MODE) {
      // Convertir a la estructura exacta que espera el componente CourseSelectPage
      const demoCourses = sampleCourses.map(course => ({
        id: course.id,
        fullname: course.name,
        shortname: course.shortname || `Demo${course.id}`,
        displayname: course.name
      })) || [
        {
          id: 101,
          fullname: "Curso de Demostración 1",
          shortname: "Demo1",
          displayname: "Curso de Demostración 1"
        },
        {
          id: 102,
          fullname: "Curso de Demostración 2",
          shortname: "Demo2",
          displayname: "Curso de Demostración 2"
        }
      ];
      
      console.log('Devolviendo cursos de demostración:', demoCourses);
      return NextResponse.json({ courses: demoCourses });
    }

    // En modo real, continuar con la obtención de cursos de Moodle
    
    // Obtener el ID de usuario del profesor
    const userId = await getUserId(token);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No se pudo determinar el ID del usuario' },
        { status: 400 }
      );
    }

    // Obtener los cursos del profesor
    const courses = await getUserCourses(token, userId);
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los cursos' },
      { status: 500 }
    );
  }
}

// Función para obtener el ID del usuario actual
async function getUserId(token: string): Promise<number | null> {
  try {
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = `${moodleUrl}/webservice/rest/server.php`;
    
    const params = new URLSearchParams({
      wstoken: token,
      wsfunction: 'core_webservice_get_site_info',
      moodlewsrestformat: 'json'
    });
    //console.log('URL de consulta site_info:', `${apiUrl}?${params.toString()}`);
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Error al obtener información del sitio:', await response.text());
      return null;
    }
    
    const data = await response.json();
    return data.userid || null;
  } catch (error) {
    console.error('Error al obtener ID de usuario:', error);
    return null;
  }
}

// Función para obtener los cursos del usuario
async function getUserCourses(token: string, userId: number): Promise<any[]> {
  try {
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
    const apiUrl = `${moodleUrl}/webservice/rest/server.php`;
    
    const params = new URLSearchParams({
      wstoken: token,
      wsfunction: 'core_enrol_get_users_courses',
      moodlewsrestformat: 'json',
      userid: userId.toString()
    });
    
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Error al obtener cursos:', await response.text());
      return [];
    }
    
    const courses = await response.json();
    return courses || [];
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
}