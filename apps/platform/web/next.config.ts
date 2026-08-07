import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const root = process.env.INIT_CWD ?? resolve(process.cwd(), "../../..");
const environmentFile = resolve(root, ".env");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const config: NextConfig = {
  distDir: "../../../.next",
  env: {
    DEV_LOGIN_AUTO: process.env.DEV_LOGIN_AUTO,
    LOGIN_COOKIE_NAME: process.env.LOGIN_COOKIE_NAME,
    PUBLIC_URL: process.env.PUBLIC_URL
  },
  async rewrites() {
    const apiOrigin = process.env.API_URL;
    if (!apiOrigin) throw new Error("API_URL is required");
    return [{ source: "/api/:path*", destination: `${apiOrigin}/:path*` }];
  }
};

export default config;
