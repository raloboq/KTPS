// src/middleware.ts
import { NextResponse } from 'next/server';
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
};