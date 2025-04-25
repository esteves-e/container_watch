export const formatarDataHoraBR = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return 'Data inválida'
    }
  }
  