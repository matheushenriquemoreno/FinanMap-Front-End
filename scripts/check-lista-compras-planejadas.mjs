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
const card = read('src/components/ComprasPlanejadas/CompraPlanejadaCard.vue');

assert.match(packageJson.scripts.test, /test:compras-planejadas/);
assert.match(model, /valorEstimado: number/);
assert.match(model, /linksLojas: CompraPlanejadaLink\[\]/);
assert.match(service, /compras-planejadas/);
assert.match(service, /obterPendentes/);
assert.match(service, /criar/);
assert.match(service, /saving/);
assert.match(page, /@salvar="salvarCompra"/);
assert.match(page, /service\.saving\.value/);
assert.match(page, /if \(\!\(await carregarDados\(\)\)\) inserirCompraLocal/);
assert.match(form, /Adicionar loja/);
assert.match(form, /:disable="loading"/);
assert.match(form, /validarUrlLoja/);
assert.match(card, /noopener noreferrer/);

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

console.log('Lista de compras planejadas: contrato, navegação, lista, formulário e integração verificados.');
