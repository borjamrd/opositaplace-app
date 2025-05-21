"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" type="submit" className="w-full justify-start">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </form>
  );
}
