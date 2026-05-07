const nextConfig = {
  output: "standalone",

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    return [
      {
        source: "/api/users/avatar/:userId",
        destination: `${backendUrl}/api/users/avatar/:userId`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/users/avatar/**",
      },
      // Production (Render backend URL, no port needed)
      {
        protocol: "https",
        hostname: process.env.BACKEND_HOSTNAME || "localhost",
        pathname: "/api/users/avatar/**",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
};

export default nextConfig;
