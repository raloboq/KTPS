// src/middleware.ts
/*import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IS_DEMO_MODE } from './utils/demoMode';

// Define las rutas que requieren autenticación de estudiante
const STUDENT_PROTECTED_ROUTES = ['/activity-select', '/think', '/pair', '/share'];

// Define las rutas que requieren autenticación de profesor
const TEACHER_PROTECTED_ROUTES = ['/admin', '/course-select'];

// Define las rutas que requieren selección de curso
const REQUIRE_COURSE_SELECTION = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // *** MODO DEMOSTRACIÓN ***
  if (IS_DEMO_MODE) {
    const response = NextResponse.next();
    
    // Para rutas de profesores
    if (TEACHER_PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )) {
      // Verificar si ya existen cookies (para no sobrescribirlas)
      if (!request.cookies.has('moodleToken')) {
        response.cookies.set('moodleToken', 'demo_token_12345');
        response.cookies.set('moodleUserId', '999');
        response.cookies.set('moodleUsername', 'profesor_demo');
        response.cookies.set('moodleFullName', 'Profesor Demostración');
      }
      
      // Si estamos intentando acceder al panel admin y no hay selección de curso
      if (pathname === '/admin' && !request.cookies.has('selectedCourseId')) {
        // Establecer datos de curso y actividad de demostración
        response.cookies.set('selectedCourseId', '101');
        response.cookies.set('selectedAssignmentId', '201');
        response.cookies.set('selectedCourseName', 'Curso Demostración');
        response.cookies.set('selectedAssignmentName', 'Actividad Demo');
      }
    }
    
    // Para rutas de estudiantes
    else if (STUDENT_PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )) {
      // Verificar si ya existen cookies (para no sobrescribirlas)
      if (!request.cookies.has('studentMoodleToken')) {
        response.cookies.set('studentMoodleToken', 'demo_token_student_1001');
        response.cookies.set('studentId', '1001');
        response.cookies.set('studentUsername', 'estudiante_demo');
        response.cookies.set('studentEmail', 'estudiante1@demo.com');
        response.cookies.set('studentFullName', 'Estudiante Demostración');
      }
      
      // Para la fase de Think, asegurar que tiene roomId si no lo tiene
      if ((pathname === '/think' || pathname.startsWith('/think/')) && 
          !request.cookies.has('roomId')) {
        response.cookies.set('roomId', '501');
        response.cookies.set('roomName', 'Demo-Room-001');
        response.cookies.set('activityId', '101');
      }
    }
    
    return response;
  }
  
  // ** MODO PRODUCCIÓN **
  
  // Verificar si la ruta actual requiere autenticación de estudiante
  const requiresStudentAuth = STUDENT_PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresStudentAuth) {
    // Verificar si el token de estudiante existe en las cookies
    const studentToken = request.cookies.get('studentMoodleToken')?.value;
    
    if (!studentToken) {
      // Redirigir al login de estudiantes si no hay token
      const url = new URL('/student-login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Verificar si la ruta actual requiere autenticación de profesor
  const requiresTeacherAuth = TEACHER_PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresTeacherAuth) {
    // Verificar si el token de profesor existe en las cookies
    const teacherToken = request.cookies.get('moodleToken')?.value;
    
    if (!teacherToken) {
      // Redirigir al login de profesores si no hay token
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    
    // Verificar si la ruta requiere selección de curso
    const requiresCourseSelection = REQUIRE_COURSE_SELECTION.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (requiresCourseSelection) {
      // Verificar si ya se ha seleccionado un curso y una actividad
      const selectedCourseId = request.cookies.get('selectedCourseId')?.value;
      const selectedAssignmentId = request.cookies.get('selectedAssignmentId')?.value;
      
      if (!selectedCourseId || !selectedAssignmentId) {
        // Redirigir a la página de selección de curso si no se ha seleccionado
        const url = new URL('/course-select', request.url);
        return NextResponse.redirect(url);
      }
    }
  }
  
  // Continuar con la solicitud
  return NextResponse.next();
}

export const config = {
  // Especificar las rutas donde se aplicará este middleware
  matcher: [
    '/admin/:path*', 
    '/course-select',
    '/activity-select',
    '/think/:path*',
    '/pair/:path*',
    '/share/:path*'
  ],
};*/
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IS_DEMO_MODE } from './utils/demoMode';

// Define las rutas que requieren autenticación de estudiante
const STUDENT_PROTECTED_ROUTES = ['/activity-select', '/think', '/pair', '/share'];

// Define las rutas que requieren autenticación de profesor
const TEACHER_PROTECTED_ROUTES = ['/admin', '/course-select'];

// Define las rutas que requieren selección de curso
const REQUIRE_COURSE_SELECTION = ['/admin'];

// Define las rutas que requieren roomId
const REQUIRE_ROOM_ID = ['/think', '/pair', '/share'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // *** MODO DEMOSTRACIÓN ***
  if (IS_DEMO_MODE) {
    const response = NextResponse.next();
    
    // Para rutas de profesores
    if (TEACHER_PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )) {
      // Verificar si ya existen cookies (para no sobrescribirlas)
      if (!request.cookies.has('moodleToken')) {
        response.cookies.set('moodleToken', 'demo_token_12345');
        response.cookies.set('moodleUserId', '999');
        response.cookies.set('moodleUsername', 'profesor_demo');
        response.cookies.set('moodleFullName', 'Profesor Demostración');
      }
      
      // Si estamos intentando acceder al panel admin y no hay selección de curso
      if (pathname === '/admin' && !request.cookies.has('selectedCourseId')) {
        // Establecer datos de curso y actividad de demostración
        response.cookies.set('selectedCourseId', '101');
        response.cookies.set('selectedAssignmentId', '201');
        response.cookies.set('selectedCourseName', 'Curso Demostración');
        response.cookies.set('selectedAssignmentName', 'Actividad Demo');
      }
    }
    
    // Para rutas de estudiantes
    else if (STUDENT_PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )) {
      // Verificar si ya existen cookies (para no sobrescribirlas)
      if (!request.cookies.has('studentMoodleToken')) {
        response.cookies.set('studentMoodleToken', 'demo_token_student_1001');
        response.cookies.set('studentId', '1001');
        response.cookies.set('studentUsername', 'estudiante_demo');
        response.cookies.set('studentEmail', 'estudiante1@demo.com');
        response.cookies.set('studentFullName', 'Estudiante Demostración');
      }
      
      // Para fases que requieren roomId, asegurarse que lo tengan
      if (REQUIRE_ROOM_ID.some(route => pathname === route || pathname.startsWith(`${route}/`)) && 
          !request.cookies.has('roomId')) {
        response.cookies.set('roomId', '501');
        response.cookies.set('roomName', 'Demo-Room-001');
        response.cookies.set('activityId', '101');
      }
    }
    
    return response;
  }
  
  // ** MODO PRODUCCIÓN **
  
  // Verificar si la ruta actual requiere autenticación de estudiante
  const requiresStudentAuth = STUDENT_PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresStudentAuth) {
    // Verificar si el token de estudiante existe en las cookies
    const studentToken = request.cookies.get('studentMoodleToken')?.value;
    
    if (!studentToken) {
      // Redirigir al login de estudiantes si no hay token
      const url = new URL('/student-login', request.url);
      return NextResponse.redirect(url);
    }
    
    // Para las páginas que requieren roomId (think, pair, share)
    if (REQUIRE_ROOM_ID.some(route => pathname === route || pathname.startsWith(`${route}/`)) && 
        !request.cookies.get('roomId')?.value) {
      // Redirigir a la selección de actividad si no hay roomId
      const url = new URL('/activity-select', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Verificar si la ruta actual requiere autenticación de profesor
  const requiresTeacherAuth = TEACHER_PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresTeacherAuth) {
    // Verificar si el token de profesor existe en las cookies
    const teacherToken = request.cookies.get('moodleToken')?.value;
    
    if (!teacherToken) {
      // Redirigir al login de profesores si no hay token
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    
    // Verificar si la ruta requiere selección de curso
    const requiresCourseSelection = REQUIRE_COURSE_SELECTION.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (requiresCourseSelection) {
      // Verificar si ya se ha seleccionado un curso y una actividad
      const selectedCourseId = request.cookies.get('selectedCourseId')?.value;
      const selectedAssignmentId = request.cookies.get('selectedAssignmentId')?.value;
      
      if (!selectedCourseId || !selectedAssignmentId) {
        // Redirigir a la página de selección de curso si no se ha seleccionado
        const url = new URL('/course-select', request.url);
        return NextResponse.redirect(url);
      }
    }
  }
  
  // Continuar con la solicitud
  return NextResponse.next();
}

export const config = {
  // Especificar las rutas donde se aplicará este middleware
  matcher: [
    '/admin/:path*', 
    '/course-select',
    '/activity-select',
    '/think/:path*',
    '/pair/:path*',
    '/share/:path*'
  ],
};