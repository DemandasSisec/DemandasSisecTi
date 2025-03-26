export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Não definido';

  try {
    // Se for uma data ISO
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return 'Data inválida';
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}; 