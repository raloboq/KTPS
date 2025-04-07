// src/app/api/student/join-activity/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { IS_DEMO_MODE, assignStudentToRoomDemo } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Obtener datos del estudiante de las cookies
    const cookieStore = cookies();
    const studentIdStr = cookieStore.get('studentId')?.value;
    const studentName = cookieStore.get('studentFullName')?.value;
    
    // Logs para depuración
    console.log('Unirse a actividad:');
    console.log('- Modo demo:', IS_DEMO_MODE);
    console.log('- studentId cookie:', studentIdStr);
    console.log('- studentFullName cookie:', studentName);
    
    // En modo demo, permitir acceso incluso sin autenticación completa
    if (IS_DEMO_MODE) {
      // Obtener el activityId de la solicitud
      const requestData = await request.json();
      const activityId = requestData.activityId;
      
      console.log('- activityId solicitado:', activityId);
      
      if (!activityId) {
        return NextResponse.json({ 
          success: false, 
          error: 'ID de actividad no proporcionado'
        }, { status: 400 });
      }
      
      // Crear un ID de estudiante si no existe
      let studentId = 1001;
      if (studentIdStr) {
        studentId = parseInt(studentIdStr);
      }
      
      // Usar la función demo para asignar sala
      const demoResult = assignStudentToRoomDemo(studentId, activityId);
      console.log('Resultado asignación demo:', demoResult);
      
      return NextResponse.json(demoResult);
    }
    
    // Verificación de autenticación para modo no-demo
    if (!studentIdStr || !studentName) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró información del estudiante'
      }, { status: 401 });
    }
    
    const studentId = parseInt(studentIdStr);
    
    // Obtener el activityId de la solicitud
    const { activityId } = await request.json();
    
    if (!activityId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de actividad no proporcionado'
      }, { status: 400 });
    }

    // Si no estamos en modo demo, usar la base de datos real
    const client = await pool.connect();
    
    try {
      // Iniciar transacción
      await client.query('BEGIN');
      
      // Verificar que el estudiante no esté ya en una sala para esta actividad
      const existingAssignment = await client.query(`
        SELECT sra.id, pr.room_name, pr.id as room_id
        FROM student_room_assignments sra
        JOIN pairing_rooms pr ON sra.room_id = pr.id
        WHERE sra.student_id = $1
          AND pr.activity_id = $2
          AND sra.status = 'active'
      `, [studentId, activityId]);
      
      // Si ya está asignado, devolver esa asignación
      if (existingAssignment && existingAssignment.rowCount && existingAssignment.rowCount > 0) {
        await client.query('COMMIT');
        return NextResponse.json({
          success: true,
          roomId: existingAssignment.rows[0].room_id,
          roomName: existingAssignment.rows[0].room_name,
          message: 'Ya estás asignado a una sala para esta actividad'
        });
      }
      
      // Buscar una sala disponible (no llena)
      const availableRoom = await client.query(`
        SELECT id, room_name, current_students
        FROM pairing_rooms
        WHERE activity_id = $1
          AND is_full = FALSE
        LIMIT 1
      `, [activityId]);
      
      let roomId, roomName;
      
      if (availableRoom && availableRoom.rowCount && availableRoom.rowCount > 0) {
        // Unirse a sala existente
        roomId = availableRoom.rows[0].id;
        roomName = availableRoom.rows[0].room_name;
        
        // Actualizar contador de estudiantes
        const newCount = availableRoom.rows[0].current_students + 1;
        const isFull = newCount >= 2; // Normalmente son 2 estudiantes por sala
        
        await client.query(`
          UPDATE pairing_rooms
          SET current_students = $1, is_full = $2
          WHERE id = $3
        `, [newCount, isFull, roomId]);
      } else {
        // Crear una nueva sala
        const roomNameBase = `Activity-${activityId}-Room-`;
        
        // Obtener el número de la siguiente sala
        const roomCount = await client.query(`
          SELECT COUNT(*) as count
          FROM pairing_rooms
          WHERE activity_id = $1
        `, [activityId]);
        
        const roomNumber = (parseInt(roomCount.rows[0].count) + 1).toString().padStart(3, '0');
        roomName = `${roomNameBase}${roomNumber}`;
        
        // Insertar la nueva sala
        const newRoom = await client.query(`
          INSERT INTO pairing_rooms (activity_id, room_name, current_students, is_full)
          VALUES ($1, $2, 1, FALSE)
          RETURNING id
        `, [activityId, roomName]);
        
        roomId = newRoom.rows[0].id;
      }
      
      // Asignar estudiante a la sala
      await client.query(`
        INSERT INTO student_room_assignments (student_id, room_id, status)
        VALUES ($1, $2, 'active')
      `, [studentId, roomId]);
      
      // Confirmar transacción
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        roomId,
        roomName,
        message: 'Asignado a sala correctamente'
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Liberar cliente
      client.release();
    }
  } catch (errorr) {
    console.error('Error al unirse a la actividad:', errorr);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al unirse a la actividad. Por favor, intente nuevamente.',errorr
    }, { status: 500 });
  }
}