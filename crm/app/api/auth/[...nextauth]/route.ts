/**
 * NextAuth removed — auth is now handled by Supabase.
 *
 * Sign-in:   POST /api/auth/signin  (or use signInWithPassword from @/lib/auth)
 * Callback:  GET  /api/auth/callback  (magic-link exchange)
 * Sign-out:  POST /api/auth/signout
 *
 * This file is kept so any hardcoded /api/auth/* links get a clear 410 rather
 * than a 404.
 */
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "NextAuth removed. Auth is now handled by Supabase." },
    { status: 410 }
  );
}

export function POST() {
  return NextResponse.json(
    { error: "NextAuth removed. Auth is now handled by Supabase." },
    { status: 410 }
  );
}
