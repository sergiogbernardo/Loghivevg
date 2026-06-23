import type { RegexMatch } from '../types';

export interface RegexError {
  error: string;
}

// Map the subset of supported flags to JS RegExp flags. Python's `x` (verbose)
// has no JS equivalent and is ignored. `g` is always added for global scanning.
function jsFlags(flags: string): string {
  let out = 'g';
  if (flags.includes('i')) out += 'i';
  if (flags.includes('m')) out += 'm';
  if (flags.includes('s')) out += 's';
  return out;
}

function compile(pattern: string, flags: string): RegExp {
  return new RegExp(pattern, jsFlags(flags));
}

export function testRegex(
  pattern: string,
  text: string,
  flags: string,
): { matches: RegexMatch[] } | RegexError {
  let re: RegExp;
  try {
    re = compile(pattern, flags);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Regex inválido' };
  }

  const matches: RegexMatch[] = [];
  for (const m of text.matchAll(re)) {
    matches.push({
      value: m[0],
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
      groups: m.slice(1).filter((g): g is string => g != null),
    });
    if (m[0] === '') re.lastIndex++; // avoid infinite loop on empty matches
  }
  return { matches };
}

export function replaceRegex(
  pattern: string,
  text: string,
  replacement: string,
  flags: string,
): { result: string; count: number } | RegexError {
  let re: RegExp;
  try {
    re = compile(pattern, flags);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Regex inválido' };
  }

  const count = (text.match(re) ?? []).length;
  // String.replace handles $1/$&/$<name> substitutions natively.
  const result = text.replace(re, replacement);
  return { result, count };
}
