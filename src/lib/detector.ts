import type { DetectResult } from '../types';

// Format signatures, ported from the Python detector. Each regex tries to match
// a representative line of the corresponding log format.
interface Signature {
  id: string;
  label: string;
  regex: RegExp;
}

export const SIGNATURES: Signature[] = [
  {
    id: 'apache_common',
    label: 'Apache Common Log Format',
    regex:
      /^(\S+)\s+\S+\s+\S+\s+\[\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s[+-]\d{4}\]\s+"\S+\s+\S+\s+\S+"\s+\d+\s+\S+$/,
  },
  {
    id: 'apache_combined',
    label: 'Apache Combined Log Format',
    regex:
      /^(\S+)\s+\S+\s+\S+\s+\[\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s[+-]\d{4}\]\s+"\S+\s+\S+\s+\S+"\s+\d+\s+\d+\s+".*?"\s+".*?"$/,
  },
  {
    id: 'nginx',
    label: 'Nginx Access Log',
    regex:
      /^\S+\s+-\s+\S+\s+\[\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s[+-]\d{4}\]\s+"\S+\s+\S+\s+\S+"\s+\d+\s+\d+\s+".*?"\s+".*?"(?:\s+".*?")?$/,
  },
  {
    id: 'syslog',
    label: 'Syslog (RFC 3164)',
    regex: /^<\d{1,3}>?\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2}\s\S+\s\S+/,
  },
  {
    id: 'windows_event',
    label: 'Windows Event Log (CSV)',
    regex: /^[^,]+,[^,]+,\d+,[^,]+,[^,]+,[^,]+,.+,\d{2}\/\d{2}\/\d{4},\d{2}:\d{2}:\d{2}\s[AP]M,/,
  },
  {
    id: 'iis',
    label: 'IIS W3C Extended',
    regex: /^#(?:Software|Version|Date|Fields|Start-Date|End-Date|IP)/,
  },
  {
    id: 'ssh_auth',
    label: 'SSH Auth Log',
    regex: /^\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2}\s\S+\s+sshd\[\d+\]:/,
  },
  {
    id: 'iptables',
    label: 'Firewall (iptables)',
    regex: /^\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2}\s\S+\s+kernel:\s.*IN=\S+.*SRC=\S+.*DST=\S+/,
  },
];

export function detectFormat(text: string): DetectResult {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { format: 'unknown', label: 'Unknown', confidence: 0 };

  const dataLines = lines.filter((l) => !l.startsWith('#'));

  let best: DetectResult = { format: 'unknown', label: 'Unknown', confidence: 0 };

  for (const sig of SIGNATURES) {
    let score: number;
    if (sig.id === 'iis') {
      const headers = lines.filter((l) => l.startsWith('#'));
      score = headers.length ? headers.filter((l) => sig.regex.test(l)).length / headers.length : 0;
    } else {
      const target = lines.length !== dataLines.length ? dataLines : lines;
      score = target.length ? target.filter((l) => sig.regex.test(l)).length / target.length : 0;
    }

    if (score > best.confidence) {
      best = { format: sig.id, label: sig.label, confidence: Math.round(score * 100) / 100 };
    }
  }

  return best;
}
