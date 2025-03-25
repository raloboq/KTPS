// src/app/api/moodle/get-assignments/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IS_DEMO_MODE, sampleAssignments } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

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

    // Si estamos en modo demo, devolver asignaciones de muestra
    if (IS_DEMO_MODE) {
      // Filtrar las asignaciones por el curso seleccionado
      const courseAssignments = sampleAssignments 
        ? sampleAssignments.filter(assignment => assignment.course_id === parseInt(courseId))
        : [
            {
              id: 201,
              name: "Asignación de Demostración 1",
              cmid: 301,
              course: parseInt(courseId),
              duedate: new Date().getTime() / 1000 + 604800 // Una semana en el futuro
            },
            {
              id: 202,
              name: "Asignación de Demostración 2",
              cmid: 302,
              course: parseInt(courseId),
              duedate: new Date().getTime() / 1000 + 1209600 // Dos semanas en el futuro
            }
          ];
      
      // Agregar logs para depuración
      console.log('CourseId recibido:', courseId);
      console.log('Asignaciones filtradas para el curso:', courseAssignments);
      
      // Estructura exacta que espera el componente
      const result = {
        courses: [{
          id: parseInt(courseId),
          assignments: courseAssignments.map(a => ({
            id: a.id,
            name: a.name,
            cmid: a.id + 100,  // Simulamos un cmid
            duedate: a.duedate || (new Date().getTime() / 1000 + 604800)
          }))
        }]
      };
      
      console.log('Respuesta final de asignaciones:', JSON.stringify(result));
      return NextResponse.json(result);
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