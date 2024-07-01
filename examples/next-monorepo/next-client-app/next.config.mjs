/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@palmares/core", "@palmares/std"],
  }
};

export default nextConfig;
