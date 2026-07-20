import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasAssignedAttribute(tag, names) {
  const alternatives = names.map(escapeRegex).join('|');
  return new RegExp(`(?:^|\\s)(?:${alternatives})=`).test(tag);
}

function getStaticAttribute(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${escapeRegex(name)}="([^"]*)"`))?.[1];
}

for (const misleadingTag of [
  '<q-input v-for="item in items" />',
  '<q-input data-label="decorative" />',
  '<q-input some-for="unrelated" />',
]) {
  if (
    hasAssignedAttribute(misleadingTag, [
      'label',
      ':label',
      'aria-label',
      ':aria-label',
      'for',
      ':for',
    ])
  ) {
    failures.push(`O checker confundiu outro atributo com nome acessível: ${misleadingTag}`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) failures.push(message);
}

function listVueFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listVueFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.vue') ? [entryPath] : [];
  });
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

const index = read('index.html');
const appStyles = read('src/css/app.scss');
const quasarConfig = read('quasar.config.ts');
const envTypes = read('src/env.d.ts');
const axiosHelper = read('src/services/api/AxiosHelper.ts');
const tokenRenewal = read('src/services/TokenRenewalService.ts');
const login = read('src/pages/Autenticacao/LoginPage.vue');
const cadastro = read('src/pages/Autenticacao/CadastroPage.vue');
const verificacao = read('src/pages/Autenticacao/ConfirmarCodigoLoginPage.vue');
const criarCusto = read('src/components/CustosFixos/ModalCriarCustoFixo.vue');
const editarCusto = read('src/components/CustosFixos/ModalEditarCustoFixo.vue');
const periodSelector = read('src/components/MothYearSelector.vue');
const dateInput = read('src/components/Inputs/ModernDateInput.vue');
const moneyInput = read('src/components/Inputs/MoneyInputBR.vue');
const mainLayout = read('src/layouts/MainLayout.vue');
const dashboardPage = read('src/pages/Dashbord/dashbord-Gerenciamento-Mensal.vue');
const monthlyPage = read('src/pages/GerenciamentoMensal/GerenciamentoMensalPageIndex.vue');
const notFoundPage = read('src/pages/ErrorNotFound.vue');

for (const filePath of listVueFiles(path.join(root, 'src'))) {
  const source = fs.readFileSync(filePath, 'utf8');
  const file = relative(filePath);
  const labelFors = new Set(
    [...source.matchAll(/<label\b[^>]*\sfor="([^"]+)"[^>]*>/g)].map((match) => match[1]),
  );
  const controlledIds = new Set(
    [
      ...source.matchAll(
        /<(?:q-input|q-select|MoneyInputBR|ModernDateInput|CampoSelect|CampoSelectServer)\b[^>]*\sfor="([^"]+)"[^>]*>/g,
      ),
    ].map((match) => match[1]),
  );

  for (const tag of source.match(/<label\b[^>]*>/g) ?? []) {
    if (!hasAssignedAttribute(tag, ['for', ':for'])) {
      failures.push(`${file}: label visual sem associação por "for".`);
    }
  }
  for (const labelFor of labelFors) {
    if (!controlledIds.has(labelFor)) {
      failures.push(`${file}: label "${labelFor}" não corresponde a um campo.`);
    }
  }

  for (const tag of source.match(/<img\b[^>]*>/g) ?? []) {
    if (!hasAssignedAttribute(tag, ['alt', ':alt'])) {
      failures.push(`${file}: imagem sem atributo alt.`);
    }
  }

  for (const tag of source.match(/<(?:q-input|q-select)(?=\s|>)[^>]*>/g) ?? []) {
    const hasAccessibleName = hasAssignedAttribute(tag, [
      'label',
      ':label',
      'aria-label',
      ':aria-label',
      'for',
      ':for',
    ]);
    const delegatesAttributes =
      (file === 'src/components/Inputs/ModernDateInput.vue' &&
        /(?:^|\s)v-bind="\$attrs"/.test(tag)) ||
      (file === 'src/components/Inputs/MoneyInputBR.vue' &&
        /(?:^|\s)v-bind="inputProps"/.test(tag));
    if (!hasAccessibleName && !delegatesAttributes) {
      failures.push(`${file}: campo Quasar sem nome acessível.`);
    }

    const staticFor = getStaticAttribute(tag, 'for');
    if (staticFor && !labelFors.has(staticFor)) {
      failures.push(`${file}: campo "${staticFor}" não corresponde a um label.`);
    }
  }

  const checkIconButton = (attributes, body = '') => {
    const isIconButton = /(?:^|\s):?(?:icon|round|fab)(?=\s|=|$)/.test(attributes);
    const hasNamedProp = hasAssignedAttribute(attributes, [
      'aria-label',
      ':aria-label',
      'label',
      ':label',
    ]);
    const bodyWithoutTooltips = body.replace(/<q-tooltip\b[^>]*>[\s\S]*?<\/q-tooltip>/g, '');
    const hasVisibleText = bodyWithoutTooltips.replace(/<[^>]+>/g, '').trim().length > 0;
    if (isIconButton && !hasNamedProp && !hasVisibleText) {
      failures.push(`${file}: botão somente com ícone sem nome acessível.`);
    }
  };

  for (const match of source.matchAll(/<q-btn(?=\s|>)([^>]*)>([\s\S]*?)<\/q-btn>/g)) {
    checkIconButton(match[1] ?? '', match[2] ?? '');
  }
  for (const match of source.matchAll(/<q-btn(?=\s|\/)([^>]*)\/>/g)) {
    checkIconButton(match[1] ?? '');
  }

  for (const tag of source.match(/<div\b[^>]*@click[^>]*>/g) ?? []) {
    const hasKeyboardContract =
      hasAssignedAttribute(tag, ['role', ':role']) &&
      hasAssignedAttribute(tag, ['tabindex', ':tabindex']) &&
      /(?:^|\s)@keydown(?:\.|=)/.test(tag);
    if (!hasKeyboardContract)
      failures.push(`${file}: div clicável sem contrato completo de teclado.`);
  }
}

forbidPattern(
  index,
  /user-scalable=no|maximum-scale=1|minimum-scale=1/,
  'A viewport não deve bloquear o zoom do navegador.',
);
requirePattern(
  appStyles,
  /\.card-login\s*\{[\s\S]*?width:\s*min\(450px,\s*calc\(100%\s*-\s*32px\)\)/,
  'O card de autenticação deve respeitar viewports menores que 370px.',
);
forbidPattern(
  appStyles,
  /@media\s*\(max-width:\s*450px\)[\s\S]*?\.card-login\s*\{[\s\S]*?width:\s*370px/,
  'O breakpoint mobile não pode fixar o card de autenticação em 370px.',
);

requirePattern(login, /label="E-mail"/, 'O login deve fornecer label acessível para e-mail.');
requirePattern(login, /<h1\b/, 'O login deve ter heading principal semântico.');
requirePattern(cadastro, /label="Nome"/, 'O cadastro deve fornecer label acessível para nome.');
requirePattern(cadastro, /label="E-mail"/, 'O cadastro deve fornecer label acessível para e-mail.');
requirePattern(cadastro, /<h1\b/, 'O cadastro deve ter heading principal semântico.');
requirePattern(
  verificacao,
  /label="Código de verificação"/,
  'A verificação deve fornecer label acessível para o código.',
);
requirePattern(verificacao, /<h1\b/, 'A verificação deve ter heading principal semântico.');
requirePattern(dashboardPage, /<h1\b/, 'O dashboard deve ter heading principal semântico.');
requirePattern(
  monthlyPage,
  /<h1\b/,
  'O gerenciamento mensal deve ter heading principal semântico.',
);
requirePattern(notFoundPage, /<h1\b/, 'A página de erro deve ter heading principal semântico.');

for (const [name, modal] of [
  ['criação de custo fixo', criarCusto],
  ['edição de custo fixo', editarCusto],
]) {
  requirePattern(
    modal,
    /for="custo-fixo-nome-[^"]+"/,
    `O modal de ${name} deve associar o label de nome.`,
  );
  requirePattern(
    modal,
    /for="custo-fixo-vencimento-[^"]+"/,
    `O modal de ${name} deve associar o label de vencimento.`,
  );
  requirePattern(
    modal,
    /for="custo-fixo-categoria-[^"]+"/,
    `O modal de ${name} deve associar o label de categoria.`,
  );
}

requirePattern(
  periodSelector,
  /v-for="year in visibleYears"[\s\S]*?:aria-pressed="selectedYear === year"/,
  'Os anos devem ser botões com estado acessível.',
);
requirePattern(
  periodSelector,
  /v-for="month in months"[\s\S]*?:aria-pressed="selectedMonth === month\.mes"/,
  'Os meses devem ser botões com estado acessível.',
);
forbidPattern(
  periodSelector,
  /<div\b[^>]*v-for="(?:year in visibleYears|month in months)"[^>]*@click=/,
  'Anos e meses não podem depender de divs clicáveis.',
);
requirePattern(
  periodSelector,
  /aria-label="Ir para o mês anterior"/,
  'A navegação mensal anterior deve ter nome acessível.',
);
requirePattern(
  periodSelector,
  /aria-label="Ir para o próximo mês"/,
  'A navegação mensal seguinte deve ter nome acessível.',
);

requirePattern(
  dateInput,
  /@keydown\.enter\.prevent="openDialog"/,
  'O campo de data deve abrir com Enter.',
);
requirePattern(
  dateInput,
  /@keydown\.space\.prevent="openDialog"/,
  'O campo de data deve abrir com Espaço.',
);
requirePattern(
  dateInput,
  /<q-btn[\s\S]*?aria-label="Abrir calendário"/,
  'O acionador do calendário deve ser um botão nomeado.',
);
requirePattern(
  dateInput,
  /v-bind="\$attrs"/,
  'ModernDateInput deve encaminhar atributos acessíveis ao q-input.',
);
requirePattern(
  moneyInput,
  /v-bind="inputProps"[\s\S]*?label:\s*props\.label[\s\S]*?for:\s*props\.for/,
  'MoneyInputBR deve encaminhar label e for ao q-input.',
);

for (const component of ['ModernDateInput', 'MoneyInputBR']) {
  for (const filePath of listVueFiles(path.join(root, 'src'))) {
    const sourceFile = fs.readFileSync(filePath, 'utf8');
    for (const tag of sourceFile.match(new RegExp(`<${component}\\b[^>]*>`, 'g')) ?? []) {
      if (
        !hasAssignedAttribute(tag, ['label', ':label', 'aria-label', ':aria-label', 'for', ':for'])
      ) {
        failures.push(`${relative(filePath)}: ${component} sem contrato de nome acessível.`);
      }
    }
  }
}

requirePattern(
  mainLayout,
  /:aria-label="themeStore\.isDark \? 'Ativar modo claro' : 'Ativar modo escuro'"/,
  'O botão de tema deve ter nome acessível dinâmico.',
);
requirePattern(
  mainLayout,
  /aria-label="Abrir configurações"/,
  'O botão de configurações deve ter nome acessível.',
);
requirePattern(
  mainLayout,
  /aria-label="Abrir menu da conta"/,
  'O botão da conta deve ter nome acessível.',
);

requirePattern(
  quasarConfig,
  /LOGIN_URL:\s*'\/#\/login'/,
  'A configuração deve expor LOGIN_URL compatível com o router hash.',
);
forbidPattern(
  `${quasarConfig}\n${envTypes}`,
  /lOGIN_URL/,
  'A configuração e seu contrato TypeScript não podem conter lOGIN_URL.',
);
requirePattern(
  envTypes,
  /LOGIN_URL:\s*string\s*\|\s*undefined/,
  'O contrato TypeScript deve declarar LOGIN_URL.',
);
for (const [name, source] of [
  ['AxiosHelper', axiosHelper],
  ['TokenRenewalService', tokenRenewal],
]) {
  requirePattern(
    source,
    /process\.env\.LOGIN_URL\s*\?\?\s*'\/#\/login'/,
    `${name} deve usar fallback hash para o login.`,
  );
}

if (failures.length > 0) {
  console.error('Falha nas regressões de acessibilidade e UX:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Regressões de acessibilidade e UX validadas.');
}
