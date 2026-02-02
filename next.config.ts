const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/users/avatar/:userId",
        destination: "http://localhost:3000/api/users/avatar/:userId",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/users/avatar/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
};
