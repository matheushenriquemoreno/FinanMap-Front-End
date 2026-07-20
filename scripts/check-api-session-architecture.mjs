import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return entry.isFile() && /\.(?:ts|vue)$/.test(entry.name) ? [entryPath] : [];
  });
}

const quasarConfig = read('quasar.config.ts');
const packageJson = JSON.parse(read('package.json'));
const axiosBoot = read('src/boot/axios.ts');
const axiosHelper = read('src/services/api/AxiosHelper.ts');
const authService = read('src/services/AuthService.ts');
const productionEnvironment = read('.env.prod');
const environmentValidator = read('scripts/validate-build-env.mjs');
const eslintConfig = read('eslint.config.js');
const sessionPath = path.join(root, 'src/services/SessionService.ts');

if (/URL_API\s*:\s*['"]https?:\/\//.test(quasarConfig)) {
  failures.push('quasar.config.ts não pode versionar uma URL absoluta de API.');
}
if (!packageJson.scripts?.build?.includes('validate-build-env.mjs')) {
  failures.push('O build deve validar URL_API antes de gerar o bundle.');
}
if (!/^URL_API=https?:\/\//m.test(productionEnvironment)) {
  failures.push('.env.prod deve declarar uma URL_API HTTP(S) para o bundle de produção.');
}
if (!/new URL\(apiUrl\)/.test(environmentValidator)) {
  failures.push('O validador de ambiente deve rejeitar URL_API inválida.');
}
if (/api\.example\.com/.test(axiosBoot)) {
  failures.push('O boot Axios não pode exportar o cliente de exemplo.');
}
if (!/apiClient/.test(axiosBoot) || !/apiClient/.test(axiosHelper)) {
  failures.push('Boot e serviços devem compartilhar o mesmo apiClient.');
}
if (/from ['"]axios['"]/.test(axiosBoot.replace(/import type[^;]+;/g, ''))) {
  failures.push('O boot não pode expor o cliente Axios global fora do apiClient.');
}
if (/\baxios\.(?:request|get|post|put|patch|delete)\s*\(/.test(authService)) {
  failures.push('AuthService deve usar o apiClient compartilhado.');
}

const allSource = listSourceFiles(path.join(root, 'src'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const axiosCreateCount = allSource.match(/axios\.create\s*\(/g)?.length ?? 0;
if (axiosCreateCount !== 1) {
  failures.push(`Deve existir exatamente um axios.create em src; encontrado: ${axiosCreateCount}.`);
}

const apiEnvironmentReads = allSource.match(/process\.env\.URL_API/g)?.length ?? 0;
if (apiEnvironmentReads !== 1) {
  failures.push(
    `Somente ApiConfig.ts deve ler URL_API; encontradas ${apiEnvironmentReads} leituras em src.`,
  );
}

if (!fs.existsSync(sessionPath)) {
  failures.push('SessionService.ts deve centralizar credenciais somente em memória.');
} else {
  const sessionService = fs.readFileSync(sessionPath, 'utf8');
  if (/localStorage|sessionStorage|document\.cookie/.test(sessionService)) {
    failures.push('SessionService não pode persistir credenciais no browser.');
  }
}

const forbiddenStorage =
  /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*['"](?:token|refreshToken)['"]/;
for (const file of listSourceFiles(path.join(root, 'src'))) {
  const source = fs.readFileSync(file, 'utf8');
  if (forbiddenStorage.test(source)) {
    failures.push(`${path.relative(root, file)} ainda persiste ou lê token do storage.`);
  }
}

for (const rule of [
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/no-unused-vars',
  '@typescript-eslint/no-floating-promises',
]) {
  const disabledRule = new RegExp(`['"]${rule.replaceAll('/', '\\/')}['"]\\s*:\\s*['"]off['"]`);
  if (disabledRule.test(eslintConfig)) {
    failures.push(`${rule} não pode permanecer desativada globalmente.`);
  }
}

const decomposedComponents = [
  ['src/components/Dashbord/SectionFiltrarPeriodo.vue', 'useDashboardPeriodFilter'],
  ['src/pages/CustosFixos/CustosFixosPage.vue', 'useCustosFixosPage'],
  ['src/components/Configuracoes/CategoriaConfig.vue', 'useCategoriaConfig'],
  ['src/components/Compartilhamento/CompartilhamentoModal.vue', 'useCompartilhamentoModal'],
  ['src/components/MothYearSelector.vue', 'useMonthYearSelector'],
];

for (const [component, composable] of decomposedComponents) {
  const source = read(component);
  const lineCount = source.split(/\r?\n/).length;
  if (!source.includes(composable)) {
    failures.push(`${component} deve delegar estado e efeitos para ${composable}.`);
  }
  if (/<style\b(?![^>]*\bsrc=)/.test(source)) {
    failures.push(`${component} deve manter estilos inline fora do SFC.`);
  }
  if (!/<style\b[^>]*\bsrc=/.test(source)) {
    failures.push(`${component} deve referenciar seu arquivo de estilo dedicado.`);
  }
  if (lineCount > 300) {
    failures.push(`${component} ainda possui ${lineCount} linhas; limite da rodada: 300.`);
  }
}

if (failures.length > 0) {
  console.error('Falha na arquitetura de API e sessão:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Arquitetura de API e sessão validada.');
}
