/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 14: keep native modules out of the server bundle.
  // (Renamed to top-level `serverExternalPackages` in Next 15.)
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default nextConfig;
