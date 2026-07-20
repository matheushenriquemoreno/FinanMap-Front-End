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
const pageLogic = await read('src/composables/useCustosFixosPage.ts');
const pageFeature = `${page}\n${pageLogic}`;
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
  pageFeature,
  /ModalDespesa/,
  'CustosFixosPage deve renderizar o modal reutilizado de despesa.',
);
requirePattern(
  pageFeature,
  /dadosIniciaisDespesa/,
  'CustosFixosPage deve mapear o custo fixo para dados iniciais de despesa.',
);
requirePattern(
  pageFeature,
  /despesaService\.create/,
  'CustosFixosPage deve salvar despesa simples pelo DespesaService existente.',
);
requirePattern(
  pageFeature,
  /@on-submit-add-lote="cadastrarDespesaEmLote"/,
  'CustosFixosPage deve escutar a criacao de despesa em lote pelo modal reutilizado.',
);
requirePattern(
  pageFeature,
  /despesaService\.criarEmLote/,
  'CustosFixosPage deve salvar despesa em lote pelo DespesaService existente.',
);
requirePattern(
  pageFeature,
  /(?:gerenciamentoMensalStore|useGerenciamentoMensal)\.mesAtual\.ano/,
  'CustosFixosPage deve preencher ano com o período mensal atual.',
);
requirePattern(
  pageFeature,
  /(?:gerenciamentoMensalStore|useGerenciamentoMensal)\.mesAtual\.mes/,
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
requirePattern(
  modal,
  /labelBotaoSubmit/,
  'ModalCreateUpdateDespesa deve permitir texto de acao adequado ao fluxo reutilizado.',
);

if (failures.length > 0) {
  console.error('Falha no fluxo custo fixo para despesa:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Fluxo custo fixo para despesa validado.');
}
