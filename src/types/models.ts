// src/types/models.ts

export interface MoodleUser {
    id: number;
    moodle_user_id: number;
    username: string;
    email: string;
    fullname: string;
    created_at: string;
  }
  
  export interface MoodleCourse {
    id: number;
    moodle_course_id: number;
    name: string;
    shortname: string;
    created_at: string;
  }
  
  export interface MoodleAssignment {
    id: number;
    moodle_assignment_id: number;
    moodle_course_id: number;
    name: string;
    duedate: string | null;
    created_at: string;
  }
  
  export interface TPSConfiguration {
    id: number;
    moodle_user_id: number;
    moodle_course_id: number;
    moodle_assignment_id: number;
    think_phase_duration: number; // duración en segundos
    think_phase_instructions: string;
    pair_phase_duration: number; // duración en segundos
    pair_phase_instructions: string;
    share_phase_duration: number; // duración en segundos
    share_phase_instructions: string;
    system_prompt: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface TPSConfigurationWithDetails extends TPSConfiguration {
    course_name?: string;
    assignment_name?: string;
  }
  
  // Interfaces para formularios
  export interface TPSConfigFormData {
    thinkPhaseDuration: number; // en minutos para el formulario
    thinkPhaseInstructions: string;
    pairPhaseDuration: number; // en minutos para el formulario
    pairPhaseInstructions: string;
    sharePhaseDuration: number; // en minutos para el formulario
    sharePhaseInstructions: string;
    systemPrompt: string;
  }
  
  // Interfaces para comunicación API
  export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }