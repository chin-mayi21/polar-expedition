/**
 * Auth.js uses AUTH_URL for redirects. On Render, PORT=10000 must never become the public URL.
 * Import this module before NextAuth is initialized (auth.config / auth.ts).
 */
function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function isBadAuthUrl(url: string | undefined) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes("localhost:10000")) return true;
  if (lower === "http://localhost:10000") return true;
  // Render internal binding — not a browser URL
  if (/localhost:\d+/.test(lower) && process.env.RENDER) return true;
  if (process.env.NODE_ENV === "development" && lower.includes("localhost") && !lower.includes(":3000") && !lower.includes(":3001")) {
    return true;
  }
  return false;
}

function applyAuthUrl(url: string) {
  const normalized = normalizeUrl(url);
  process.env.AUTH_URL = normalized;
  process.env.NEXTAUTH_URL = normalized;
}

export function bootstrapAuthEnv() {
  const renderExternal = process.env.RENDER_EXTERNAL_URL;
  const vercelHost = process.env.VERCEL_URL;

  if (renderExternal && isBadAuthUrl(process.env.AUTH_URL)) {
    applyAuthUrl(renderExternal);
    return;
  }

  if (vercelHost && isBadAuthUrl(process.env.AUTH_URL)) {
    applyAuthUrl(vercelHost.startsWith("http") ? vercelHost : `https://${vercelHost}`);
    return;
  }

  if (process.env.NODE_ENV === "development" && isBadAuthUrl(process.env.AUTH_URL)) {
    const port = process.env.PORT || "3000";
    applyAuthUrl(`http://localhost:${port}`);
    return;
  }

  if (process.env.AUTH_URL && !isBadAuthUrl(process.env.AUTH_URL)) {
    process.env.NEXTAUTH_URL = normalizeUrl(process.env.AUTH_URL);
  }
}

bootstrapAuthEnv();
