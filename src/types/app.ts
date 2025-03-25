
// User roles
export type UserRole = 'superadmin' | 'entrenador' | 'cliente';

// Base user interface
export interface User {
  id: string;
  nombre: string;
  usuario: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Superadmin interface
export interface Superadmin extends User {
  role: 'superadmin';
}

// Entrenador interface
export interface Entrenador extends User {
  role: 'entrenador';
  createdBy: string; // ID of the superadmin who created this entrenador
}

// Cliente interface
export interface Cliente extends User {
  role: 'cliente';
  entrenadorId: string; // ID of the entrenador managing this cliente
  dieta?: string;
  rutina?: string;
}

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  usuario: string;
  password: string;
}

// Form input for creating a new entrenador
export interface EntrenadorInput {
  nombre: string;
  usuario: string;
  password: string;
}

// Form input for creating a new cliente
export interface ClienteInput {
  nombre: string;
  usuario: string;
  password: string;
  entrenadorId: string;
}

// Form input for updating dieta/rutina
export interface PlanInput {
  dieta?: string;
  rutina?: string;
}
