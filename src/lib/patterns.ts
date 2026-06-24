import type { Pattern } from '../types';

// Ready-made regex library, ported from the Python `patterns.py`.
export const PATTERNS: Pattern[] = [
  {
    id: 'ip',
    label: 'IP Address',
    regex: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b',
    description: 'Endereço IPv4',
  },
  {
    id: 'ipv6',
    label: 'IPv6',
    regex: '\\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b',
    description: 'Endereço IPv6 completo',
  },
  { id: 'url', label: 'URL', regex: 'https?://[^\\s"<>\']+', description: 'URLs HTTP/HTTPS' },
  {
    id: 'email',
    label: 'Email',
    regex: '\\b[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}\\b',
    description: 'Endereço de email',
  },
  {
    id: 'domain',
    label: 'Domínio',
    regex: '\\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}\\b',
    description: 'Nome de domínio (FQDN)',
  },
  {
    id: 'hash_md5',
    label: 'Hash MD5',
    regex: '\\b[a-fA-F0-9]{32}\\b',
    description: 'Hash MD5 (32 hex chars)',
  },
  {
    id: 'hash_sha1',
    label: 'Hash SHA1',
    regex: '\\b[a-fA-F0-9]{40}\\b',
    description: 'Hash SHA-1 (40 hex chars)',
  },
  {
    id: 'hash_sha256',
    label: 'Hash SHA256',
    regex: '\\b[a-fA-F0-9]{64}\\b',
    description: 'Hash SHA-256 (64 hex chars)',
  },
  {
    id: 'port',
    label: 'Porta',
    regex: '\\b(?:[1-9]\\d{0,3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])\\b',
    description: 'Número de porta (1–65535)',
  },
  {
    id: 'timestamp_apache',
    label: 'Data Apache',
    regex: '\\d{2}/\\w{3}/\\d{4}:\\d{2}:\\d{2}:\\d{2}\\s[+-]\\d{4}',
    description: 'Timestamp formato Apache',
  },
  {
    id: 'timestamp_syslog',
    label: 'Data syslog',
    regex: '\\w{3}\\s+\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}',
    description: 'Timestamp formato syslog',
  },
  {
    id: 'status_code',
    label: 'HTTP Status',
    regex: '\\b(1\\d{2}|2\\d{2}|3\\d{2}|4\\d{2}|5\\d{2})\\b',
    description: 'Código de status HTTP',
  },
  {
    id: 'mac',
    label: 'MAC Address',
    regex: '\\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\\b',
    description: 'Endereço MAC',
  },
];
