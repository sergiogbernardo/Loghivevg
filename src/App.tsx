import { useState } from 'react';
import TopBar from './components/TopBar';
import LogParserPanel from './components/LogParserPanel';
import RegexLabPanel from './components/RegexLabPanel';
import IocPanel from './components/IocPanel';
import ToolsPanel from './components/ToolsPanel';

const TABS = [
  { id: 'parser', label: 'Log Parser' },
  { id: 'regex', label: 'Regex Lab' },
  { id: 'iocs', label: 'IOC Extractor' },
  { id: 'tools', label: 'Tools' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('parser');

  return (
    <div className="min-h-screen bg-grid-glow">
      <TopBar />

      <nav className="sticky top-[57px] z-10 border-b border-emerald-500/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 lg:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 font-display text-sm font-semibold transition ${
                tab === t.id
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-6">
        {tab === 'parser' && <LogParserPanel />}
        {tab === 'regex' && <RegexLabPanel />}
        {tab === 'iocs' && <IocPanel />}
        {tab === 'tools' && <ToolsPanel />}
      </main>

      <footer className="border-t border-emerald-500/10 py-6 text-center font-mono text-xs text-slate-600">
        © 2026 Sergio Bernardo
      </footer>
    </div>
  );
}
