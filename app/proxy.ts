import { NextRequest } from "next/server";

export const config = {
  matcher: "/users/avatar/:path*",
};

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get the original path without /users/avatar prefix
  const userId = pathname.split("/").pop();

  // Create the new URL to your backend
  const newUrl = new URL(`/api/users/avatar/${userId}`, req.nextUrl.origin);

  // Clone the request
  const proxyReq = new Request(newUrl, {
    method: req.method,
    headers: req.headers,
  });

  return fetch(proxyReq);
}
