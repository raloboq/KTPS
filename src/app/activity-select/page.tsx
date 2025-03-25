'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './activitySelect.module.css';

interface Activity {
  id: number;
  name: string;
  description: string;
  course_name: string;
  assignment_name: string;
  end_date: string;
}

export default function ActivitySelectPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();
  const studentName = Cookies.get('studentFullName') || 'Estudiante';

  // Verificar si estamos en modo demo
  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-check');
        if (response.ok) {
          const data = await response.json();
          setIsDemoMode(data.isDemoMode);
        }
      } catch (error) {
        console.error('Error al verificar modo demo:', error);
      }
    };

    checkDemoMode();
  }, []);

  // Cargar actividades disponibles
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Cargando actividades disponibles...');
        const response = await fetch('/api/student/available-activities');
        
        // Log detallado para depuración
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error respuesta:', errorText);
          throw new Error('Error al cargar actividades');
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success) {
          setActivities(data.activities || []);
        } else {
          setError(data.error || 'Error al cargar las actividades disponibles');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error de conexión. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleJoinActivity = async () => {
    if (!selectedActivityId) {
      setError('Por favor, seleccione una actividad');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      // En modo demo, simplificar el proceso
      if (isDemoMode) {
        // Simular una respuesta exitosa
        Cookies.set('roomId', '501', { secure: true, sameSite: 'strict' });
        Cookies.set('roomName', 'Demo-Room-001', { secure: true, sameSite: 'strict' });
        Cookies.set('activityId', selectedActivityId.toString(), { secure: true, sameSite: 'strict' });
        
        // Redirigir al estudiante a la fase de Think
        router.push('/think');
        return;
      }

      // Proceso normal para ambiente no-demo
      const response = await fetch('/api/student/join-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: selectedActivityId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Guardar información de la sala asignada
        Cookies.set('roomId', data.roomId.toString(), { secure: true, sameSite: 'strict' });
        Cookies.set('roomName', data.roomName, { secure: true, sameSite: 'strict' });
        Cookies.set('activityId', selectedActivityId.toString(), { secure: true, sameSite: 'strict' });

        // Redirigir al estudiante a la fase de Think
        router.push('/think');
      } else {
        setError(data.error || 'Error al unirse a la actividad');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setJoining(false);
    }
  };

  const handleLogout = () => {
    // Eliminar todas las cookies de estudiante
    ['studentMoodleToken', 'studentUsername', 'studentEmail', 
     'studentFullName', 'studentId', 'roomId', 'roomName', 'activityId']
      .forEach(cookie => Cookies.remove(cookie));
    
    // Redirigir a la página de login
    router.push('/student-login');
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Selección de Actividad</h1>
        <div className={styles.userInfo}>
          <span>Bienvenido, {studentName}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className={styles.logoContainer}>
        <Image
          src="https://virtual.konradlorenz.edu.co/pluginfile.php/1/theme_school/logo/1724229010/Logo-05.png"
          alt="Logo Konrad Lorenz"
          width={150}
          height={75}
          className={styles.logo}
        />
      </div>

      {isDemoMode && (
        <div className={styles.demoInfoBox}>
          <h3>Modo Demostración Activo</h3>
          <p>Estás en modo demostración. Las actividades mostradas son ejemplos para pruebas.</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Cargando actividades disponibles...</div>
      ) : activities.length === 0 ? (
        <div className={styles.noActivities}>
          <p>No hay actividades disponibles actualmente.</p>
          <p>Por favor, consulta con tu profesor.</p>
        </div>
      ) : (
        <>
          <div className={styles.instructions}>
            <p>Selecciona una actividad y haz clic en "Unirse a la Actividad".</p>
            <p>Serás asignado automáticamente a una sala para trabajar con otro estudiante.</p>
          </div>

          <div className={styles.activityList}>
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`${styles.activityCard} ${selectedActivityId === activity.id ? styles.selectedActivity : ''}`}
                onClick={() => setSelectedActivityId(activity.id)}
              >
                <h3 className={styles.activityName}>{activity.name}</h3>
                <div className={styles.activityDetails}>
                  <p><strong>Curso:</strong> {activity.course_name}</p>
                  <p><strong>Actividad:</strong> {activity.assignment_name}</p>
                  <p><strong>Descripción:</strong> {activity.description}</p>
                  <p><strong>Disponible hasta:</strong> {formatDate(activity.end_date)}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleJoinActivity}
            disabled={!selectedActivityId || joining}
            className={styles.joinButton}
          >
            {joining ? 'Uniéndose...' : 'Unirse a la Actividad'}
          </button>
        </>
      )}
    </div>
  );
}