import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/test/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "src/lib/db/migrations/"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@scp/protocol": path.resolve(__dirname, "./packages/protocol/src/index.ts"),
      "@scp/client": path.resolve(__dirname, "./packages/client/src/index.ts"),
    },
  },
});
