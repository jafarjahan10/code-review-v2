"use client";

import { Button } from "@/components/ui/button";
import { signOutFn } from "@/lib/signOut";

export default function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOutFn("/login")}
    >
      Sign Out
    </Button>
  );
}
