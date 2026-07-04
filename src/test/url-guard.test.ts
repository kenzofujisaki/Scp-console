import { describe, it, expect, afterEach } from "vitest";
import {
  isPrivateHostname,
  assertSafeEndpointUrl,
  hostnameResolvesToPrivate,
  assertEndpointResolvesPublic,
  UnsafeUrlError,
  type DnsLookup,
} from "@/lib/security/url";

const resolvesTo =
  (...ips: string[]): DnsLookup =>
  async () =>
    ips.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
const resolveFails: DnsLookup = async () => {
  throw new Error("ENOTFOUND");
};

describe("isPrivateHostname", () => {
  it("flags loopback, private, link-local, and CGNAT hosts", () => {
    for (const h of [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "10.1.2.3",
      "172.16.5.9",
      "172.31.255.255",
      "192.168.0.1",
      "169.254.169.254", // cloud metadata
      "100.100.0.1", // CGNAT
      "::1",
      "fe80::1",
      "fd00::1",
      "metadata.google.internal",
    ]) {
      expect(isPrivateHostname(h)).toBe(true);
    }
  });

  it("allows ordinary public hosts", () => {
    for (const h of ["scp.example.com", "8.8.8.8", "172.15.0.1", "172.32.0.1", "example.org"]) {
      expect(isPrivateHostname(h)).toBe(false);
    }
  });
});

describe("assertSafeEndpointUrl", () => {
  afterEach(() => {
    delete process.env.SCP_ALLOW_PRIVATE_ENDPOINTS;
  });

  it("returns the URL for a public https endpoint", () => {
    expect(assertSafeEndpointUrl("https://scp.example.com/v1").hostname).toBe("scp.example.com");
  });

  it("throws on an unparseable URL", () => {
    expect(() => assertSafeEndpointUrl("not-a-url")).toThrow(UnsafeUrlError);
  });

  it("throws on a non-http(s) scheme", () => {
    expect(() => assertSafeEndpointUrl("file:///etc/passwd")).toThrow(/http and https/);
  });

  it("throws on a private/loopback host", () => {
    expect(() => assertSafeEndpointUrl("http://127.0.0.1/v1")).toThrow(
      /private, loopback, or link-local/,
    );
  });

  it("permits private hosts when the opt-out env is set", () => {
    process.env.SCP_ALLOW_PRIVATE_ENDPOINTS = "true";
    expect(assertSafeEndpointUrl("http://localhost:8787/v1").hostname).toBe("localhost");
  });
});

describe("DNS-rebinding guard", () => {
  afterEach(() => {
    delete process.env.SCP_ALLOW_PRIVATE_ENDPOINTS;
  });

  it("flags a public hostname whose A-record points inward", async () => {
    // The rebinding trick: name looks public, resolves to loopback/private
    expect(await hostnameResolvesToPrivate("rebind.evil.test", resolvesTo("127.0.0.1"))).toBe(true);
    expect(await hostnameResolvesToPrivate("meta.evil.test", resolvesTo("169.254.169.254"))).toBe(
      true,
    );
  });

  it("allows a hostname that resolves only to public addresses", async () => {
    expect(await hostnameResolvesToPrivate("scp.example.com", resolvesTo("93.184.216.34"))).toBe(
      false,
    );
  });

  it("is tolerant of resolution failure (no resolve = no SSRF)", async () => {
    expect(await hostnameResolvesToPrivate("nope.invalid", resolveFails)).toBe(false);
  });

  it("assertEndpointResolvesPublic throws on an inward-resolving host", async () => {
    await expect(
      assertEndpointResolvesPublic("rebind.evil.test", resolvesTo("10.0.0.5")),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("assertEndpointResolvesPublic respects the opt-out env", async () => {
    process.env.SCP_ALLOW_PRIVATE_ENDPOINTS = "true";
    await expect(
      assertEndpointResolvesPublic("rebind.evil.test", resolvesTo("127.0.0.1")),
    ).resolves.toBeUndefined();
  });
});
