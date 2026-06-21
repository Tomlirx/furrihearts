// Picks a subset of namespaces out of the full message bundle — used to keep
// each scoped NextIntlClientProvider's client payload limited to just the
// namespace(s) a given Client Component actually needs, instead of shipping
// the whole ~24KB bundle (the cause of the previous design's regression).
export function pickMessages<T extends Record<string, unknown>>(
  messages: T,
  keys: (keyof T)[]
): Pick<T, (typeof keys)[number]> {
  const picked = {} as Pick<T, (typeof keys)[number]>;
  for (const key of keys) picked[key] = messages[key];
  return picked;
}
