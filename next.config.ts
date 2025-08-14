import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverActions: {
    // Use a numeric bytes value to ensure the limit is applied (20 MB)
    bodySizeLimit: 20 * 1024 * 1024,
  },
};

export default nextConfig;
