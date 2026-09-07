/**
 * ATRIA — regras para os scripts de linha de comando desta pasta.
 * NÃO É CONFIG DO UPSTREAM.
 *
 * O `.eslintrc.js` da raiz mira código de dashboard que roda no browser: proíbe
 * `console` (vira log em produção) e `for..of` (regenerator-runtime no bundle).
 * Nada disso se aplica a um script Node que roda uma vez, na mão, e cujo
 * trabalho é justamente IMPRIMIR o que fez — o aviso de rota sem 2xx é a parte
 * mais importante da saída dele.
 *
 * Fica aqui dentro, e não na raiz, pelo mesmo motivo do `tsconfig.json` desta
 * pasta: config na raiz é arquivo que o upstream também mexe.
 */
module.exports = {
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-console': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
  },
};
