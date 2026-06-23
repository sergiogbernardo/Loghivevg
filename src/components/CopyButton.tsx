import { useState } from 'react';

interface Props {
  value: string;
  label?: string;
}

export default function CopyButton({ value, label = 'copiar' }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore silently.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-emerald-400/50 hover:text-emerald-300"
    >
      {copied ? 'copiado' : label}
    </button>
  );
}
