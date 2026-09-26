import type { SessionUser } from "@/lib/auth/types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const bin = atob(padded + "=".repeat(padLen));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function importKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? "dev-insecure";
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

export async function encodeSessionToken(user: SessionUser): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(user)));
  return `${payload}.${await signPayload(payload)}`;
}

export async function decodeSessionToken(token: string): Promise<SessionUser | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await signPayload(payload);
  if (sig.length !== expected.length) return null;
  let valid = true;
  for (let i = 0; i < sig.length; i++) {
    if (sig[i] !== expected[i]) valid = false;
  }
  if (!valid) return null;
  try {
    const json = decoder.decode(fromBase64Url(payload));
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}
