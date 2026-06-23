import type { IocResult } from '../types';

// IOC extraction over free text, ported from the Python `ioc_extractor.py`.
// Sibling of Inspectorvg's IOC logic, tuned here for log/text triage (includes
// MD5/SHA-1/SHA-256 hash buckets).
const IP_RE = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const DOMAIN_RE = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
const URL_RE = /https?:\/\/[^\s"'<>]+/g;
const EMAIL_RE = /\b[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/g;
const MD5_RE = /\b[a-fA-F0-9]{32}\b/g;
const SHA1_RE = /\b[a-fA-F0-9]{40}\b/g;
const SHA256_RE = /\b[a-fA-F0-9]{64}\b/g;

function uniq(text: string, re: RegExp): string[] {
  return [...new Set(text.match(re) ?? [])];
}

export function extractIocs(text: string): IocResult {
  const ips = uniq(text, IP_RE).sort();
  const urls = uniq(text, URL_RE).sort();
  const emails = uniq(text, EMAIL_RE).sort();
  const md5 = uniq(text, MD5_RE);
  const sha1 = uniq(text, SHA1_RE);
  const sha256 = uniq(text, SHA256_RE);

  // Drop domains already represented by a URL or e-mail to reduce noise.
  const known = new Set<string>();
  for (const url of urls) {
    const host = /https?:\/\/([^/\s:]+)/.exec(url)?.[1];
    if (host) known.add(host);
  }
  for (const email of emails) known.add(email.split('@').pop() ?? '');

  const allDomains = uniq(text, DOMAIN_RE);
  const domains = [...new Set([...known, ...allDomains.filter((d) => !known.has(d))])].sort();

  const hashes: Record<string, string[]> = {};
  if (md5.length) hashes.md5 = md5;
  if (sha1.length) hashes.sha1 = sha1;
  if (sha256.length) hashes.sha256 = sha256;

  return { ips, domains, urls, emails, hashes };
}

export function hasIocs(r: IocResult): boolean {
  return (
    r.ips.length > 0 ||
    r.domains.length > 0 ||
    r.urls.length > 0 ||
    r.emails.length > 0 ||
    Object.keys(r.hashes).length > 0
  );
}
