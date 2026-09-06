/**
 * ATRIA — camada de tradução da Atria. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Espelha deliberadamente o mecanismo que a própria fazer.ai criou em
 * `../fazer-ai/index.js`, pelo mesmo motivo que eles declaram lá: a árvore
 * `../locale/` fica byte-idêntica ao release do Chatwoot que acompanhamos,
 * então sync de upstream nunca conflita com tradução nossa.
 *
 * Somos fork de fork, então precisamos da nossa própria camada em vez de
 * escrever dentro de `fazer-ai/locale/`: aquele diretório RECEBE mudanças
 * quando sincronizamos com a fazer.ai. Este aqui não recebe nada de ninguém.
 *
 * Ordem de precedência final: upstream < fazer.ai < Atria.
 *
 * Arquivos são descobertos por varredura de diretório — acrescentar um
 * namespace é criar um arquivo, e nada mais muda.
 */

const isPlainObject = value =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = (target, source) => {
  const result = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    result[key] =
      isPlainObject(value) && isPlainObject(result[key])
        ? deepMerge(result[key], value)
        : value;
  });

  return result;
};

const buildAtriaMessages = () => {
  const modules = import.meta.glob('./locale/*/*.json', { eager: true });
  const messages = {};

  Object.keys(modules)
    .sort()
    .forEach(path => {
      const locale = path.split('/')[2];
      const translations = modules[path].default ?? modules[path];
      messages[locale] = deepMerge(messages[locale] ?? {}, translations);
    });

  return messages;
};

export const atriaMessages = buildAtriaMessages();

/**
 * Faz merge profundo das traduções da Atria sobre as que vierem (upstream já
 * combinado com as da fazer.ai). Locale sem pasta nossa passa intacto.
 */
export const withAtriaMessages = messages => {
  const merged = { ...messages };

  Object.entries(atriaMessages).forEach(([locale, translations]) => {
    merged[locale] = deepMerge(merged[locale] ?? {}, translations);
  });

  return merged;
};

export default withAtriaMessages;
