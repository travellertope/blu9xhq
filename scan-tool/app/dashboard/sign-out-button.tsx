"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="font-medium text-gray-700 hover:text-ink"
    >
      Sign out
    </button>
  );
}
