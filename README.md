# Loghivevg

Log and text analysis toolkit that runs **entirely in the browser**. The GitHub
Pages version of the local `loghive` project — no backend, no upload; every line
you paste stays on your machine.

Part of the [project hub](https://sergiogbernardo.github.io/), alongside
[Bytevg](https://sergiogbernardo.github.io/Bytevg/),
[Scanvg](https://sergiogbernardo.github.io/Scanvg/) and
[Inspectorvg](https://sergiogbernardo.github.io/Inspectorvg/).

## Tools

- **Log Parser** — auto-detects and parses Apache (common/combined), Nginx,
  syslog, Windows Event (CSV), IIS W3C, SSH auth and iptables logs into a table,
  with quick stats (top hosts, status codes, methods, timeline).
- **Regex Lab** — test and replace with live results and flags (`i`, `m`, `s`),
  plus a library of ready-made patterns (IP, URL, email, hashes, ports, MAC, …).
- **IOC Extractor** — pull IPs, domains, URLs, e-mails and MD5/SHA-1/SHA-256
  hashes out of any text.
- **Tools** — Base64, URL and Hex encode/decode.

## How it works

Everything is plain TypeScript: regular expressions, string parsing and the
native `btoa`/`atob`, `TextEncoder`/`TextDecoder` and `encodeURIComponent` APIs.
No runtime dependencies beyond React.

### Notes

- Regex uses the JavaScript engine: flags `i`/`m`/`s` are supported (`x` is not),
  and replacement strings use JS syntax (`$1`, `$<name>`).

## Stack

React + TypeScript + Vite + Tailwind. No backend, no tracking.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview
```

The Vite `base` is `/Loghivevg/` to match GitHub Pages. Deployment is automated
by `.github/workflows/deploy.yml` on every push to `main`.
