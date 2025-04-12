// models.ts

export type Role = 'tecnico' | 'auditor' | 'gerente'

export interface Container {
  id: string
  name: string
  location: string
}

export interface FormResponse {
  id: string
  container_id: string
  container_name: string
  location: string
  role: Role
  email: string
  created_at: string
  answers?: Record<string, string>
  auditor_comment?: string
}