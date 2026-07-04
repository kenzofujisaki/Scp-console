/**
 * SSRF guard for user-supplied SCP endpoint URLs.
 *
 * The probe and connect flows fetch an operator-provided URL server-side, which
 * is a classic SSRF vector — a hostile value could point at loopback, private
 * ranges, or the cloud metadata endpoint (169.254.169.254). We reject those,
 * plus any non-http(s) scheme.
 *
 * Set SCP_ALLOW_PRIVATE_ENDPOINTS=true to permit private hosts for local dev
 * (e.g. pointing the Console at a server on localhost).
 *
 * Note: this validates the URL's literal host. A hardened deployment should
 * additionally resolve the hostname and re-check the resolved IP to defeat
 * DNS-rebinding; that's out of scope for this demo.
 */

export class UnsafeUrlError extends Error {}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
]);

/** True if the hostname is a loopback, private, link-local, or CGNAT address. */
export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (BLOCKED_HOSTNAMES.has(h)) return true;

  // IPv6 loopback / unspecified / link-local (fe80::/10) / unique-local (fc00::/7)
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;

  // IPv4 literal ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8 private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  }

  return false;
}

/**
 * Parse and validate a user-supplied endpoint URL, throwing UnsafeUrlError on
 * anything that isn't a public http(s) address. Returns the parsed URL.
 */
export function assertSafeEndpointUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https URLs are supported");
  }

  if (process.env.SCP_ALLOW_PRIVATE_ENDPOINTS === "true") return url;

  if (isPrivateHostname(url.hostname)) {
    throw new UnsafeUrlError(
      "Refusing to connect to a private, loopback, or link-local address",
    );
  }

  return url;
}
