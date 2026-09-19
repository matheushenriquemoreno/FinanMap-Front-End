import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validarNomeCompra,
  validarValorCompra,
  validarPrioridadeCompra,
  validarNomeLoja,
  validarUrlLoja,
} from '../src/helpers/CompraPlanejadaValidation.mjs';
import {
  ordenarComprasPlanejadas,
  calcularTotalEstimado,
  filtrarComprasPlanejadas,
} from '../src/helpers/CompraPlanejadaPresentation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const model = read('src/Model/CompraPlanejada.ts');
const service = read('src/services/CompraPlanejadaService.ts');
const page = read('src/pages/ComprasPlanejadas/ComprasPlanejadasPage.vue');
const form = read('src/components/ComprasPlanejadas/CompraPlanejadaFormModal.vue');
const conclusao = read('src/components/ComprasPlanejadas/CompraPlanejadaConclusaoModal.vue');
const card = read('src/components/ComprasPlanejadas/CompraPlanejadaCard.vue');
const resumo = read('src/components/ComprasPlanejadas/PainelResumoCompras.vue');

assert.match(packageJson.scripts.test, /test:compras-planejadas/);
assert.match(model, /valorEstimado: number/);
assert.match(model, /linksLojas: CompraPlanejadaLink\[\]/);
assert.match(service, /compras-planejadas/);
assert.match(service, /obterPendentes/);
assert.match(service, /criar/);
assert.match(service, /atualizar/);
assert.match(service, /excluir/);
assert.match(service, /concluir/);
assert.match(service, /obterComprados/);
assert.match(service, /reverter/);
assert.match(service, /saving/);
assert.match(page, /@salvar="salvarCompra"/);
assert.match(page, /service\.saving\.value/);
assert.match(page, /confirmarExclusao/);
assert.match(page, /if \(\!\(await carregarDados\(\)\)\)/);
assert.match(page, /modalCompraAberto/);
assert.match(page, /compradas/);
assert.doesNotMatch(page, /<q-tabs/);
assert.doesNotMatch(page, /gradient="/);
assert.doesNotMatch(page, /class="compras-total/);
assert.doesNotMatch(page, /compras-state__illustration/);
assert.doesNotMatch(page, /Adicionar primeira compra/);
assert.match(page, /PainelResumoCompras/);
assert.match(page, /<q-btn-toggle/);
assert.match(page, /filtroNome/);
assert.match(page, /comprasFiltradas/);
assert.match(page, /carregarTudo/);
assert.match(page, /Promise\.all\(\[carregarDados\(\), carregarComprados\(\)\]\)/);
assert.match(page, /erroPendentes/);
assert.match(page, /erroCompradas/);
assert.match(page, /type: 'radio'/);
assert.match(page, /preservar/);
assert.match(page, /permanecerá no Mês a Mês/);
assert.match(page, /compartilhamentoStore\.podeEditar/);
assert.match(page, /filtroStatus === 'pendentes'/);
assert.match(page, /dados confirmados continuam visíveis/);
assert.match(page, /erroAba && comprasAtuais\.length === 0/);
assert.match(page, /v-if="erroAba"[\s\S]*dados confirmados continuam visíveis/);
assert.match(form, /Adicionar loja/);
assert.match(form, /:disable="loading"/);
assert.match(form, /validarUrlLoja/);
assert.match(form, /compra\?: CompraPlanejadaResult/);
assert.match(form, /Salvar alterações/);
assert.match(card, /noopener noreferrer/);
assert.match(card, /emit\('editar'/);
assert.match(card, /emit\('excluir'/);
assert.match(card, /emit\('comprar'/);
assert.match(card, /emit\('reverter'/);
assert.match(card, /Estimativa original/);
assert.match(card, /<q-avatar/);
assert.doesNotMatch(card, /border-top:\s*3px/);
assert.match(
  card,
  /\.compra-card\s*\{\s*position:\s*relative;\s*display:\s*flex;\s*flex-direction:\s*column;/,
);
assert.match(card, /compra-card__estimate/);
assert.match(resumo, /resumo-grid/);
assert.match(resumo, /totalPendentes/);
assert.match(resumo, /totalEstimadoCompradas/);
assert.match(resumo, /totalRealCompradas/);
assert.match(conclusao, /criarDespesa/);
assert.match(conclusao, /validarValorReal/);
assert.match(conclusao, /type="date"/);
assert.match(conclusao, /:disable="loading"/);
assert.match(conclusao, /erroCategorias/);
assert.match(conclusao, /Tentar novamente/);

assert.equal(validarNomeCompra(''), 'Informe o nome da compra.');
assert.equal(validarValorCompra(0), 'Informe um valor maior que zero.');
assert.equal(validarPrioridadeCompra(null), 'Escolha uma prioridade.');
assert.equal(validarNomeLoja(''), 'Informe o nome da loja.');
assert.equal(validarUrlLoja('ftp://loja.example'), 'Use uma URL http ou https.');
assert.equal(validarUrlLoja('https://loja.example/produto'), true);

const compras = [
  { prioridade: 'Baixa', dataCriacao: '2026-09-01T10:00:00Z', valorEstimado: 0.1 },
  { prioridade: 'Alta', dataCriacao: '2026-09-01T10:00:00Z', valorEstimado: 0.2 },
  { prioridade: 'Alta', dataCriacao: '2026-09-02T10:00:00Z', valorEstimado: 0.3 },
];
assert.deepEqual(
  ordenarComprasPlanejadas(compras).map((compra) => compra.valorEstimado),
  [0.3, 0.2, 0.1],
);
assert.equal(Math.round(calcularTotalEstimado(compras) * 100) / 100, 0.6);
const comprasPorNome = [
  { nome: 'Notebook para trabalho' },
  { nome: 'Cadeira ergonômica' },
  { nome: 'Fone de ouvido' },
];
assert.deepEqual(
  filtrarComprasPlanejadas(comprasPorNome, '  NOTE  ').map((compra) => compra.nome),
  ['Notebook para trabalho'],
);
assert.deepEqual(
  filtrarComprasPlanejadas(comprasPorNome, '').map((compra) => compra.nome),
  comprasPorNome.map((compra) => compra.nome),
);
assert.deepEqual(filtrarComprasPlanejadas(comprasPorNome, 'inexistente'), []);

const centenas = Array.from({ length: 500 }, (_, index) => ({
  prioridade: index % 3 === 0 ? 'Alta' : index % 3 === 1 ? 'Media' : 'Baixa',
  dataCriacao: `2026-09-${String((index % 28) + 1).padStart(2, '0')}T10:00:00Z`,
  valorEstimado: index + 0.01,
}));
assert.equal(ordenarComprasPlanejadas(centenas).length, 500);
assert.equal(
  calcularTotalEstimado(centenas),
  centenas.reduce((total, compra) => total + compra.valorEstimado, 0),
);

console.log(
  'Lista de compras planejadas: contrato, CRUD, ciclo, permissões e massa de 500 itens verificados.',
);
