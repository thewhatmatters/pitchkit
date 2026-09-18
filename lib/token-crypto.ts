/**
 * Encrypt Instagram tokens at rest with TOKEN_KEY (AES-256-GCM).
 * Format: `v1.<iv_b64url>.<cipher_b64url>`. Never log plaintext or KEY.
 */

const PREFIX = "v1";

function bytesToB64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function b64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/** SubtleCrypto BufferSource rejects Uint8Array<ArrayBufferLike> (TS 5.7+ DOM). */
function asBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

async function importKey(tokenKey: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tokenKey));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptToken(plaintext: string, tokenKey: string): Promise<string> {
  const key = await importKey(tokenKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${PREFIX}.${bytesToB64Url(iv)}.${bytesToB64Url(new Uint8Array(cipher))}`;
}

export async function decryptToken(
  ciphertext: string | null | undefined,
  tokenKey: string | null | undefined,
): Promise<string | null> {
  if (!ciphertext || !tokenKey) {
    return null;
  }
  const parts = ciphertext.split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX) {
    return null;
  }
  try {
    const key = await importKey(tokenKey);
    const iv = b64UrlToBytes(parts[1]!);
    const data = b64UrlToBytes(parts[2]!);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asBufferSource(iv) },
      key,
      asBufferSource(data),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export async function encryptTokenIfPossible(
  plaintext: string | null | undefined,
  tokenKey: string | null | undefined,
): Promise<string | null> {
  if (!plaintext || !tokenKey) {
    return null;
  }
  return encryptToken(plaintext, tokenKey);
}
