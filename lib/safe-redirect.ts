// Only allow same-origin relative paths. Rejects protocol-relative (//host),
// backslash tricks (/\host) that browsers normalise to //, and anything that
// doesn't start with a single "/". Prevents open-redirect via a ?next= param.
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}
