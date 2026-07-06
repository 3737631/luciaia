/** @type {import('next').NextConfig} */
const repo = "luciaia";

const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}`,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === "development" ? "" : `/${repo}`,
  },
};

module.exports = nextConfig;
