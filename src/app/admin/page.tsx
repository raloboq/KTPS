"use client";

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
}