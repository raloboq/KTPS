'use client';

import { useState, useEffect } from 'react';
import { TPSConfigFormData, TPSConfigurationWithDetails } from '@/types/models';
import { 
  createConfiguration, 
  getConfigurationById, 
  updateConfiguration, 
  checkExistingConfiguration 
} from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';

interface ConfigFormProps {
  courseId: number;
  assignmentId: number;
  courseName: string;
  assignmentName: string;
  configId?: number; // Si se proporciona, es modo edición
  onSaved: () => void;
  onCancel: () => void;
}

export default function ConfigurationForm({
  courseId,
  assignmentId,
  courseName,
  assignmentName,
  configId,
  onSaved,
  onCancel
}: ConfigFormProps) {
  // Estado inicial del formulario
  const initialFormState: TPSConfigFormData = {
    thinkPhaseDuration: 15, // 15 minutos
    thinkPhaseInstructions: '',
    pairPhaseDuration: 20, // 20 minutos
    pairPhaseInstructions: '',
    sharePhaseDuration: 10, // 10 minutos
    sharePhaseInstructions: '',
    systemPrompt: '',
  };

  const [formData, setFormData] = useState<TPSConfigFormData>(initialFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingConfig, setExistingConfig] = useState<TPSConfigurationWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'think' | 'pair' | 'share' | 'bot'>('think');

  // Cargar configuración existente si estamos en modo edición
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (configId) {
          // Modo edición: cargar configuración existente
          const response = await getConfigurationById(configId);
          if (response.success && response.data) {
            const config = response.data;
            setFormData({
              thinkPhaseDuration: Math.floor(config.think_phase_duration / 60), // convertir segundos a minutos
              thinkPhaseInstructions: config.think_phase_instructions,
              pairPhaseDuration: Math.floor(config.pair_phase_duration / 60),
              pairPhaseInstructions: config.pair_phase_instructions,
              sharePhaseDuration: Math.floor(config.share_phase_duration / 60),
              sharePhaseInstructions: config.share_phase_instructions,
              systemPrompt: config.system_prompt,
            });
          } else {
            setError('No se pudo cargar la configuración');
          }
        } else {
          // Modo creación: verificar si ya existe una configuración para este curso/actividad
          const response = await checkExistingConfiguration(courseId, assignmentId);
          if (response.success && response.data) {
            setExistingConfig(response.data);
          }
        }
      } catch (error) {
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [configId, courseId, assignmentId]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Duration') ? parseInt(value) : value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let response;
      
      if (configId) {
        // Actualizar configuración existente
        response = await updateConfiguration(configId, formData);
      } else {
        // Crear nueva configuración
        response = await createConfiguration(formData, courseId, assignmentId);
      }

      if (response.success) {
        setMessage('Configuración guardada exitosamente');
        onSaved(); // Notificar al componente padre
      } else {
        setError(response.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intente nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Si ya existe una configuración activa y estamos en modo creación
  if (existingConfig && !configId) {
    return (
      <div className={styles.configFormContainer}>
        <h2 className={styles.subtitle}>Configuración Existente</h2>
        <div className={styles.existingConfigMessage}>
          <p>Ya existe una configuración activa para este curso y actividad.</p>
          <p>Por favor, edite la configuración existente o desactívela antes de crear una nueva.</p>
          <div className={styles.buttonGroup}>
            <button 
              onClick={onCancel}
              className={styles.secondaryButton}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.configFormContainer}>
      <h2 className={styles.subtitle}>
        {configId ? 'Editar Configuración TPS' : 'Nueva Configuración TPS'}
      </h2>
      
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
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}
      
      {message && (
        <div className={`${styles.message} ${styles.success}`}>
          {message}
        </div>
      )}
      
      <div className={styles.formTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'think' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('think')}
        >
          Fase Think
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'pair' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pair')}
        >
          Fase Pair
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'share' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('share')}
        >
          Fase Share
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'bot' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('bot')}
        >
          Configuración Chatbot
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.configForm}>
        {/* Fase Think */}
        <div className={`${styles.tabContent} ${activeTab === 'think' ? styles.activeTabContent : ''}`}>
          <h3 className={styles.phaseTitle}>Fase de Reflexión Individual (Think)</h3>
          
          <div className={styles.inputGroup}>
            <label htmlFor="thinkPhaseDuration">Duración (minutos):</label>
            <input
              type="number"
              id="thinkPhaseDuration"
              name="thinkPhaseDuration"
              value={formData.thinkPhaseDuration}
              onChange={handleInputChange}
              min="1"
              max="120"
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="thinkPhaseInstructions">Instrucciones para los estudiantes:</label>
            <textarea
              id="thinkPhaseInstructions"
              name="thinkPhaseInstructions"
              value={formData.thinkPhaseInstructions}
              onChange={handleInputChange}
              rows={6}
              required
              placeholder="Escribe aquí las instrucciones para la fase de reflexión individual..."
              className={styles.textarea}
            />
            <p className={styles.helpText}>
              Estas instrucciones se mostrarán a los estudiantes durante la fase de reflexión individual.
              Explica claramente qué deben hacer y qué se espera de ellos.
            </p>
          </div>
        </div>
        
        {/* Fase Pair */}
        <div className={`${styles.tabContent} ${activeTab === 'pair' ? styles.activeTabContent : ''}`}>
          <h3 className={styles.phaseTitle}>Fase de Discusión en Parejas (Pair)</h3>
          
          <div className={styles.inputGroup}>
            <label htmlFor="pairPhaseDuration">Duración (minutos):</label>
            <input
              type="number"
              id="pairPhaseDuration"
              name="pairPhaseDuration"
              value={formData.pairPhaseDuration}
              onChange={handleInputChange}
              min="1"
              max="120"
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="pairPhaseInstructions">Instrucciones para los estudiantes:</label>
            <textarea
              id="pairPhaseInstructions"
              name="pairPhaseInstructions"
              value={formData.pairPhaseInstructions}
              onChange={handleInputChange}
              rows={6}
              required
              placeholder="Escribe aquí las instrucciones para la fase de discusión en parejas..."
              className={styles.textarea}
            />
            <p className={styles.helpText}>
              Estas instrucciones se mostrarán a los estudiantes durante la fase de discusión en parejas.
              Explica cómo deben colaborar y qué deben producir juntos.
            </p>
          </div>
        </div>
        
        {/* Fase Share */}
        <div className={`${styles.tabContent} ${activeTab === 'share' ? styles.activeTabContent : ''}`}>
          <h3 className={styles.phaseTitle}>Fase de Compartir (Share)</h3>
          
          <div className={styles.inputGroup}>
            <label htmlFor="sharePhaseDuration">Duración (minutos):</label>
            <input
              type="number"
              id="sharePhaseDuration"
              name="sharePhaseDuration"
              value={formData.sharePhaseDuration}
              onChange={handleInputChange}
              min="1"
              max="120"
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="sharePhaseInstructions">Instrucciones para los estudiantes:</label>
            <textarea
              id="sharePhaseInstructions"
              name="sharePhaseInstructions"
              value={formData.sharePhaseInstructions}
              onChange={handleInputChange}
              rows={6}
              required
              placeholder="Escribe aquí las instrucciones para la fase de compartir..."
              className={styles.textarea}
            />
            <p className={styles.helpText}>
              Estas instrucciones se mostrarán a los estudiantes durante la fase de compartir.
              Explica cómo deben presentar sus conclusiones y qué tipo de retroalimentación se espera.
            </p>
          </div>
        </div>
        
        {/* Configuración del Chatbot */}
        <div className={`${styles.tabContent} ${activeTab === 'bot' ? styles.activeTabContent : ''}`}>
          <h3 className={styles.phaseTitle}>Configuración del Chatbot</h3>
          
          <div className={styles.inputGroup}>
            <label htmlFor="systemPrompt">Prompt del Sistema:</label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleInputChange}
              rows={10}
              required
              placeholder="Escribe aquí el prompt que definirá el comportamiento del chatbot..."
              className={styles.textarea}
            />
            <p className={styles.helpText}>
              Este prompt define la personalidad y comportamiento del chatbot durante la actividad.
              Sé específico sobre cómo quieres que el asistente interactúe con los estudiantes y qué tipo de ayuda debe proporcionar.
            </p>
          </div>
          
          <div className={styles.promptTemplate}>
            <h4>Plantillas de Prompts</h4>
            <div className={styles.promptTemplateList}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  systemPrompt: "Eres un asistente educativo especializado en facilitar discusiones colaborativas. Tu rol es guiar a los estudiantes a través del proceso de reflexión, sin proporcionar respuestas directas. Fomenta el pensamiento crítico haciendo preguntas abiertas y ayudando a los estudiantes a desarrollar sus propias ideas. Cuando los estudiantes hagan preguntas, responde con más preguntas que les ayuden a profundizar en el tema. Utiliza un tono amable, motivador y paciente."
                }))}
                className={styles.templateButton}
              >
                Facilitador de discusión
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  systemPrompt: "Eres un experto en el método socrático de enseñanza. Tu objetivo es fomentar el aprendizaje profundo a través de preguntas sistemáticas. No proporciones respuestas directas, sino que debes ayudar a los estudiantes a descubrir las respuestas por sí mismos. Desafía suposiciones, pide clarificaciones y evidencia, y ayuda a los estudiantes a examinar las implicaciones de sus ideas. Mantén un tono respetuoso y curioso, mostrando interés genuino en el proceso de pensamiento de los estudiantes."
                }))}
                className={styles.templateButton}
              >
                Método socrático
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  systemPrompt: "Actúas como un mentor que proporciona andamiaje cognitivo. Tu objetivo es ofrecer el nivel justo de apoyo que necesitan los estudiantes para avanzar en su comprensión, sin hacer el trabajo por ellos. Ofrece pistas, sugerencias y retroalimentación que los ayude a construir conocimiento. Ajusta tu nivel de apoyo según la dificultad que muestren: más directo cuando estén atascados, más abierto cuando estén progresando bien. Celebra los logros y normaliza los desafíos como parte del proceso de aprendizaje."
                }))}
                className={styles.templateButton}
              >
                Andamiaje cognitivo
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Guardando...' : configId ? 'Actualizar Configuración' : 'Crear Configuración'}
          </button>
        </div>
      </form>
    </div>
  );}