// lib/roles.ts

// Lista de roles válidas aceitas no sistema
export const validRoles = ['gerente', 'tecnico', 'auditor'] as const

// Tipo Role baseado nos valores válidos
export type Role = (typeof validRoles)[number]

// Função para validar se uma string é uma Role válida
export const isValidRole = (role: string | null): role is Role =>
  !!role && validRoles.includes(role as Role)

// Mensagem de erro padrão caso a role seja inválida
export const invalidRoleMessage = 'Acesso não autorizado. Role inválida ou ausente.'
