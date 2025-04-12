// lib/roles.ts

// Lista de roles válidas aceitas no sistema
export const validRoles = ['gerente', 'tecnico', 'auditor'] as const

// Tipo Role baseado nos valores válidos
export type Role = (typeof validRoles)[number]

// Mensagem de erro padrão caso a role seja inválida
export const invalidRoleMessage = 'Acesso negado. Role inválida ou não definida.'
