'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './activityCompleted.module.css';

export default function ActivityCompletedPage() {
  const router = useRouter();

  // Limpiar cookies relacionadas con la actividad al finalizar
  useEffect(() => {
    // Mantener la cookie de autenticación pero limpiar las de la actividad
    Cookies.remove('roomId');
    Cookies.remove('roomName');
    Cookies.remove('activityId');
    
    // Más cookies específicas de la actividad si las hubiera
  }, []);

  const handleBackToActivities = () => {
    router.push('/activity-select');
  };

  return (
    <div className={styles.container}>
      <div className={styles.completionBox}>
        <div className={styles.checkmarkContainer}>
          <div className={styles.checkmark}>✓</div>
        </div>
        
        <h1 className={styles.title}>¡Actividad Completada!</h1>
        
        <p className={styles.message}>
          Has completado exitosamente todas las fases de la actividad Think-Pair-Share.
          Gracias por tu participación y valiosas contribuciones.
        </p>
        
        <p className={styles.submessage}>
          Tu profesor podrá ver tu trabajo y el de tus compañeros para evaluar
          el aprendizaje colaborativo.
        </p>
        
        <button 
          className={styles.button}
          onClick={handleBackToActivities}
        >
          Volver a Selección de Actividades
        </button>
      </div>
    </div>
  );
}