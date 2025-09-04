/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "https://9000-firebase-wisy-1756715724966.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
    ],
  },
};

module.exports = nextConfig;
