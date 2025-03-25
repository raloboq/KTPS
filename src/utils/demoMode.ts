// src/utils/demoMode.ts
/**
 * Utilidades para el modo de demostración sin conexión a Moodle
 */

// Activar/desactivar modo demostración
export const IS_DEMO_MODE = true; // Cambiar a false cuando se conecte a Moodle real

// Datos de muestra de estudiantes
export const demoStudents = [
  {
    id: 1001,
    moodle_user_id: 1001,
    username: "estudiante1",
    email: "estudiante1@demo.com",
    password: "password123", // Solo para demo
    fullname: "Estudiante Demo 1"
  },
  {
    id: 1002,
    moodle_user_id: 1002,
    username: "estudiante2",
    email: "estudiante2@demo.com",
    password: "password123", // Solo para demo
    fullname: "Estudiante Demo 2"
  },
  {
    id: 1003,
    moodle_user_id: 1003,
    username: "estudiante3",
    email: "estudiante3@demo.com",
    password: "password123", // Solo para demo
    fullname: "Estudiante Demo 3"
  }
];

// Datos de muestra de actividades disponibles
export const demoActivities = [
  {
    id: 101,
    tps_configuration_id: 1,
    name: "Actividad TPS: Pensamiento Crítico",
    description: "Actividad para practicar el pensamiento crítico mediante el modelo Think-Pair-Share.",
    is_active: true,
    start_date: "2025-03-20T10:00:00Z",
    end_date: "2025-04-05T23:59:59Z",
    course_name: "Pensamiento Crítico",
    assignment_name: "Evaluación de Argumentos"
  },
  {
    id: 102,
    tps_configuration_id: 2,
    name: "Actividad TPS: Programación Colaborativa",
    description: "Diseñar una solución a un problema de programación utilizando el enfoque Think-Pair-Share.",
    is_active: true,
    start_date: "2025-03-15T14:00:00Z",
    end_date: "2025-04-10T23:59:59Z",
    course_name: "Fundamentos de Programación",
    assignment_name: "Resolución de Problemas Algorítmicos"
  }
];

// Datos de muestra de configuraciones TPS
export const demoTpsConfigurations = [
  {
    id: 1,
    moodle_user_id: 999,
    think_phase_duration: 900, // 15 minutos en segundos
    think_phase_instructions: "Reflexiona sobre los argumentos presentados e identifica sus fortalezas y debilidades. Considera los posibles sesgos y falacias lógicas presentes.",
    pair_phase_duration: 1200, // 20 minutos en segundos
    pair_phase_instructions: "Discute con tu compañero los argumentos analizados. Compartan sus perspectivas y lleguen a un consenso sobre la validez y solidez de cada argumento.",
    share_phase_duration: 600, // 10 minutos en segundos
    share_phase_instructions: "Preparen una síntesis de su análisis para compartir con el grupo. Deben incluir los principales puntos de acuerdo y desacuerdo.",
    system_prompt: "Eres un asistente especializado en pensamiento crítico. Tu objetivo es ayudar a los estudiantes a analizar argumentos de manera rigurosa, identificando premisas, conclusiones, falacias y sesgos. Fomenta la discusión respetuosa y el análisis basado en evidencia."
  },
  {
    id: 2,
    moodle_user_id: 999,
    think_phase_duration: 1200, // 20 minutos en segundos
    think_phase_instructions: "Analiza el problema de programación presentado. Identifica los requisitos, piensa en posibles algoritmos y estructuras de datos para resolverlo.",
    pair_phase_duration: 1800, // 30 minutos en segundos
    pair_phase_instructions: "Comparte tu solución con tu compañero. Comparen sus enfoques, discutan las ventajas y desventajas de cada uno, y elaboren una solución conjunta mejorada.",
    share_phase_duration: 900, // 15 minutos en segundos
    share_phase_instructions: "Preparen una presentación de su solución final, incluyendo el algoritmo, complejidad temporal y espacial, y posibles mejoras futuras.",
    system_prompt: "Eres un asistente especializado en programación y resolución de problemas algorítmicos. Tu objetivo es guiar a los estudiantes en el desarrollo de soluciones eficientes, ayudándolos a pensar en diferentes enfoques y a evaluar la complejidad de sus algoritmos."
  }
];

// Datos de muestra de salas (almacenamiento en memoria para la demo)
export let demoRooms: any[] = [
  {
    id: 201,
    activity_id: 101,
    room_name: "Activity-101-Room-001",
    max_students: 2,
    current_students: 0,
    is_full: false,
    created_at: new Date().toISOString()
  }
];

// Datos de muestra de asignaciones de estudiantes a salas (almacenamiento en memoria para la demo)
export let demoStudentAssignments: any[] = [];

// Función para asignar estudiante a sala en modo demo
export const assignStudentToRoomDemo = (studentId: number, activityId: number) => {
  // Buscar si el estudiante ya está asignado a esta actividad
  const existingAssignment = demoStudentAssignments.find(
    assignment => assignment.student_id === studentId &&
                  demoRooms.find(room => room.id === assignment.room_id && room.activity_id === activityId)
  );
  
  // Si ya está asignado, devolver esa asignación
  if (existingAssignment) {
    const room = demoRooms.find(r => r.id === existingAssignment.room_id);
    return {
      success: true,
      roomId: room.id,
      roomName: room.room_name,
      message: 'Ya estás asignado a una sala para esta actividad'
    };
  }
  
  // Buscar una sala disponible
  let room = demoRooms.find(room => room.activity_id === activityId && !room.is_full);
  
  // Si no hay sala disponible, crear una nueva
  if (!room) {
    const roomCount = demoRooms.filter(room => room.activity_id === activityId).length;
    const roomNumber = (roomCount + 1).toString().padStart(3, '0');
    const roomName = `Activity-${activityId}-Room-${roomNumber}`;
    
    // Generar nuevo ID (simular autoincremento)
    const newRoomId = Math.max(...demoRooms.map(r => r.id), 200) + 1;
    
    room = {
      id: newRoomId,
      activity_id: activityId,
      room_name: roomName,
      max_students: 2,
      current_students: 0,
      is_full: false,
      created_at: new Date().toISOString()
    };
    
    demoRooms.push(room);
  }
  
  // Incrementar contador de estudiantes
  room.current_students += 1;
  
  // Marcar como llena si alcanza el máximo
  if (room.current_students >= room.max_students) {
    room.is_full = true;
  }
  
  // Registrar asignación
  const newAssignmentId = Math.max(...demoStudentAssignments.map(a => a.id || 0), 300) + 1;
  const newAssignment = {
    id: newAssignmentId,
    student_id: studentId,
    room_id: room.id,
    join_time: new Date().toISOString(),
    leave_time: null,
    status: 'active'
  };
  
  demoStudentAssignments.push(newAssignment);
  
  return {
    success: true,
    roomId: room.id,
    roomName: room.room_name,
    message: 'Asignado a sala correctamente'
  };
};

// Función para obtener estado de sala en modo demo
export const getRoomStatusDemo = (roomId: number) => {
  const room = demoRooms.find(r => r.id === roomId);
  
  if (!room) {
    return {
      success: false,
      error: 'Sala no encontrada'
    };
  }
  
  // Buscar la actividad relacionada
  const activity = demoActivities.find(a => a.id === room.activity_id);
  
  // Buscar la configuración TPS relacionada
  const tpsConfig = demoTpsConfigurations.find(c => c.id === activity?.tps_configuration_id);
  
  // Buscar los estudiantes asignados a esta sala
  const assignments = demoStudentAssignments.filter(
    a => a.room_id === roomId && a.status === 'active'
  );
  
  const students = assignments.map(assignment => {
    const student = demoStudents.find(s => s.id === assignment.student_id);
    return {
      id: student?.id,
      fullname: student?.fullname,
      username: student?.username,
      join_time: assignment.join_time
    };
  });
  
  return {
    success: true,
    room: {
      room_id: room.id,
      room_name: room.room_name,
      current_students: room.current_students,
      is_full: room.is_full,
      activity_id: activity?.id,
      activity_name: activity?.name,
      think_phase_duration: tpsConfig?.think_phase_duration,
      think_phase_instructions: tpsConfig?.think_phase_instructions,
      pair_phase_duration: tpsConfig?.pair_phase_duration,
      pair_phase_instructions: tpsConfig?.pair_phase_instructions,
      share_phase_duration: tpsConfig?.share_phase_duration,
      share_phase_instructions: tpsConfig?.share_phase_instructions,
      system_prompt: tpsConfig?.system_prompt
    },
    students,
    canStartPair: room.is_full,
    readyForShare: false // Asumiendo que nunca están listos para compartir en el modo demo
  };
};