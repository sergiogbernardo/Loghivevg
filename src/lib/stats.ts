import type { LogRow, Stats } from '../types';

function counter(values: (string | number)[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of values) {
    if (v === '' || v == null) continue;
    const key = String(v);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function topN(map: Map<string, number>, n?: number): { value: string; count: number }[] {
  const sorted = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));
  return n ? sorted.slice(0, n) : sorted;
}

// Aggregate quick stats from parsed rows, mirroring the Python `/stats` endpoint.
export function computeStats(rows: LogRow[], fields: string[]): Stats {
  const stats: Stats = { topHosts: [], statusDistribution: [], methods: [], timeline: [] };

  if (fields.includes('host')) {
    stats.topHosts = topN(counter(rows.map((r) => r.host ?? '')), 10);
  }

  if (fields.includes('status')) {
    stats.statusDistribution = topN(counter(rows.map((r) => r.status ?? ''))).sort((a, b) =>
      a.value.localeCompare(b.value),
    );
  }

  if (fields.includes('method')) {
    stats.methods = topN(counter(rows.map((r) => r.method ?? '')));
  }

  if (fields.includes('datetime')) {
    const buckets = new Map<string, number>();
    for (const r of rows) {
      const dt = r.datetime;
      if (typeof dt !== 'string' || !dt) continue;
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = `${d.toISOString().slice(0, 13)}:00`;
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    }
    stats.timeline = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, count]) => ({ time, count }));
  }

  return stats;
}
