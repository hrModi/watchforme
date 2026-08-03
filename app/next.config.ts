import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/coming-soon/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/fuel-price/india/:city',
        destination: '/petrol-price/india/:city',
        permanent: true,
      },
      {
        source: '/fuel-price/us/:state',
        destination: '/gasoline-price/us/:state',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
