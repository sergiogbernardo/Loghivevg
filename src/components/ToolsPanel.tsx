import { useMemo, useState } from 'react';
import { OPERATIONS, transform, type Operation } from '../lib/transform';
import CopyButton from './CopyButton';

export default function ToolsPanel() {
  const [operation, setOperation] = useState<Operation>('b64encode');
  const [input, setInput] = useState('');

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null as string | null };
    try {
      return { output: transform(operation, input), error: null };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Erro' };
    }
  }, [operation, input]);

  return (
    <div className="panel space-y-4">
      <h2 className="panel-title">Encode / Decode</h2>

      <div className="flex flex-wrap gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setOperation(op.id)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
              operation === op.id
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                : 'border-emerald-500/15 text-slate-400 hover:border-emerald-400/40'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div>
        <label className="field-label">Entrada</label>
        <textarea
          className="textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="cole o texto aqui…"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="field-label mb-0">Saída</span>
          {output && <CopyButton value={output} />}
        </div>
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <pre className="min-h-[6rem] overflow-auto rounded-lg border border-emerald-500/10 bg-black/60 p-3 font-mono text-sm text-emerald-200/90">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
