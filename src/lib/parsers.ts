import type { LogRow } from '../types';

// Line parsers, ported from the Python `parsers.py`. Each returns one row per
// matched line; unmatched lines are skipped.

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Apache timestamp: 10/Oct/2000:13:55:36 -0700
function parseApacheTs(ts: string): string {
  const m = /^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s([+-])(\d{2})(\d{2})$/.exec(ts);
  if (!m) return ts;
  const [, d, mon, y, hh, mm, ss, sign, oh, om] = m;
  if (!(mon in MONTHS)) return ts;
  const offset = (sign === '-' ? -1 : 1) * (Number(oh) * 60 + Number(om));
  const utc = Date.UTC(Number(y), MONTHS[mon], Number(d), Number(hh), Number(mm), Number(ss)) - offset * 60000;
  return new Date(utc).toISOString();
}

const APACHE_COMMON =
  /^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d+)\s+(\S+)/;
const APACHE_COMBINED =
  /^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d+)\s+(\S+)\s+"([^"]*)"\s+"([^"]*)"/;
const NGINX =
  /^(\S+)\s+-\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+(\S+)"\s+(\d+)\s+(\d+)\s+"([^"]*)"\s+"([^"]*)"/;
const SYSLOG = /^<(\d{1,3})>?(\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.*)/;
const SSH_AUTH =
  /^(\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2})\s+(\S+)\s+sshd\[(\d+)\]:\s+(Failed password|Accepted password|Failed publickey|Accepted publickey|Connection closed|Connection from|Invalid user|Did not receive identification|Connection reset by peer|Disconnected|pam_unix.*authentication failure)\s*(.*)?/;
const IPTABLES =
  /^(\w{3}\s+\d{1,2}\s\d{2}:\d{2}:\d{2})\s+(\S+)\s+kernel:\s+IN=(\S*)\s+OUT=(\S*)\s+.*?SRC=(\S+)\s+DST=(\S+)\s+LEN=(\d+)\s+.*?PROTO=(\S+)\s+(?:SPT=(\d+)\s+)?(?:DPT=(\d+)\s+)?/;

function eachLine(lines: string[], re: RegExp, build: (m: RegExpExecArray) => LogRow): LogRow[] {
  const rows: LogRow[] = [];
  for (const line of lines) {
    const m = re.exec(line);
    if (m) rows.push(build(m));
  }
  return rows;
}

const parseApacheCommon = (lines: string[]) =>
  eachLine(lines, APACHE_COMMON, (m) => ({
    host: m[1], ident: m[2], authuser: m[3], datetime: parseApacheTs(m[4]),
    method: m[5], path: m[6], protocol: m[7], status: Number(m[8]), bytes: m[9] === '-' ? 0 : m[9],
  }));

const parseApacheCombined = (lines: string[]) =>
  eachLine(lines, APACHE_COMBINED, (m) => ({
    host: m[1], ident: m[2], authuser: m[3], datetime: parseApacheTs(m[4]),
    method: m[5], path: m[6], protocol: m[7], status: Number(m[8]),
    bytes: m[9] === '-' ? 0 : Number(m[9]), referer: m[10], user_agent: m[11],
  }));

const parseNginx = (lines: string[]) =>
  eachLine(lines, NGINX, (m) => ({
    host: m[1], authuser: m[2] === '-' ? '' : m[2], datetime: parseApacheTs(m[3]),
    method: m[4], path: m[5], protocol: m[6], status: Number(m[7]),
    bytes: Number(m[8]), referer: m[9], user_agent: m[10],
  }));

const parseSyslog = (lines: string[]) =>
  eachLine(lines, SYSLOG, (m) => ({
    priority: m[1] ? Number(m[1]) : '', timestamp: m[2], hostname: m[3],
    appname: m[4], pid: m[5] ?? '', message: m[6],
  }));

function parseWindowsEvent(lines: string[]): LogRow[] {
  const fields = ['logname', 'source', 'event_id', 'level', 'user', 'computer', 'description', 'date', 'time', 'category', 'event_code'];
  const rows: LogRow[] = [];
  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 11) {
      const row: LogRow = {};
      fields.forEach((f, i) => (row[f] = parts[i]));
      rows.push(row);
    }
  }
  return rows;
}

function parseIis(lines: string[]): LogRow[] {
  let fields: string[] = [];
  const data: string[] = [];
  for (const line of lines) {
    if (line.startsWith('#Fields:')) {
      fields = line.slice('#Fields:'.length).trim().split(' ').map((f) => f.trim());
    } else if (!line.startsWith('#')) {
      data.push(line);
    }
  }
  if (fields.length === 0) return [];
  const rows: LogRow[] = [];
  for (const line of data) {
    const parts = line.split(' ');
    if (parts.length === fields.length) {
      const row: LogRow = {};
      fields.forEach((f, i) => (row[f] = parts[i]));
      rows.push(row);
    }
  }
  return rows;
}

const parseSshAuth = (lines: string[]) =>
  eachLine(lines, SSH_AUTH, (m) => {
    const extra = m[5] ?? '';
    return {
      timestamp: m[1], hostname: m[2], pid: m[3], event: m[4],
      user: /(?:for|user)\s+(\S+)/.exec(extra)?.[1] ?? '',
      src_ip: /from\s+(\S+)/.exec(extra)?.[1] ?? '',
      src_port: /port\s+(\d+)/.exec(extra)?.[1] ?? '',
      raw_message: extra,
    };
  });

const parseIptables = (lines: string[]) =>
  eachLine(lines, IPTABLES, (m) => ({
    timestamp: m[1], hostname: m[2], in: m[3], out: m[4], src: m[5], dst: m[6],
    len: m[7], proto: m[8], spt: m[9] ?? '', dpt: m[10] ?? '',
  }));

interface ParserDef {
  label: string;
  fields: string[];
  parse: (lines: string[]) => LogRow[];
}

export const PARSERS: Record<string, ParserDef> = {
  apache_common: {
    label: 'Apache Common Log Format',
    fields: ['host', 'ident', 'authuser', 'datetime', 'method', 'path', 'protocol', 'status', 'bytes'],
    parse: parseApacheCommon,
  },
  apache_combined: {
    label: 'Apache Combined Log Format',
    fields: ['host', 'ident', 'authuser', 'datetime', 'method', 'path', 'protocol', 'status', 'bytes', 'referer', 'user_agent'],
    parse: parseApacheCombined,
  },
  nginx: {
    label: 'Nginx Access Log',
    fields: ['host', 'authuser', 'datetime', 'method', 'path', 'protocol', 'status', 'bytes', 'referer', 'user_agent'],
    parse: parseNginx,
  },
  syslog: {
    label: 'Syslog (RFC 3164)',
    fields: ['priority', 'timestamp', 'hostname', 'appname', 'pid', 'message'],
    parse: parseSyslog,
  },
  windows_event: {
    label: 'Windows Event Log (CSV)',
    fields: ['logname', 'source', 'event_id', 'level', 'user', 'computer', 'description', 'date', 'time', 'category', 'event_code'],
    parse: parseWindowsEvent,
  },
  iis: { label: 'IIS W3C Extended', fields: [], parse: parseIis },
  ssh_auth: {
    label: 'SSH Auth Log',
    fields: ['timestamp', 'hostname', 'pid', 'event', 'user', 'src_ip', 'src_port'],
    parse: parseSshAuth,
  },
  iptables: {
    label: 'Firewall (iptables)',
    fields: ['timestamp', 'hostname', 'in', 'out', 'src', 'dst', 'len', 'proto', 'spt', 'dpt'],
    parse: parseIptables,
  },
};

export function fieldsFor(formatId: string, rows: LogRow[]): string[] {
  const def = PARSERS[formatId];
  if (!def) return [];
  // IIS fields are dynamic — derive them from the parsed rows.
  if (formatId === 'iis') return rows.length > 0 ? Object.keys(rows[0]) : [];
  return def.fields;
}
