import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];

async function read(path) {
  return readFile(join(root, path), 'utf8');
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) {
    failures.push(message);
  }
}

const card = await read('src/components/CustosFixos/CustoFixoCard.vue');
const page = await read('src/pages/CustosFixos/CustosFixosPage.vue');
const modal = await read('src/components/Despesa/ModalCreateUpdateDespesa.vue');

requirePattern(
  card,
  /cadastrarDespesa/,
  'CustoFixoCard deve emitir uma ação para cadastrar despesa.',
);
requirePattern(
  card,
  /Cadastrar despesa/,
  'CustoFixoCard deve exibir tooltip ou texto claro para cadastrar despesa.',
);
requirePattern(
  page,
  /ModalDespesa/,
  'CustosFixosPage deve renderizar o modal reutilizado de despesa.',
);
requirePattern(
  page,
  /dadosIniciaisDespesa/,
  'CustosFixosPage deve mapear o custo fixo para dados iniciais de despesa.',
);
requirePattern(
  page,
  /despesaService\.create/,
  'CustosFixosPage deve salvar despesa simples pelo DespesaService existente.',
);
requirePattern(
  page,
  /useGerenciamentoMensal\.mesAtual\.ano/,
  'CustosFixosPage deve preencher ano com o período mensal atual.',
);
requirePattern(
  page,
  /useGerenciamentoMensal\.mesAtual\.mes/,
  'CustosFixosPage deve preencher mês com o período mensal atual.',
);
requirePattern(
  modal,
  /dadosIniciais/,
  'ModalCreateUpdateDespesa deve aceitar dados iniciais opcionais.',
);
requirePattern(
  modal,
  /categoriaSelecionada\.value\s*=\s*\{/,
  'ModalCreateUpdateDespesa deve inicializar categoria quando ela vier do custo fixo.',
);

if (failures.length > 0) {
  console.error('Falha no fluxo custo fixo para despesa:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Fluxo custo fixo para despesa validado.');
}
