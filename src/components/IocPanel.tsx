import { useMemo, useState } from 'react';
import { extractIocs, hasIocs } from '../lib/iocs';
import CopyButton from './CopyButton';

function List({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="field-label mb-0">
          {label} <span className="text-slate-500">({items.length})</span>
        </span>
        <CopyButton value={items.join('\n')} />
      </div>
      <pre className="max-h-52 overflow-auto rounded-lg border border-emerald-500/10 bg-black/60 p-2 font-mono text-xs leading-relaxed text-slate-300">
        {items.join('\n')}
      </pre>
    </div>
  );
}

export default function IocPanel() {
  const [text, setText] = useState('');
  const result = useMemo(() => extractIocs(text), [text]);
  const found = hasIocs(result);

  return (
    <div className="space-y-4">
      <div className="panel">
        <label className="field-label">Texto / log</label>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="cole logs ou qualquer texto para extrair IPs, domínios, URLs, e-mails e hashes…"
        />
      </div>

      {text && !found && (
        <p className="font-mono text-xs text-slate-500">nenhum indicador encontrado</p>
      )}

      {found && (
        <div className="panel grid grid-cols-1 gap-4 sm:grid-cols-2">
          <List label="IPs" items={result.ips} />
          <List label="Domínios" items={result.domains} />
          <List label="URLs" items={result.urls} />
          <List label="E-mails" items={result.emails} />
          {result.hashes.md5 && <List label="MD5" items={result.hashes.md5} />}
          {result.hashes.sha1 && <List label="SHA-1" items={result.hashes.sha1} />}
          {result.hashes.sha256 && <List label="SHA-256" items={result.hashes.sha256} />}
        </div>
      )}
    </div>
  );
}
