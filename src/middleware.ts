import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("ankoo_admin")?.value;
  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-change-me-dev-secret-change-me"
  );
  try {
    if (!token) throw new Error();
    await jwtVerify(token, secret);
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

// Everything except the login page, Next internals and static files requires a session.
export const config = { matcher: ["/((?!login|_next/|uploads/|favicon.ico).*)"] };
