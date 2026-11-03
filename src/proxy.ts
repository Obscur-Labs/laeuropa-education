import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every page and form submission:
 *  - fresh CSP nonce per request (scripts without the nonce are blocked)
 *  - security headers
 *  - rejects state-changing requests that come from another website (CSRF defence in depth;
 *    Next.js Server Actions also verify the Origin themselves)
 */
export function proxy(request: NextRequest) {
  const method = request.method.toUpperCase();
  const { pathname } = request.nextUrl;

  if (!["GET", "HEAD", "POST", "OPTIONS"].includes(method)) {
    return new NextResponse("Method not allowed", { status: 405 });
  }

  if (method === "POST") {
    const origin = request.headers.get("origin");
    const site = request.headers.get("sec-fetch-site");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    let sameOrigin = false;
    if (origin) {
      try { sameOrigin = new URL(origin).host === host; } catch { sameOrigin = false; }
    } else {
      sameOrigin = site === "same-origin";
    }
    if (!sameOrigin) return new NextResponse("Forbidden", { status: 403 });
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  // Uploaded photos/PDFs are served from Cloudinary
  const media = process.env.CLOUDINARY_URL ? "https://res.cloudinary.com" : "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www-cdn.icef.com${isDev ? " 'unsafe-eval'" : ""}`,
    // React style={{}} props and the rich-text editor need inline style attributes (no script risk)
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${media} https://icef-api-production.s3.eu-central-1.amazonaws.com`,
    "font-src 'self'",
    `connect-src 'self' https://api2.icef.com${isDev ? " ws:" : ""}`,
    "frame-src https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    isDev ? "" : "upgrade-insecure-requests",
  ].filter(Boolean).join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  if (!isDev) response.headers.set("Strict-Transport-Security", "max-age=31536000");

  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Frame-Options", "DENY");
  }
  return response;
}

export const config = {
  matcher: [
    {
      // static files and /media (GET-only file route with its own headers) are skipped
      source: "/((?!_next/static|_next/image|favicon.ico|certificates/|img/|media/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
