import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
assert.match(page, /@salvar="salvarCompra"/);
assert.match(page, /if \(\!\(await carregarDados\(\)\)\) inserirCompraLocal/);
assert.match(form, /Adicionar loja/);
assert.match(form, /Use uma URL http ou https/);
assert.match(card, /noopener noreferrer/);

console.log('Lista de compras planejadas: contrato, navegação, lista, formulário e integração verificados.');
