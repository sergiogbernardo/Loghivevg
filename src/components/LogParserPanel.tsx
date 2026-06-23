import { useState } from 'react';
import { detectFormat } from '../lib/detector';
import { PARSERS, fieldsFor } from '../lib/parsers';
import { computeStats } from '../lib/stats';
import type { LogRow, Stats } from '../types';

const SAMPLE = `127.0.0.1 - - [10/Oct/2023:13:55:36 -0300] "GET /index.html HTTP/1.1" 200 2326
203.0.113.5 - - [10/Oct/2023:13:55:40 -0300] "POST /login HTTP/1.1" 401 512
198.51.100.9 - - [10/Oct/2023:13:56:01 -0300] "GET /admin HTTP/1.1" 403 128`;

const FORMAT_OPTIONS = [
  { id: 'auto', label: 'Detectar automaticamente' },
  ...Object.entries(PARSERS).map(([id, def]) => ({ id, label: def.label })),
];

interface Parsed {
  label: string;
  confidence: number | null;
  fields: string[];
  rows: LogRow[];
  stats: Stats;
}

function StatBlock({ title, items }: { title: string; items: { value: string; count: number }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <span className="field-label">{title}</span>
      <div className="space-y-1">
        {items.map((it) => (
          <div key={it.value} className="flex items-center justify-between gap-2 font-mono text-xs">
            <span className="truncate text-slate-300">{it.value}</span>
            <span className="text-emerald-300">{it.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogParserPanel() {
  const [text, setText] = useState(SAMPLE);
  const [format, setFormat] = useState('auto');
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    setParsed(null);
    if (!text.trim()) {
      setError('Texto vazio');
      return;
    }

    let formatId = format;
    let label = '';
    let confidence: number | null = null;

    if (formatId === 'auto') {
      const det = detectFormat(text);
      formatId = det.format;
      label = det.label;
      confidence = det.confidence;
    } else {
      label = PARSERS[formatId]?.label ?? '';
    }

    if (formatId === 'unknown' || !PARSERS[formatId]) {
      setError('Formato não reconhecido');
      return;
    }

    const lines = text.split('\n').filter((l) => l.trim());
    const rows = PARSERS[formatId].parse(lines);
    const fields = fieldsFor(formatId, rows);
    setParsed({ label, confidence, fields, rows, stats: computeStats(rows, fields) });
  };

  return (
    <div className="space-y-4">
      <div className="panel space-y-3">
        <div>
          <label className="field-label">Log</label>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="cole linhas de log aqui…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select className="input max-w-xs" value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMAT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id} className="bg-slate-900">
                {o.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn" onClick={run}>
            Analisar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {parsed && (
        <>
          <div className="panel">
            <p className="font-mono text-xs text-slate-400">
              Formato: <span className="text-emerald-300">{parsed.label}</span>
              {parsed.confidence != null && ` · confiança ${Math.round(parsed.confidence * 100)}%`}
              {' · '}
              {parsed.rows.length} linha(s)
            </p>
          </div>

          {(parsed.stats.topHosts.length > 0 ||
            parsed.stats.statusDistribution.length > 0 ||
            parsed.stats.methods.length > 0) && (
            <div className="panel grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatBlock title="Top hosts" items={parsed.stats.topHosts} />
              <StatBlock title="Status" items={parsed.stats.statusDistribution} />
              <StatBlock title="Métodos" items={parsed.stats.methods} />
            </div>
          )}

          {parsed.rows.length > 0 ? (
            <div className="panel overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-emerald-500/20 text-emerald-300/80">
                    {parsed.fields.map((f) => (
                      <th key={f} className="whitespace-nowrap px-2 py-1.5 font-semibold uppercase tracking-wider">
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 200).map((row, i) => (
                    <tr key={i} className="border-b border-emerald-500/5 text-slate-300">
                      {parsed.fields.map((f) => (
                        <td key={f} className="max-w-xs truncate px-2 py-1" title={String(row[f] ?? '')}>
                          {String(row[f] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 200 && (
                <p className="mt-2 font-mono text-[11px] text-slate-500">
                  mostrando 200 de {parsed.rows.length} linhas
                </p>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-slate-500">
              nenhuma linha casou com o formato selecionado
            </p>
          )}
        </>
      )}
    </div>
  );
}
