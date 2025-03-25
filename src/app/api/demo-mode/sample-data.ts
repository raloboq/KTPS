// src/app/api/demo-mode/sample-data.ts
// Este archivo proporciona datos de muestra para la demostración

// src/app/api/demo-mode/sample-data.ts
/**
 * Datos de muestra para el modo de demostración
 */

// Estudiantes de muestra
export const sampleStudents = [
    {
      id: 1001,
      username: "student1",
      email: "student1@example.com",
      fullname: "Estudiante Demo 1",
      password: "password123" // Solo para demostración
    },
    {
      id: 1002,
      username: "student2",
      email: "student2@example.com",
      fullname: "Estudiante Demo 2",
      password: "password123"
    },
    {
      id: 1003,
      username: "student3",
      email: "student3@example.com",
      fullname: "Estudiante Demo 3",
      password: "password123"
    }
  ];
  
  // Cursos de muestra
  export const sampleCourses = [
    {
      id: 101,
      name: "Fundamentos de Programación",
      shortname: "FundProg"
    },
    {
      id: 102,
      name: "Diseño de Algoritmos",
      shortname: "DiAlg"
    },
    {
      id: 103,
      name: "Pensamiento Crítico",
      shortname: "PenCrit"
    }
  ];
  
  // Asignaciones de muestra
  export const sampleAssignments = [
    {
      id: 201,
      course_id: 101,
      name: "Introducción a la Programación",
      description: "Actividad sobre conceptos básicos de programación",
      duedate: "2025-04-15T23:59:59Z"
    },
    {
      id: 202,
      course_id: 101,
      name: "Estructuras de Control",
      description: "Ejercicios sobre condicionales y bucles",
      duedate: "2025-04-22T23:59:59Z"
    },
    {
      id: 203,
      course_id: 102,
      name: "Análisis de Complejidad",
      description: "Evaluación de la eficiencia de algoritmos",
      duedate: "2025-04-20T23:59:59Z"
    },
    {
      id: 204,
      course_id: 103,
      name: "Evaluación de Argumentos",
      description: "Actividad para analizar y evaluar argumentos",
      duedate: "2025-04-18T23:59:59Z"
    }
  ];
  
  // Configuraciones TPS de muestra
  export const sampleTPSConfigurations = [
    {
      id: 301,
      course_id: 101,
      assignment_id: 201,
      user_id: 999, // ID del profesor demo
      think_phase_duration: 900, // 15 minutos en segundos
      think_phase_instructions: "Reflexiona individualmente sobre los conceptos básicos de programación. Identifica los términos que no entiendes y piensa en ejemplos de uso.",
      pair_phase_duration: 1200, // 20 minutos en segundos
      pair_phase_instructions: "Discute con tu compañero los conceptos identificados. Compartan ejemplos y aclaren dudas mutuamente.",
      share_phase_duration: 600, // 10 minutos en segundos
      share_phase_instructions: "Preparen una síntesis de su comprensión para compartir con el grupo.",
      system_prompt: "Eres un asistente de programación. Tu objetivo es ayudar a los estudiantes a comprender los conceptos básicos de programación, respondiendo a sus dudas y ofreciendo ejemplos claros.",
      is_active: true,
      created_at: "2025-03-15T10:00:00Z",
      updated_at: "2025-03-15T10:00:00Z"
    },
    {
      id: 302,
      course_id: 103,
      assignment_id: 204,
      user_id: 999,
      think_phase_duration: 900,
      think_phase_instructions: "Analiza los argumentos presentados. Identifica premisas, conclusiones, fortalezas y debilidades.",
      pair_phase_duration: 1200,
      pair_phase_instructions: "Comparte tu análisis con tu compañero. Comparen sus perspectivas y desarrollen un análisis conjunto más completo.",
      share_phase_duration: 600,
      share_phase_instructions: "Preparen una evaluación conjunta de los argumentos para presentar al grupo.",
      system_prompt: "Eres un asistente especializado en pensamiento crítico. Tu objetivo es ayudar a los estudiantes a analizar y evaluar argumentos, identificando falacias, sesgos y fortalezas argumentativas.",
      is_active: true,
      created_at: "2025-03-18T14:30:00Z",
      updated_at: "2025-03-18T14:30:00Z"
    }
  ];
  
  // Actividades disponibles de muestra
  export const sampleAvailableActivities = [
    {
      id: 401,
      tps_configuration_id: 301,
      name: "Introducción a la Programación - TPS",
      description: "Actividad colaborativa sobre conceptos básicos de programación utilizando el método Think-Pair-Share.",
      course_name: "Fundamentos de Programación",
      assignment_name: "Introducción a la Programación",
      start_date: "2025-03-20T08:00:00Z",
      end_date: "2025-04-15T23:59:59Z"
    },
    {
      id: 402,
      tps_configuration_id: 302,
      name: "Evaluación de Argumentos - TPS",
      description: "Actividad colaborativa para analizar y evaluar argumentos utilizando el método Think-Pair-Share.",
      course_name: "Pensamiento Crítico",
      assignment_name: "Evaluación de Argumentos",
      start_date: "2025-03-25T10:00:00Z",
      end_date: "2025-04-18T23:59:59Z"
    }
  ];
  
  // Salas de emparejamiento de muestra
  export const samplePairingRooms = [
    {
      id: 501,
      activity_id: 401,
      room_name: "Programación-Room-001",
      max_students: 2,
      current_students: 0,
      is_full: false,
      created_at: "2025-03-20T08:00:00Z"
    },
    {
      id: 502,
      activity_id: 401,
      room_name: "Programación-Room-002",
      max_students: 2,
      current_students: 0,
      is_full: false,
      created_at: "2025-03-20T08:05:00Z"
    },
    {
      id: 503,
      activity_id: 402,
      room_name: "Argumentos-Room-001",
      max_students: 2,
      current_students: 0,
      is_full: false,
      created_at: "2025-03-25T10:00:00Z"
    }
  ];
  
  // Exportar como un objeto para acceso fácil a todos los datos de muestra
  export const sampleData = {
    students: sampleStudents,
    courses: sampleCourses,
    assignments: sampleAssignments,
    tpsConfigurations: sampleTPSConfigurations,
    availableActivities: sampleAvailableActivities,
    pairingRooms: samplePairingRooms
  };