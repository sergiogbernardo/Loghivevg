export type LogRow = Record<string, string | number>;

export interface DetectResult {
  format: string;
  label: string;
  confidence: number;
}

export interface ParseResult {
  format: string;
  label: string;
  fields: string[];
  rows: LogRow[];
  total: number;
}

export interface RegexMatch {
  value: string;
  start: number;
  end: number;
  groups: string[];
}

export interface IocResult {
  ips: string[];
  domains: string[];
  urls: string[];
  emails: string[];
  hashes: Record<string, string[]>;
}

export interface Pattern {
  id: string;
  label: string;
  regex: string;
  description: string;
}

export interface Stats {
  topHosts: { value: string; count: number }[];
  statusDistribution: { value: string; count: number }[];
  methods: { value: string; count: number }[];
  timeline: { time: string; count: number }[];
}
