/*"use client";

import { useEffect, useState } from 'react';
import styles from './adminPage.module.css';

interface PhaseConfig {
  id: string;
  name: string;
  duration: number;
  instructions: string;
}

interface SystemPrompt {
  prompt: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<PhaseConfig[]>([
    {
      id: 'think',
      name: 'Fase de Reflexión',
      duration: 900,
      instructions: 'En esta fase deberás reflexionar sobre...'
    },
    {
      id: 'pair',
      name: 'Fase de Colaboración',
      duration: 1200,
      instructions: 'En esta fase trabajarás con un compañero para...'
    }
  ]);

  const [systemPrompt, setSystemPrompt] = useState<SystemPrompt>({
    prompt: 'Eres un asistente amable y servicial que ayuda a los estudiantes a reflexionar sobre su proceso de aprendizaje...'
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) throw new Error('Error al cargar la configuración');
        
        const data = await response.json();
        setPhases(data.phases);
        setSystemPrompt(data.systemPrompt);
      } catch (error) {
        console.error('Error:', error);
        setMessage({ 
          text: 'Error al cargar la configuración', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const handlePhaseUpdate = (index: number, field: keyof PhaseConfig, value: string | number) => {
    const newPhases = [...phases];
    newPhases[index] = {
      ...newPhases[index],
      [field]: value
    };
    setPhases(newPhases);
  };

  const handlePromptUpdate = (value: string) => {
    setSystemPrompt({ prompt: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        // Validar datos antes de enviar
    if (!phases.every(phase => phase.id && phase.name && phase.duration && phase.instructions)) {
        throw new Error('Por favor, completa todos los campos de las fases');
      }
  
      if (!systemPrompt.prompt) {
        throw new Error('Por favor, completa el prompt del sistema');
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phases,
          systemPrompt 
        }),
      });

      if (!response.ok) throw new Error('Error al guardar la configuración');

      setMessage({ text: 'Configuración guardada exitosamente', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error al guardar la configuración', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Cargando configuración...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administración</h1>
      
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.phasesGrid}>
        {phases.map((phase, index) => (
          <div key={phase.id} className={styles.phaseCard}>
            <h2 className={styles.phaseTitle}>{phase.name}</h2>
            
            <div className={styles.inputGroup}>
              <label>Duración (minutos):</label>
              <input
                type="number"
                value={phase.duration / 60}
                onChange={(e) => handlePhaseUpdate(index, 'duration', parseInt(e.target.value) * 60)}
                min="1"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Instrucciones:</label>
              <textarea
                value={phase.instructions}
                onChange={(e) => handlePhaseUpdate(index, 'instructions', e.target.value)}
                className={styles.textarea}
                rows={4}
              />
            </div>
          </div>
        ))}

        <div className={styles.phaseCard}>
          <h2 className={styles.phaseTitle}>Configuración del Chatbot</h2>
          <div className={styles.inputGroup}>
            <label>Prompt del Sistema:</label>
            <textarea
              value={systemPrompt.prompt}
              onChange={(e) => handlePromptUpdate(e.target.value)}
              className={styles.textarea}
              rows={8}
              placeholder="Escribe aquí el prompt que definirá el comportamiento del chatbot..."
            />
            <p className={styles.helpText}>
              Este texto definirá la personalidad y comportamiento del chatbot. 
              Sé específico en cómo quieres que interactúe con los estudiantes.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={styles.saveButton}
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}*/
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