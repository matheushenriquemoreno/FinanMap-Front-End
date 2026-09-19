export function validarNomeCompra(value) {
  return (typeof value === 'string' && value.trim().length > 0) || 'Informe o nome da compra.';
}

export function validarValorCompra(value) {
  return Number(value) > 0 || 'Informe um valor maior que zero.';
}

export function validarPrioridadeCompra(value) {
  return Boolean(value) || 'Escolha uma prioridade.';
}

export function validarNomeLoja(value) {
  return (typeof value === 'string' && value.trim().length > 0) || 'Informe o nome da loja.';
}

export function validarUrlLoja(value) {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return 'Informe a URL da loja.';

  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol) || 'Use uma URL http ou https.';
  } catch {
    return 'Informe uma URL válida.';
  }
}
