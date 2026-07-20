import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) failures.push(message);
}

function listFiles(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

async function validateRequestCache() {
  const cachePath = path.join(root, 'src/stores/dashboardRequestCache.mjs');
  if (!fs.existsSync(cachePath)) {
    failures.push('O cache assíncrono testável do dashboard deve existir.');
    return;
  }

  const { createAsyncKeyedCache } = await import(pathToFileURL(cachePath).href);
  const cache = createAsyncKeyedCache();
  let calls = 0;
  let resolveFirst;

  const firstRequest = cache.getOrLoad('periodo-a', () => {
    calls += 1;
    return new Promise((resolve) => {
      resolveFirst = resolve;
    });
  });
  const concurrentRequest = cache.getOrLoad('periodo-a', () => {
    calls += 1;
    return Promise.resolve({ periodo: 'duplicado' });
  });

  await Promise.resolve();
  if (calls !== 1) {
    failures.push('Chamadas concorrentes da mesma chave devem compartilhar uma requisição.');
  }

  resolveFirst?.({ periodo: 'a' });
  const [firstValue, concurrentValue] = await Promise.all([firstRequest, concurrentRequest]);
  if (firstValue !== concurrentValue) {
    failures.push('Chamadas concorrentes devem receber o mesmo valor resolvido.');
  }

  await cache.getOrLoad('periodo-b', () => {
    calls += 1;
    return Promise.resolve({ periodo: 'b' });
  });
  const cachedFirstValue = await cache.getOrLoad('periodo-a', () => {
    calls += 1;
    return Promise.resolve({ periodo: 'a-refetch' });
  });

  if (calls !== 2 || cachedFirstValue !== firstValue) {
    failures.push('O cache deve preservar A ao navegar A → B → A sem refetch.');
  }
}

async function validateCategoryRegistry() {
  const registryPath = path.join(root, 'src/stores/dashboardCategoryRegistry.mjs');
  if (!fs.existsSync(registryPath)) {
    failures.push('O registro testável de categorias solicitadas deve existir.');
    return;
  }

  const { createDashboardCategoryRegistry } = await import(pathToFileURL(registryPath).href);
  const registry = createDashboardCategoryRegistry(['Rendimento', 'Despesa']);

  registry.request('Investimento');
  const requestedTypes = registry.requestedTypes();
  if (!requestedTypes.includes('Investimento')) {
    failures.push(
      'Categorias lazy selecionadas devem permanecer solicitadas após trocar o período.',
    );
  }

  const lazyCategories = { Investimento: [{ categoria: 'Reserva', valor: 100 }] };
  const initialSnapshot = {
    Rendimento: [{ categoria: 'Salário', valor: 200 }],
    Despesa: [{ categoria: 'Moradia', valor: 80 }],
  };
  const merged = registry.merge(lazyCategories, initialSnapshot);

  if (merged.Investimento !== lazyCategories.Investimento) {
    failures.push('O snapshot inicial não pode apagar uma categoria lazy concluída antes dele.');
  }
}

async function validateSnapshotLoader() {
  const loaderPath = path.join(root, 'src/stores/dashboardSnapshotLoader.mjs');
  if (!fs.existsSync(loaderPath)) {
    failures.push('O loader comportamental de snapshots do dashboard deve existir.');
    return;
  }

  const cachePath = path.join(root, 'src/stores/dashboardRequestCache.mjs');
  const registryPath = path.join(root, 'src/stores/dashboardCategoryRegistry.mjs');
  const [
    { createDashboardSnapshotLoader },
    { createAsyncKeyedCache },
    { createDashboardCategoryRegistry },
  ] = await Promise.all([
    import(pathToFileURL(loaderPath).href),
    import(pathToFileURL(cachePath).href),
    import(pathToFileURL(registryPath).href),
  ]);

  const registry = createDashboardCategoryRegistry(['Rendimento', 'Despesa']);
  let summaryCalls = 0;
  let resolvePeriodB;
  const loader = createDashboardSnapshotLoader({
    dashboardCache: createAsyncKeyedCache(),
    categoryCache: createAsyncKeyedCache(),
    categoryRegistry: registry,
    loadSummary: (start) => {
      summaryCalls += 1;
      if (start === 'b') {
        return new Promise((resolve) => {
          resolvePeriodB = resolve;
        });
      }
      return Promise.resolve({ period: start });
    },
    loadEvolution: (start) => Promise.resolve([{ period: start }]),
    loadCategories: (start, _end, type) => Promise.resolve([{ period: start, type }]),
  });

  const firstA = await loader.load('periodo-a', 'a', 'a');
  registry.request('Investimento');
  const rehydratedA = await loader.load('periodo-a', 'a', 'a');

  if (
    firstA.categories.Investimento !== undefined ||
    rehydratedA.categories.Investimento === undefined ||
    summaryCalls !== 1
  ) {
    failures.push('Snapshot antigo deve reidratar categoria lazy sem refazer resumo/evolução.');
  }

  const pendingB = loader.load('periodo-b', 'b', 'b');
  await Promise.resolve();
  const restoredA = await loader.load('periodo-a', 'a', 'a');

  if (restoredA.categories.Investimento === undefined || summaryCalls !== 2) {
    failures.push('A → B pendente → A deve restaurar imediatamente o snapshot completo de A.');
  }

  resolvePeriodB?.({ period: 'b' });
  await pendingB;
}

await validateRequestCache();
await validateCategoryRegistry();
await validateSnapshotLoader();

const quasarConfig = read('quasar.config.ts');
const routes = read('src/router/routes.ts');
const dashboardPage = read('src/pages/Dashbord/dashbord-Gerenciamento-Mensal.vue');
const dashboardStore = read('src/stores/dashboardStore.ts');
const dashboardSnapshotLoader = read('src/stores/dashboardSnapshotLoader.mjs');
const dashboardComponents = listFiles(path.join(root, 'src/components/Dashbord'), '.vue');

forbidPattern(
  quasarConfig,
  /boot:\s*\[[^\]]*['"]apexchart['"]/,
  'ApexCharts não pode fazer parte do boot global.',
);
requirePattern(
  routes,
  /path:\s*['"]\/dashbord['"][\s\S]*?component:\s*\(\)\s*=>\s*import\(/,
  'A rota do dashboard deve continuar carregada sob demanda.',
);

for (const filePath of dashboardComponents) {
  const source = fs.readFileSync(filePath, 'utf8');
  const file = relative(filePath);

  forbidPattern(
    source,
    /<apexchart\b/,
    `${file}: gráfico depende do componente registrado globalmente.`,
  );
  forbidPattern(
    source,
    /DashboardService|obterDashboardService|\.obter(?:Resumo|Evolucao|Categorias)\(/,
    `${file}: componente visual ainda busca dados diretamente.`,
  );

  if (/<VueApexCharts\b/.test(source)) {
    requirePattern(
      source,
      /import VueApexCharts from ['"]vue3-apexcharts['"]/,
      `${file}: VueApexCharts deve ser importado localmente.`,
    );
  }
}

requirePattern(
  dashboardPage,
  /dashboardStore\.carregarDashboard\(/,
  'A página deve orquestrar uma única carga de dados por período.',
);
requirePattern(
  dashboardSnapshotLoader,
  /Promise\.all\(/,
  'O store deve paralelizar as chaves de dados do dashboard.',
);
requirePattern(dashboardStore, /obterResumo\(/, 'O store deve centralizar o resumo financeiro.');
requirePattern(
  dashboardStore,
  /obterEvolucao\(/,
  'O store deve centralizar a evolução financeira.',
);
requirePattern(
  dashboardStore,
  /obterCategorias\(/,
  'O store deve centralizar as categorias por tipo.',
);
requirePattern(
  dashboardStore,
  /createAsyncKeyedCache/,
  'O store deve usar o cache assíncrono validado por comportamento.',
);
requirePattern(
  dashboardSnapshotLoader,
  /categoryCache\.getOrLoad/,
  'Carga inicial e lazy de categorias devem compartilhar o mesmo cache.',
);
requirePattern(
  dashboardStore,
  /snapshotLoader\.load\(/,
  'O store deve usar o loader comportamental para compor snapshots.',
);
requirePattern(
  dashboardStore,
  /snapshotLoader\.loadCategory\(/,
  'A carga lazy do store deve compartilhar o loader comportamental.',
);
requirePattern(
  dashboardStore,
  /categoryRegistry\.request\(tipo\)/,
  'A carga lazy deve registrar o tipo selecionado para os próximos períodos.',
);
forbidPattern(
  dashboardStore,
  /if\s*\(\s*!force\s*&&\s*periodoCarregado\.value\s*===\s*chavePeriodo\s*\)\s*return/,
  'Retorno antecipado não pode impedir A → B pendente → A de restaurar o cache.',
);

const authPages = [
  'src/pages/Autenticacao/LoginPage.vue',
  'src/pages/Autenticacao/CadastroPage.vue',
  'src/pages/Autenticacao/ConfirmarCodigoLoginPage.vue',
];
const optimizedLogoPath = path.join(root, 'src/assets/logo-auth.webp');

if (!fs.existsSync(optimizedLogoPath)) {
  failures.push('O logo otimizado src/assets/logo-auth.webp deve existir.');
} else if (fs.statSync(optimizedLogoPath).size > 80_000) {
  failures.push('O logo otimizado deve ter no máximo 80 KB.');
}

for (const page of authPages) {
  const source = read(page);
  requirePattern(source, /logo-auth\.webp/, `${page}: deve usar o logo otimizado.`);
  requirePattern(
    source,
    /<img\b[^>]*\bwidth="360"[^>]*\bheight="299"[^>]*>/,
    `${page}: deve reservar as dimensões intrínsecas do logo.`,
  );
  requirePattern(
    source,
    /<img\b[^>]*\bfetchpriority="high"[^>]*>/,
    `${page}: deve priorizar o logo acima da dobra.`,
  );
}

if (failures.length > 0) {
  console.error('Falha nas regressões de performance do dashboard:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Regressões de performance do dashboard validadas.');
}
