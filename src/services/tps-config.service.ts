// src/services/tps-config.service.ts
import { TPSConfiguration, TPSConfigFormData, APIResponse, TPSConfigurationWithDetails } from '@/types/models';

/**
 * Obtiene todas las configuraciones TPS creadas por el usuario actual
 */
export async function getUserConfigurations(): Promise<APIResponse<TPSConfigurationWithDetails[]>> {
  try {
    const response = await fetch('/api/tps-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user configurations:', error);
    return { 
      success: false, 
      error: 'Error al obtener configuraciones. Por favor, intente nuevamente.' 
    };
  }
}

/**
 * Obtiene una configuración TPS específica por ID
 */
export async function getConfigurationById(id: number): Promise<APIResponse<TPSConfigurationWithDetails>> {
  try {
    const response = await fetch(`/api/tps-config/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching configuration with ID ${id}:`, error);
    return { 
      success: false, 
      error: 'Error al obtener la configuración. Por favor, intente nuevamente.' 
    };
  }
}

/**
 * Verifica si existe una configuración activa para un curso y actividad específicos
 */
export async function checkExistingConfiguration(
  courseId: number, 
  assignmentId: number
): Promise<APIResponse<TPSConfigurationWithDetails | null>> {
  try {
    const response = await fetch(`/api/tps-config/check?courseId=${courseId}&assignmentId=${assignmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking existing configuration:', error);
    return { 
      success: false, 
      error: 'Error al verificar configuraciones existentes.' 
    };
  }
}

/**
 * Crea una nueva configuración TPS
 */
export async function createConfiguration(
  configData: TPSConfigFormData,
  courseId: number,
  assignmentId: number
): Promise<APIResponse<TPSConfiguration>> {
  try {
    // Convertir duración de minutos a segundos para almacenamiento
    const payload = {
      moodle_course_id: courseId,
      moodle_assignment_id: assignmentId,
      think_phase_duration: configData.thinkPhaseDuration * 60,
      think_phase_instructions: configData.thinkPhaseInstructions,
      pair_phase_duration: configData.pairPhaseDuration * 60,
      pair_phase_instructions: configData.pairPhaseInstructions,
      share_phase_duration: configData.sharePhaseDuration * 60,
      share_phase_instructions: configData.sharePhaseInstructions,
      system_prompt: configData.systemPrompt,
    };

    const response = await fetch('/api/tps-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating configuration:', error);
    return { 
      success: false, 
      error: 'Error al crear la configuración. Por favor, intente nuevamente.' 
    };
  }
}

/**
 * Actualiza una configuración TPS existente
 */
export async function updateConfiguration(
  id: number,
  configData: TPSConfigFormData
): Promise<APIResponse<TPSConfiguration>> {
  try {
    // Convertir duración de minutos a segundos para almacenamiento
    const payload = {
      think_phase_duration: configData.thinkPhaseDuration * 60,
      think_phase_instructions: configData.thinkPhaseInstructions,
      pair_phase_duration: configData.pairPhaseDuration * 60,
      pair_phase_instructions: configData.pairPhaseInstructions,
      share_phase_duration: configData.sharePhaseDuration * 60,
      share_phase_instructions: configData.sharePhaseInstructions,
      system_prompt: configData.systemPrompt,
    };

    const response = await fetch(`/api/tps-config/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating configuration with ID ${id}:`, error);
    return { 
      success: false, 
      error: 'Error al actualizar la configuración. Por favor, intente nuevamente.' 
    };
  }
}

/**
 * Cambia el estado de activación de una configuración TPS
 */
export async function toggleConfigurationStatus(
  id: number, 
  isActive: boolean
): Promise<APIResponse<TPSConfiguration>> {
  try {
    const response = await fetch(`/api/tps-config/${id}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error toggling status for configuration ID ${id}:`, error);
    return { 
      success: false, 
      error: 'Error al cambiar el estado de la configuración.' 
    };
  }
}

/**
 * Genera un enlace de acceso para los estudiantes
 */
export async function generateAccessLink(configId: number): Promise<APIResponse<{ link: string }>> {
  try {
    const response = await fetch(`/api/tps-config/${configId}/generate-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error generating access link for configuration ID ${configId}:`, error);
    return { 
      success: false, 
      error: 'Error al generar el enlace de acceso.' 
    };
  }
}

/**
 * Obtiene estadísticas de una configuración TPS
 */
export async function getConfigurationStats(configId: number): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/tps-config/${configId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching stats for configuration ID ${configId}:`, error);
    return { 
      success: false, 
      error: 'Error al obtener estadísticas.' 
    };
  }
}