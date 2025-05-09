/*
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './adminPage.module.css';
import LogoutButton from '@/components/LogoutButton';
import ConfigurationList from '@/components/ConfigurationList';
import ConfigurationForm from '@/components/ConfigurationForm';
import StatsPanel from '@/components/StatsPanel';
import { checkExistingConfiguration } from '@/services/tps-config.service';

type AdminView = 'list' | 'create' | 'edit' | 'stats';

export default function AdminPage() {
  const [view, setView] = useState<AdminView>('list');
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Información del curso y actividad seleccionados
  const [courseId, setCourseId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [assignmentName, setAssignmentName] = useState<string>('');

  // Verificar que se haya seleccionado un curso y actividad
  useEffect(() => {
    const courseIdStr = Cookies.get('selectedCourseId');
    const assignmentIdStr = Cookies.get('selectedAssignmentId');
    const courseNameStr = Cookies.get('selectedCourseName');
    const assignmentNameStr = Cookies.get('selectedAssignmentName');

    if (!courseIdStr || !assignmentIdStr) {
      // Redirigir a la página de selección de curso si no hay selección
      router.push('/course-select');
      return;
    }

    setCourseId(parseInt(courseIdStr));
    setAssignmentId(parseInt(assignmentIdStr));
    setCourseName(courseNameStr || 'Curso seleccionado');
    setAssignmentName(assignmentNameStr || 'Actividad seleccionada');

    // Verificar si ya existe una configuración para este curso/actividad
    const checkConfig = async () => {
      if (!courseIdStr || !assignmentIdStr) return;
      
      setLoading(true);
      try {
        const response = await checkExistingConfiguration(
          parseInt(courseIdStr),
          parseInt(assignmentIdStr)
        );
        
        // Si existe una configuración, mostrar la lista
        // Si no existe, mostrar el formulario de creación
        if (response.success && response.data) {
          setView('list');
        } else {
          setView('create');
        }
      } catch (error) {
        console.error('Error al verificar configuración existente:', error);
        setError('Error al verificar configuración existente');
      } finally {
        setLoading(false);
      }
    };

    checkConfig();
  }, [router]);

  // Cambiar a la vista de edición para una configuración específica
  const handleEditConfig = (configId: number) => {
    setSelectedConfigId(configId);
    setView('edit');
  };

  // Cambiar a la vista de estadísticas para una configuración específica
  const handleViewStats = (configId: number) => {
    setSelectedConfigId(configId);
    setView('stats');
  };

  // Cancelar la operación actual y volver a la lista
  const handleCancel = () => {
    setSelectedConfigId(null);
    setView('list');
  };

  // Después de guardar exitosamente, volver a la lista
  const handleSaved = () => {
    setSelectedConfigId(null);
    setView('list');
  };

  // Cambiar de curso/actividad
  const handleChangeCourse = () => {
    router.push('/course-select');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!courseId || !assignmentId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          No se ha seleccionado un curso y actividad.
          <button onClick={handleChangeCourse} className={styles.linkButton}>
            Seleccionar curso y actividad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de Administración TPS</h1>
        <LogoutButton />
      </div>

      <div className={styles.contextBar}>
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
        <button onClick={handleChangeCourse} className={styles.changeCourseButton}>
          Cambiar
        </button>
      </div>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <div className={styles.mainContent}>
        {view === 'list' && (
          <>
            <div className={styles.actionsBar}>
              <button 
                onClick={() => setView('create')}
                className={styles.createButton}
              >
                Nueva Configuración
              </button>
            </div>
            <ConfigurationList 
              onEditConfig={handleEditConfig}
              onViewStats={handleViewStats}
            />
          </>
        )}

        {view === 'create' && courseId && assignmentId && (
          <ConfigurationForm
            courseId={courseId}
            assignmentId={assignmentId}
            courseName={courseName}
            assignmentName={assignmentName}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {view === 'edit' && selectedConfigId && (
          <ConfigurationForm
            courseId={courseId}
            assignmentId={assignmentId}
            courseName={courseName}
            assignmentName={assignmentName}
            configId={selectedConfigId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {view === 'stats' && selectedConfigId && (
          <StatsPanel
            configId={selectedConfigId}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
  */
 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './adminPage.module.css';
import LogoutButton from '@/components/LogoutButton';
import ConfigurationList from '@/components/ConfigurationList';
import ConfigurationForm from '@/components/ConfigurationForm';
import StatsPanel from '@/components/StatsPanel';
import ReflectionsGrading from "@/components/ReflectionsGrading";
//import ReflectionsGradingPanel from '@/components/ReflectionsGrading';
import { checkExistingConfiguration } from '@/services/tps-config.service';

type AdminView = 'list' | 'create' | 'edit' | 'stats' | 'grading';

export default function AdminPage() {
  const [view, setView] = useState<AdminView>('list');
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Información del curso y actividad seleccionados
  const [courseId, setCourseId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [assignmentName, setAssignmentName] = useState<string>('');

  // Verificar que se haya seleccionado un curso y actividad
  useEffect(() => {
    const courseIdStr = Cookies.get('selectedCourseId');
    const assignmentIdStr = Cookies.get('selectedAssignmentId');
    const courseNameStr = Cookies.get('selectedCourseName');
    const assignmentNameStr = Cookies.get('selectedAssignmentName');

    if (!courseIdStr || !assignmentIdStr) {
      // Redirigir a la página de selección de curso si no hay selección
      router.push('/course-select');
      return;
    }

    setCourseId(parseInt(courseIdStr));
    setAssignmentId(parseInt(assignmentIdStr));
    setCourseName(courseNameStr || 'Curso seleccionado');
    setAssignmentName(assignmentNameStr || 'Actividad seleccionada');

    // Verificar si ya existe una configuración para este curso/actividad
    const checkConfig = async () => {
      if (!courseIdStr || !assignmentIdStr) return;
      
      setLoading(true);
      try {
        const response = await checkExistingConfiguration(
          parseInt(courseIdStr),
          parseInt(assignmentIdStr)
        );
        
        // Si existe una configuración, mostrar la lista
        // Si no existe, mostrar el formulario de creación
        if (response.success && response.data) {
          setView('list');
        } else {
          setView('create');
        }
      } catch (error) {
        console.error('Error al verificar configuración existente:', error);
        setError('Error al verificar configuración existente');
      } finally {
        setLoading(false);
      }
    };

    checkConfig();
  }, [router]);

  // Cambiar a la vista de edición para una configuración específica
  const handleEditConfig = (configId: number) => {
    setSelectedConfigId(configId);
    setView('edit');
  };

  // Cambiar a la vista de estadísticas para una configuración específica
  const handleViewStats = (configId: number) => {
    setSelectedConfigId(configId);
    setView('stats');
  };

  // Cambiar a la vista de calificaciones para una configuración específica
  const handleViewGrading = (configId: number) => {
    setSelectedConfigId(configId);
    setView('grading');
  };

  // Cancelar la operación actual y volver a la lista
  const handleCancel = () => {
    setSelectedConfigId(null);
    setView('list');
  };

  // Después de guardar exitosamente, volver a la lista
  const handleSaved = () => {
    setSelectedConfigId(null);
    setView('list');
  };

  // Cambiar de curso/actividad
  const handleChangeCourse = () => {
    router.push('/course-select');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!courseId || !assignmentId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          No se ha seleccionado un curso y actividad.
          <button onClick={handleChangeCourse} className={styles.linkButton}>
            Seleccionar curso y actividad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de Administración TPS</h1>
        <LogoutButton />
      </div>

      <div className={styles.contextBar}>
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
        <button onClick={handleChangeCourse} className={styles.changeCourseButton}>
          Cambiar
        </button>
      </div>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <div className={styles.mainContent}>
        {view === 'list' && (
          <>
            <div className={styles.actionsBar}>
              <button 
                onClick={() => setView('create')}
                className={styles.createButton}
              >
                Nueva Configuración
              </button>
            </div>
            <ConfigurationList 
              onEditConfig={handleEditConfig}
              onViewStats={handleViewStats}
              onViewGrading={handleViewGrading as any}
            />
          </>
        )}

        {view === 'create' && courseId && assignmentId && (
          <ConfigurationForm
            courseId={courseId}
            assignmentId={assignmentId}
            courseName={courseName}
            assignmentName={assignmentName}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {view === 'edit' && selectedConfigId && (
          <ConfigurationForm
            courseId={courseId}
            assignmentId={assignmentId}
            courseName={courseName}
            assignmentName={assignmentName}
            configId={selectedConfigId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {view === 'stats' && selectedConfigId && (
          <StatsPanel
            configId={selectedConfigId}
            onBack={handleCancel}
          />
        )}

{view === 'grading' && selectedConfigId && (
  <ReflectionsGrading
    configId={selectedConfigId}
    //onBack={handleCancel}
  />
)}

        
      </div>
    </div>
  );
}