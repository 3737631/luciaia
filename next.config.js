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
    NEXT_PUBLIC_BASE_PATH: `/${repo}`,
  },
};

module.exports = nextConfig;
