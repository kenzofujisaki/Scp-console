import { describe, it, expect, afterEach } from "vitest";
import { isPrivateHostname, assertSafeEndpointUrl, UnsafeUrlError } from "@/lib/security/url";

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
