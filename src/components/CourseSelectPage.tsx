/*'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMoodleToken, getMoodleUsername, getMoodleFullName } from '@/utils/moodleAuth';
//import styles from '../admin/adminPage.module.css';
import styles from '../app/admin/adminPage.module.css';
import Cookies from 'js-cookie';

interface Course {
  id: number;
  fullname: string;
  shortname: string;
}

interface Assignment {
  id: number;
  name: string;
  cmid: number;
  duedate: number;
}

export default function CourseSelectPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  // Obtener el nombre del usuario de forma segura (client-side only)
  useEffect(() => {
    setUserName(getMoodleFullName() || null);
  }, []);

  // Cargar los cursos al iniciar la página
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/moodle/get-courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los cursos');
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        setError('No se pudieron cargar los cursos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Cargar las actividades cuando se seleccione un curso
  useEffect(() => {
    if (!selectedCourseId) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/moodle/get-assignments?courseId=${selectedCourseId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener las actividades');
        }

        const data = await response.json();
        
        // Extraer las tareas del curso seleccionado
        const courseData = data.courses.find((course: any) => course.id === selectedCourseId);
        setAssignments(courseData?.assignments || []);
      } catch (error) {
        console.error('Error al cargar actividades:', error);
        setError('No se pudieron cargar las actividades. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedCourseId]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    setSelectedCourseId(courseId || null);
    setSelectedAssignmentId(null); // Resetear la actividad seleccionada
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = parseInt(e.target.value);
    setSelectedAssignmentId(assignmentId || null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedCourseId || !selectedAssignmentId) {
      setError('Por favor, seleccione un curso y una actividad');
      return;
    }

    // Guardar la selección en cookies para usarla en el panel de administración
    Cookies.set('selectedCourseId', selectedCourseId.toString(), { secure: true, sameSite: 'strict' });
    Cookies.set('selectedAssignmentId', selectedAssignmentId.toString(), { secure: true, sameSite: 'strict' });
    
    // Encontrar y guardar el nombre del curso y la actividad para mostrarlos en el panel
    const selectedCourse = courses.find(course => course.id === selectedCourseId);
    const selectedAssignment = assignments.find(assignment => assignment.id === selectedAssignmentId);
    
    if (selectedCourse) {
      Cookies.set('selectedCourseName', selectedCourse.fullname, { secure: true, sameSite: 'strict' });
    }
    
    if (selectedAssignment) {
      Cookies.set('selectedAssignmentName', selectedAssignment.name, { secure: true, sameSite: 'strict' });
    }

    // Redirigir al panel de administración
    router.push('/admin');
  };

  const handleLogout = () => {
    // Eliminar todas las cookies
    Object.keys(Cookies.get()).forEach(cookie => {
      Cookies.remove(cookie);
    });
    
    // Redirigir al login
    router.push('/login');
  };

  // Formatear fecha Unix a formato legible
  const formatDate = (unixTimestamp: number) => {
    if (!unixTimestamp) return 'Sin fecha';
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        {userName && <div className={styles.userName}>Bienvenido, {userName}</div>}
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>

      <h1 className={styles.title}>Selección de Curso y Actividad</h1>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.selectionForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="course">Seleccione un curso:</label>
          <select
            id="course"
            value={selectedCourseId || ''}
            onChange={handleCourseChange}
            className={styles.select}
            disabled={loading || courses.length === 0}
            required
          >
            <option value="">-- Seleccione un curso --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.fullname}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className={styles.inputGroup}>
            <label htmlFor="assignment">Seleccione una actividad:</label>
            <select
              id="assignment"
              value={selectedAssignmentId || ''}
              onChange={handleAssignmentChange}
              className={styles.select}
              disabled={loading || assignments.length === 0}
              required
            >
              <option value="">-- Seleccione una actividad --</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} (Fecha límite: {formatDate(assignment.duedate)})
                </option>
              ))}
            </select>
            {assignments.length === 0 && selectedCourseId && !loading && (
              <p className={styles.helpText}>No se encontraron actividades en este curso.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedCourseId || !selectedAssignmentId}
          className={styles.saveButton}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}*/
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '../app/admin/adminPage.module.css';

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  displayname?: string;
}

interface Assignment {
  id: number;
  name: string;
  cmid: number;
  duedate: number;
}

export default function CourseSelectPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  // Obtener el nombre del usuario de forma segura (client-side only)
  useEffect(() => {
    setUserName(Cookies.get('moodleFullName') || null);
    console.log('username',userName);
  }, []);

  // Cargar los cursos al iniciar la página
  useEffect(() => {
    const fetchCourses = async () => {
      console.log('primero');
      try {
        console.log('Fetching courses...');
        const response = await fetch('/api/moodle/get-courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los cursos');
        }

        const data = await response.json();
        console.log('Cursos recibidos:', data.courses);
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        setError('No se pudieron cargar los cursos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Cargar las actividades cuando se seleccione un curso
  useEffect(() => {
    if (!selectedCourseId) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        console.log(`Fetching assignments for courseId: ${selectedCourseId}`);
        const response = await fetch(`/api/moodle/get-assignments?courseId=${selectedCourseId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener las actividades');
        }

        const data = await response.json();
        console.log('Asignaciones recibidas:', data);
        
        // Extraer las tareas del curso seleccionado
        const courseData = data.courses.find((course: any) => course.id === selectedCourseId);
        console.log('CourseData:', courseData);
        setAssignments(courseData?.assignments || []);
      } catch (error) {
        console.error('Error al cargar actividades:', error);
        setError('No se pudieron cargar las actividades. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedCourseId]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    console.log('Selected course ID:', courseId);
    setSelectedCourseId(courseId || null);
    setSelectedAssignmentId(null); // Resetear la actividad seleccionada
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = parseInt(e.target.value);
    console.log('Selected assignment ID:', assignmentId);
    setSelectedAssignmentId(assignmentId || null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedCourseId || !selectedAssignmentId) {
      setError('Por favor, seleccione un curso y una actividad');
      return;
    }

    // Guardar la selección en cookies para usarla en el panel de administración
    Cookies.set('selectedCourseId', selectedCourseId.toString(), { secure: true, sameSite: 'strict' });
    Cookies.set('selectedAssignmentId', selectedAssignmentId.toString(), { secure: true, sameSite: 'strict' });
    
    // Encontrar y guardar el nombre del curso y la actividad para mostrarlos en el panel
    const selectedCourse = courses.find(course => course.id === selectedCourseId);
    const selectedAssignment = assignments.find(assignment => assignment.id === selectedAssignmentId);
    
    if (selectedCourse) {
      Cookies.set('selectedCourseName', selectedCourse.fullname || selectedCourse.displayname || selectedCourse.shortname, { secure: true, sameSite: 'strict' });
    }
    
    if (selectedAssignment) {
      Cookies.set('selectedAssignmentName', selectedAssignment.name, { secure: true, sameSite: 'strict' });
    }

    // Redirigir al panel de administración
    router.push('/admin');
  };

  const handleLogout = () => {
    // Eliminar todas las cookies
    Object.keys(Cookies.get()).forEach(cookie => {
      Cookies.remove(cookie);
    });
    
    // Redirigir al login
    router.push('/login');
  };

  // Formatear fecha Unix a formato legible
  const formatDate = (unixTimestamp: number) => {
    if (!unixTimestamp) return 'Sin fecha';
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        {userName && <div className={styles.userName}>Bienvenido, {userName}</div>}
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>

      <h1 className={styles.title}>Selección de Curso y Actividad</h1>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.selectionForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="course">Seleccione un curso:</label>
          <select
            id="course"
            value={selectedCourseId || ''}
            onChange={handleCourseChange}
            className={styles.select}
            disabled={loading || courses.length === 0}
            required
          >
            <option value="">-- Seleccione un curso --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.fullname || course.displayname || course.shortname}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className={styles.inputGroup}>
            <label htmlFor="assignment">Seleccione una actividad:</label>
            <select
              id="assignment"
              value={selectedAssignmentId || ''}
              onChange={handleAssignmentChange}
              className={styles.select}
              disabled={loading || assignments.length === 0}
              required
            >
              <option value="">-- Seleccione una actividad --</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} (Fecha límite: {formatDate(assignment.duedate)})
                </option>
              ))}
            </select>
            {assignments.length === 0 && selectedCourseId && !loading && (
              <p className={styles.helpText}>No se encontraron actividades en este curso.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedCourseId || !selectedAssignmentId}
          className={styles.saveButton}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}