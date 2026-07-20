import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listFiles(relativeDirectory, extension) {
  const directory = path.join(root, relativeDirectory);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listFiles(path.relative(root, entryPath), extension);
    }
    return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

function forbid(content, pattern, message) {
  if (pattern.test(content)) failures.push(message);
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

const themePath = path.join(root, 'src/design-system/dashboardTheme.ts');
if (!fs.existsSync(themePath)) {
  failures.push(
    'Os tokens visuais do dashboard devem existir em src/design-system/dashboardTheme.ts.',
  );
} else {
  const theme = fs.readFileSync(themePath, 'utf8');
  requirePattern(
    theme,
    /import\s*\{\s*getCssVar\s*\}\s*from\s*['"]quasar['"]/,
    'dashboardTheme.ts deve importar getCssVar do Quasar.',
  );
  requirePattern(
    theme,
    /return\s+getCssVar\(name\)\s*\|\|\s*semanticFallbacks\[name\]/,
    'Os tokens do dashboard devem resolver getCssVar em código executável.',
  );
  requirePattern(
    theme,
    /typeof document === ['"]undefined['"]/,
    'A resolução de tokens deve preservar renderização sem DOM.',
  );
  for (const exportName of [
    'getDashboardSeriesColors',
    'getDashboardSeriesPalette',
    'getDashboardCategoryPalette',
  ]) {
    requirePattern(
      theme,
      new RegExp(`export function ${exportName}\\b`),
      `dashboardTheme.ts deve exportar ${exportName}.`,
    );
  }
}

const dashboardFiles = listFiles('src/components/Dashbord', '.vue');
const dashboardCardFiles = dashboardFiles.filter((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  return /<q-card\b/.test(source) || path.basename(filePath) === 'DemostrativoPage.vue';
});

for (const filePath of dashboardFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  const file = relative(filePath);
  forbid(
    source,
    /#(?:21ba45|c10015|31ccec|1d169c)\b/i,
    `${file}: cores semânticas devem vir de dashboardTheme.ts.`,
  );
  forbid(source, /!important\b/, `${file}: não deve depender de !important.`);
  forbid(source, /(?<![:\w-])style\s*=/, `${file}: estilos estáticos devem usar classes.`);
  forbid(
    source,
    /(?:border-radius:\s*16px|box-shadow:\s*0 4px (?:20|24)px)/,
    `${file}: o shell visual dos cards não deve ser duplicado localmente.`,
  );
}

for (const filePath of dashboardCardFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  const tagName = path.basename(filePath) === 'DemostrativoPage.vue' ? 'div' : 'q-card';
  const openingTag = source.match(new RegExp(`<${tagName}\\b[^>]*>`, 's'))?.[0] ?? '';
  if (!/\bclass="[^"]*\bdashboard-card\b/.test(openingTag)) {
    failures.push(
      `${relative(filePath)}: o shell visual deve usar a classe compartilhada dashboard-card.`,
    );
  }
  if (/\bflat\b/.test(openingTag)) {
    failures.push(
      `${relative(filePath)}: dashboard-card não pode usar flat, que anula a elevação compartilhada.`,
    );
  }
}

for (const relativePath of [
  'src/components/Dashbord/DashboardSummaryCards.vue',
  'src/components/Dashbord/DashboardCategoryChart.vue',
  'src/components/Dashbord/DashboardCategoryTreemap.vue',
  'src/components/Dashbord/DashboardHeatmapChart.vue',
  'src/components/Dashbord/DashboardPeriodChart.vue',
  'src/components/Dashbord/DashboardRadialComposition.vue',
  'src/components/Dashbord/DashboardTrendLineChart.vue',
  'src/components/Dashbord/DemostrativoPage.vue',
]) {
  requirePattern(
    read(relativePath),
    /from ['"]src\/design-system\/dashboardTheme['"]/,
    `${relativePath}: consumidor semântico deve importar dashboardTheme.ts.`,
  );
}

for (const relativePath of [
  'src/components/MothYearSelector.vue',
  'src/components/Inputs/ModernDateInput.vue',
  ...listFiles('src/components/MetasFinanceiras', '.vue').map(relative),
]) {
  const source = read(relativePath);
  forbid(source, /(?<![:\w-])style\s*=/, `${relativePath}: estilos estáticos devem usar classes.`);
}

for (const relativePath of [
  'src/components/MothYearSelector.styles.css',
  'src/components/Inputs/ModernDateInput.vue',
]) {
  forbid(
    read(relativePath),
    /!important\b/,
    `${relativePath}: seletores devem ter especificidade previsível.`,
  );
}

const appStyles = read('src/css/app.scss');
requirePattern(
  appStyles,
  /\.q-card\.dashboard-card,\s*\.dashboard-card\s*\{[^}]*border-radius:\s*16px;[^}]*overflow:\s*hidden;/s,
  'src/css/app.scss deve definir raio e overflow do shell compartilhado.',
);
requirePattern(
  appStyles,
  /\.q-card\.dashboard-card--light,\s*\.dashboard-card--light\s*\{[^}]*box-shadow:/s,
  'src/css/app.scss deve definir a elevação clara do shell compartilhado.',
);
requirePattern(
  appStyles,
  /\.q-card\.dashboard-card--dark,\s*\.dashboard-card--dark\s*\{[^}]*box-shadow:/s,
  'src/css/app.scss deve definir a elevação escura do shell compartilhado.',
);
for (const token of [
  '--semantic-positive-soft',
  '--semantic-negative-soft',
  '--semantic-info-soft',
]) {
  requirePattern(appStyles, new RegExp(`${token}:`), `src/css/app.scss deve declarar ${token}.`);
}

if (failures.length > 0) {
  console.error('Falha nas regressões de design system e CSS:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Regressões de design system e CSS validadas.');
}
