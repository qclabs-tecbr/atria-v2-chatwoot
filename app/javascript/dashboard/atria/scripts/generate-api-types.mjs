/**
 * ATRIA — gera os tipos do motor `agents` a partir do `openapi.json`.
 * NÃO É SCRIPT DO UPSTREAM. Job 39 `[4.5:11b]`.
 *
 * Por que o spec vem de fora e não de uma URL:
 * o Swagger publicado no GitHub Pages é do upstream (`fazer-ai/agents`, ver
 * `.github/workflows/deploy-swagger.yml` lá) — ele NÃO tem as rotas do Kanban,
 * que são nossas. O spec que interessa é o `services/agents/openapi.json` do
 * repositório `v2/dev`, que é privado e não é publicado em lugar nenhum.
 *
 * Por isso o `.d.ts` gerado é COMMITADO: o build do fork não pode depender de
 * ter o outro repositório em disco, nem de rede. Quem regera é quem mexeu no
 * contrato, e o `--check` abaixo é como se prova que não regerou errado.
 *
 * Uso:
 *   ATRIA_OPENAPI_SPEC=<caminho>/services/agents/openapi.json \
 *     node app/javascript/dashboard/atria/scripts/generate-api-types.mjs
 *   ... --check   → não escreve; sai 1 se o arquivo commitado divergir do spec.
 *
 * (Mesma disciplina do `bun openapi:check` do lado do `agents`: lá o portão é
 * código→spec, aqui é spec→tipos. O elo spec→fork NÃO tem CI automático,
 * porque o CI do fork não alcança o repositório privado do `agents`. Isso é
 * limitação declarada, não descuido — está registrado no `#plano` msg 1836.)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, '../api/atria-api.d.ts');

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const specArg = args
  .find(a => a.startsWith('--spec='))
  ?.slice('--spec='.length);
const specPath = specArg ?? process.env.ATRIA_OPENAPI_SPEC;

if (!specPath) {
  console.error(
    'Falta o spec. Passe --spec=<caminho do services/agents/openapi.json> ou\n' +
      'defina ATRIA_OPENAPI_SPEC. Não há default: o caminho do outro repositório\n' +
      'muda de máquina pra máquina, e um default errado geraria tipos silenciosamente\n' +
      'desatualizados — que é exatamente o que este arquivo existe pra impedir.'
  );
  process.exit(2);
}

const absSpec = resolve(process.cwd(), specPath);
if (!existsSync(absSpec)) {
  console.error(`Spec não encontrado: ${absSpec}`);
  process.exit(2);
}

const spec = JSON.parse(await readFile(absSpec, 'utf8'));

// Aviso alto, não silencioso: uma rota sem 2xx declarado gera um tipo de
// sucesso VAZIO. O client compila, parece pronto, e não confere nada — que é
// o modo de falha que motivou este job (`#plano` msg 1836).
const semSucesso = [];
for (const [rota, ops] of Object.entries(spec.paths ?? {})) {
  if (!rota.includes('/kanban')) continue;
  for (const [metodo, op] of Object.entries(ops)) {
    const tem2xx = Object.keys(op.responses ?? {}).some(s => s.startsWith('2'));
    if (!tem2xx) semSucesso.push(`${metodo.toUpperCase()} ${rota}`);
  }
}
if (semSucesso.length) {
  console.warn(
    `\n⚠️  ${semSucesso.length} rota(s) do Kanban sem resposta 2xx no spec:\n` +
      semSucesso.map(r => `   - ${r}`).join('\n') +
      '\n   O tipo de sucesso delas sai VAZIO. Isso é o [4.5:11a] (contrato, dev-sr),\n' +
      '   não um erro deste gerador. Ver o teste de portão em specs/atriaApiTypes.spec.js.\n'
  );
}

// Só as rotas que o fork consome. Não é economia de bytes: o spec inteiro são
// 207 operações e 616 KB de tipos, e QUALQUER mudança no backend (uma rota de
// admin, um callback de OAuth) faria `pnpm atria:types:check` acusar drift aqui
// dentro. Portão que acusa o que não é da nossa conta é portão que alguém
// desliga na terceira vez. Este só reage ao que a tela realmente usa.
const ROTAS = [
  '/v1/kanban/boards',
  '/v1/kanban/boards/{boardId}/cards',
  '/v1/kanban/cards/{cardId}',
  '/v1/kanban/cards/{cardId}/move',
  // Rota de controle: declara 200 no spec de hoje. Serve pro teste de portão
  // separar "o gerador não extrai sucesso" de "o Kanban não declara sucesso".
  '/health',
];

const ausentes = ROTAS.filter(r => !(r in (spec.paths ?? {})));
if (ausentes.length) {
  console.error(
    `Rotas esperadas sumiram do spec: ${ausentes.join(', ')}.\n` +
      'Ou o backend renomeou a rota, ou o spec passado é de outra versão. ' +
      'Não gero tipos por cima disso — a tela quebraria sem ninguém ver.'
  );
  process.exit(2);
}

const specFiltrado = {
  ...spec,
  paths: Object.fromEntries(ROTAS.map(r => [r, spec.paths[r]])),
};

const ast = await openapiTS(specFiltrado, { alphabetize: true });
const corpo = astToString(ast);

const cabecalho = `/**
 * ATRIA — GERADO. NÃO EDITE À MÃO.
 *
 * Fonte: \`services/agents/openapi.json\` do repositório \`v2/dev\`.
 * Regerar: \`pnpm atria:types\` (ver scripts/generate-api-types.mjs).
 *
 * Rotas geradas: ${ROTAS.length} (de ${Object.keys(spec.paths ?? {}).length} no spec)
 * Rotas do Kanban sem tipo de sucesso neste snapshot: ${semSucesso.length}
 */

`;

const conteudo = cabecalho + corpo;

if (checkOnly) {
  const atual = existsSync(OUTPUT) ? await readFile(OUTPUT, 'utf8') : '';
  if (atual !== conteudo) {
    console.error(
      'Os tipos commitados divergem do spec. Rode `pnpm atria:types` e commite o resultado.'
    );
    process.exit(1);
  }
  console.log('Tipos em dia com o spec.');
  process.exit(0);
}

await writeFile(OUTPUT, conteudo, 'utf8');
console.log(`Escrito: ${OUTPUT}`);
