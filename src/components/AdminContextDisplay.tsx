'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from '@/app/admin/adminPage.module.css';

export default function AdminContextDisplay() {
  const [courseName, setCourseName] = useState<string>('');
  const [assignmentName, setAssignmentName] = useState<string>('');

  useEffect(() => {
    // Obtener la información del curso y actividad seleccionados
    const storedCourseName = Cookies.get('selectedCourseName');
    const storedAssignmentName = Cookies.get('selectedAssignmentName');
    
    if (storedCourseName) {
      setCourseName(storedCourseName);
    }
    
    if (storedAssignmentName) {
      setAssignmentName(storedAssignmentName);
    }
  }, []);

  if (!courseName || !assignmentName) {
    return null;
  }

  return (
    <div className={styles.contextDisplay}>
      <h2 className={styles.contextTitle}>Configurando actividad para:</h2>
      <div className={styles.contextInfo}>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Curso:</span>
          <span className={styles.contextValue}>{courseName}</span>
        </div>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Actividad:</span>
          <span className={styles.contextValue}>{assignmentName}</span>
        </div>
      </div>
    </div>
  );
}