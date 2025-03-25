// src/middleware.ts
/*import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define las rutas que requieren autenticación
const PROTECTED_ROUTES = ['/admin', '/course-select'];

// Define las rutas que requieren selección de curso
const REQUIRE_COURSE_SELECTION = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const requiresAuth = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresAuth) {
    // Verificar si el token existe en las cookies
    const moodleToken = request.cookies.get('moodleToken')?.value;
    
    if (!moodleToken) {
      // Redirigir al login si no hay token
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
  matcher: ['/admin/:path*', '/course-select'],
};*/
// src/middleware.ts (versión modificada para demo)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Cookies from 'js-cookie';

// Define las rutas que requieren autenticación
const PROTECTED_ROUTES = ['/admin', '/course-select'];

// Define las rutas que requieren selección de curso
const REQUIRE_COURSE_SELECTION = ['/admin'];

export function middleware(request: NextRequest) {
  // *** MODO DEMOSTRACIÓN - DESHABILITAR PARA PRODUCCIÓN ***
  // Esto permite el acceso a todas las rutas sin autenticación
  const IS_DEMO_MODE = true; // Cambiar a false después de la demostración
  
  if (IS_DEMO_MODE) {
    // En modo demo, establecer cookies simuladas si no existen
    const response = NextResponse.next();
    
    // Verificar si ya existen cookies (para no sobrescribirlas)
    if (!request.cookies.has('moodleToken')) {
      response.cookies.set('moodleToken', 'demo_token_12345');
      response.cookies.set('moodleUserId', '999');
      response.cookies.set('moodleUsername', 'profesor_demo');
      response.cookies.set('moodleFullName', 'Profesor Demostración');
    }
    
    // Si estamos intentando acceder al panel admin y no hay selección de curso
    const pathname = request.nextUrl.pathname;
    if (pathname === '/admin' && !request.cookies.has('selectedCourseId')) {
      // Establecer datos de curso y actividad de demostración
      response.cookies.set('selectedCourseId', '101');
      response.cookies.set('selectedAssignmentId', '201');
      response.cookies.set('selectedCourseName', 'Curso Demostración');
      response.cookies.set('selectedAssignmentName', 'Actividad Demo');
    }
    
    return response;
  }
  
  // Código original del middleware (se ejecutará cuando IS_DEMO_MODE sea false)
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const requiresAuth = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (requiresAuth) {
    // Verificar si el token existe en las cookies
    const moodleToken = request.cookies.get('moodleToken')?.value;
    
    if (!moodleToken) {
      // Redirigir al login si no hay token
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
  matcher: ['/admin/:path*', '/course-select'],
};