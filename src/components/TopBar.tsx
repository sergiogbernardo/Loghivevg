const HUB_URL = 'https://sabion.io/';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-500/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <span className="font-display text-lg font-bold tracking-tight text-emerald-300">
          Loghivevg
        </span>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" />
            client-side
          </span>
          <a
            href={HUB_URL}
            aria-label="Hub de Projetos"
            title="Hub de Projetos"
            className="flex shrink-0 items-center transition hover:scale-105"
          >
            <img
              src={`${import.meta.env.BASE_URL}hub-icon.png`}
              alt="Hub de Projetos"
              className="h-8 w-8"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
