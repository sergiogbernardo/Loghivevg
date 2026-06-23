import { useMemo, useState } from 'react';
import { replaceRegex, testRegex } from '../lib/regex';
import { PATTERNS } from '../lib/patterns';

const FLAGS = [
  { id: 'i', label: 'i · ignore case' },
  { id: 'm', label: 'm · multiline' },
  { id: 's', label: 's · dotall' },
];

const SAMPLE = `2024-01-15 10:32:01 user admin@corp.com from 203.0.113.5 port 4444
GET /admin?token=abc123 HTTP/1.1 200
hash 5d41402abc4b2a76b9719d911017c592`;

export default function RegexLabPanel() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(SAMPLE);
  const [mode, setMode] = useState<'test' | 'replace'>('test');
  const [replacement, setReplacement] = useState('');

  const toggleFlag = (id: string) =>
    setFlags((f) => (f.includes(id) ? f.replace(id, '') : f + id));

  const result = useMemo(() => {
    if (!pattern) return null;
    return mode === 'test'
      ? testRegex(pattern, text, flags)
      : replaceRegex(pattern, text, replacement, flags);
  }, [pattern, text, flags, mode, replacement]);

  const error = result && 'error' in result ? result.error : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-4">
        <div className="panel space-y-3">
          <div>
            <label className="field-label">Regex</label>
            <input
              className="input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\b\d{1,3}(\.\d{1,3}){3}\b"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {FLAGS.map((f) => (
              <label key={f.id} className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={flags.includes(f.id)}
                  onChange={() => toggleFlag(f.id)}
                  className="accent-emerald-400"
                />
                {f.label}
              </label>
            ))}
            <div className="ml-auto flex gap-1">
              {(['test', 'replace'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md border px-2.5 py-1 font-mono text-xs transition ${
                    mode === m
                      ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                      : 'border-emerald-500/15 text-slate-400 hover:border-emerald-400/40'
                  }`}
                >
                  {m === 'test' ? 'testar' : 'substituir'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'replace' && (
            <div>
              <label className="field-label">Substituição (use $1, $2…)</label>
              <input
                className="input"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="[redacted]"
              />
            </div>
          )}

          <div>
            <label className="field-label">Texto</label>
            <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title mb-3">Resultado</h2>
          {error && <p className="font-mono text-sm text-red-300">{error}</p>}
          {!error && result && 'matches' in result && (
            <>
              <p className="mb-3 font-mono text-xs text-slate-400">
                {result.matches.length} ocorrência(s)
              </p>
              <div className="max-h-72 space-y-1.5 overflow-auto">
                {result.matches.map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-baseline gap-2 rounded-lg border border-emerald-500/10 bg-black/60 px-3 py-1.5"
                  >
                    <code className="font-mono text-sm text-emerald-200">{m.value}</code>
                    <span className="font-mono text-[10px] text-slate-500">
                      @{m.start}–{m.end}
                    </span>
                    {m.groups.length > 0 && (
                      <span className="font-mono text-[10px] text-slate-400">
                        grupos: {m.groups.join(' · ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {!error && result && 'result' in result && (
            <>
              <p className="mb-3 font-mono text-xs text-slate-400">
                {result.count} substituição(ões)
              </p>
              <pre className="max-h-72 overflow-auto rounded-lg border border-emerald-500/10 bg-black/60 p-3 font-mono text-sm text-slate-300">
                {result.result}
              </pre>
            </>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title mb-3">Biblioteca</h2>
        <div className="space-y-1.5">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPattern(p.regex)}
              title={p.description}
              className="block w-full rounded-lg border border-emerald-500/10 px-3 py-1.5 text-left font-mono text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
