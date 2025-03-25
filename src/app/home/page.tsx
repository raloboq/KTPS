'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './home.module.css';

export default function HomePage() {
  const router = useRouter();

  const handleStudentAccess = () => {
    router.push('/student-login');
  };

  const handleTeacherAccess = () => {
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src="https://virtual.konradlorenz.edu.co/pluginfile.php/1/theme_school/logo/1724229010/Logo-05.png"
          alt="Logo Konrad Lorenz"
          width={250}
          height={125}
          className={styles.logo}
        />
        <h1 className={styles.title}>Think-Pair-Share Colaborativo</h1>
        <p className={styles.subtitle}>Plataforma de aprendizaje colaborativo</p>
      </div>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Soy Estudiante</h2>
          <p className={styles.cardDescription}>
            Accede para participar en actividades colaborativas. 
            Serás asignado automáticamente a una sala para colaborar 
            con otro estudiante.
          </p>
          <button 
            onClick={handleStudentAccess}
            className={`${styles.button} ${styles.studentButton}`}
          >
            Acceso Estudiantes
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Soy Profesor</h2>
          <p className={styles.cardDescription}>
            Accede para crear y administrar actividades colaborativas.
            Configura los parámetros de las fases Think-Pair-Share y 
            monitorea el progreso de tus estudiantes.
          </p>
          <button 
            onClick={handleTeacherAccess}
            className={`${styles.button} ${styles.teacherButton}`}
          >
            Acceso Profesores
          </button>
        </div>
      </div>

      <div className={styles.infoContainer}>
        <h2>¿Qué es Think-Pair-Share?</h2>
        <p>
          Think-Pair-Share es una estrategia de aprendizaje colaborativo 
          que permite a los estudiantes reflexionar individualmente sobre un tema, 
          luego discutirlo en parejas y finalmente compartir sus ideas con el grupo.
        </p>
        <h3>Fases del proceso:</h3>
        <div className={styles.phases}>
          <div className={styles.phase}>
            <h4>1. Think (Reflexión)</h4>
            <p>Reflexiona individualmente sobre el tema propuesto.</p>
          </div>
          <div className={styles.phase}>
            <h4>2. Pair (Parejas)</h4>
            <p>Discute tus ideas con un compañero y lleguen a conclusiones comunes.</p>
          </div>
          <div className={styles.phase}>
            <h4>3. Share (Compartir)</h4>
            <p>Comparte las conclusiones de tu grupo con los demás.</p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Universidad Konrad Lorenz. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}