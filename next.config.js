/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: true,
  mdxRs: true,
  serverComponentsExternalPackages: ["mongoose"],
};

module.exports = nextConfig;
