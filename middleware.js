import { NextResponse } from "next/server";

// Protects everything under /admin with HTTP Basic Auth.
// Set ADMIN_USER and ADMIN_PASSWORD in your environment variables
// (Vercel: Project Settings > Environment Variables). Do NOT prefix
// them with NEXT_PUBLIC_ — that would ship them to the browser bundle,
// which defeats the entire point of this file.
export function middleware(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const encoded = authHeader.split(" ")[1] || "";
    const decoded = atob(encoded);
    const [user, password] = decoded.split(":");

    if (user === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="A Slice of G Admin"',
    },
  });
}

// Only runs this check for paths under /admin — every other page on the
// site loads normally with no prompt.
export const config = {
  matcher: "/admin/:path*",
};
