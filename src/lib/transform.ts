// Text encode/decode operations, ported from the Python `transform.py`. All use
// native browser APIs and handle UTF-8 correctly.

export type Operation =
  | 'b64encode'
  | 'b64decode'
  | 'urlencode'
  | 'urldecode'
  | 'hexencode'
  | 'hexdecode';

export const OPERATIONS: { id: Operation; label: string }[] = [
  { id: 'b64encode', label: 'Base64 encode' },
  { id: 'b64decode', label: 'Base64 decode' },
  { id: 'urlencode', label: 'URL encode' },
  { id: 'urldecode', label: 'URL decode' },
  { id: 'hexencode', label: 'Hex encode' },
  { id: 'hexdecode', label: 'Hex decode' },
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.trim());
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function transform(operation: Operation, text: string): string {
  switch (operation) {
    case 'b64encode':
      return bytesToBase64(encoder.encode(text));
    case 'b64decode':
      return decoder.decode(base64ToBytes(text));
    case 'urlencode':
      return encodeURIComponent(text);
    case 'urldecode':
      return decodeURIComponent(text);
    case 'hexencode':
      return Array.from(encoder.encode(text), (b) => b.toString(16).padStart(2, '0')).join('');
    case 'hexdecode': {
      const clean = text.replace(/\s+/g, '');
      if (clean.length % 2 !== 0) throw new Error('Hex inválido: número ímpar de dígitos');
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        const byte = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
        if (Number.isNaN(byte)) throw new Error('Hex inválido');
        bytes[i] = byte;
      }
      return decoder.decode(bytes);
    }
  }
}
