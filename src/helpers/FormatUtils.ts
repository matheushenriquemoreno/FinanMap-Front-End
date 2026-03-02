/**
 * Formata um valor numérico para o padrão monetário brasileiro (pt-BR).
 * @param valor - O valor a ser formatado
 * @returns String formatada (ex: "1.234,56")
 */
export function formatarValor(valor: number | null | undefined): string {
  if (valor === undefined || valor === null) return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formata uma string de data ISO para o padrão brasileiro (dd/mm/aaaa).
 * @param dtString - A string de data no formato ISO
 * @returns String formatada (ex: "27/02/2026")
 */
export function formatarData(dtString: string): string {
  if (!dtString) return '';
  const dt = new Date(dtString);
  return dt.toLocaleDateString('pt-BR');
}
