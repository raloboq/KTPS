// src/utils/moodleAuth.ts
// Actualizado para incluir funciones para el moodleUserId

import Cookies from 'js-cookie';

/**
 * Verifica si el usuario está autenticado comprobando la existencia del token
 */
export const isAuthenticated = (): boolean => {
  const token = Cookies.get('moodleToken');
  return !!token;
};

/**
 * Obtiene el token de Moodle de las cookies
 */
export const getMoodleToken = (): string | undefined => {
  return Cookies.get('moodleToken');
};

/**
 * Obtiene el nombre de usuario de Moodle de las cookies
 */
export const getMoodleUsername = (): string | undefined => {
  return Cookies.get('moodleUsername');
};

/**
 * Obtiene el correo electrónico del usuario de Moodle de las cookies
 */
export const getMoodleEmail = (): string | undefined => {
  return Cookies.get('moodleEmail');
};

/**
 * Obtiene el nombre completo del usuario de Moodle de las cookies
 */
export const getMoodleFullName = (): string | undefined => {
  return Cookies.get('moodleFullName');
};

/**
 * Obtiene el ID de usuario de Moodle de las cookies
 */
export const getMoodleUserId = (): number | undefined => {
  const userIdStr = Cookies.get('moodleUserId');
  return userIdStr ? parseInt(userIdStr, 10) : undefined;
};

/**
 * Realiza el logout eliminando las cookies
 */
export const logout = (): void => {
  // Eliminar cookies de autenticación
  Cookies.remove('moodleToken');
  Cookies.remove('moodleUsername');
  Cookies.remove('moodleEmail');
  Cookies.remove('moodleFullName');
  Cookies.remove('moodleUserId');
  
  // Eliminar cookies de selección de curso/actividad
  Cookies.remove('selectedCourseId');
  Cookies.remove('selectedAssignmentId');
  Cookies.remove('selectedCourseName');
  Cookies.remove('selectedAssignmentName');
  
  // Redirigir a la página de login
  window.location.href = '/login';
};

/**
 * Realiza una petición autenticada a la API de Moodle
 */
export const moodleApiCall = async (endpoint: string, params: Record<string, any> = {}): Promise<any> => {
  const token = getMoodleToken();
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
  const apiUrl = `${moodleUrl}/webservice/rest/server.php`;
  
  const queryParams = new URLSearchParams({
    wstoken: token,
    moodlewsrestformat: 'json',
    wsfunction: endpoint,
    ...params,
  });

  try {
    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Verificar si Moodle devuelve un error
    if (data.exception) {
      throw new Error(data.message || 'Error en la API de Moodle');
    }
    
    return data;
  } catch (error) {
    console.error('Error en moodleApiCall:', error);
    throw error;
  }
};