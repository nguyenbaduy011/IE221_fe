"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Header() {
  const auth = useAuth();

  return (
    <header className="fixed h-13 top-0 left-0 w-full px-6 bg-background border-b flex items-center justify-between z-20 shadow-sm">
      <Link href="/" className="text-xl font-bold">
        Training System
      </Link>

      <div className="hidden sm:flex items-center gap-3 py-2 h-full">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6 bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer font-medium px-2 py-1 rounded hover:bg-muted transition">
            Account ▾
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="px-3 py-2 w-full block">
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="px-3 py-2 w-full block">
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Button
                variant="destructive"
                className="w-full px-3 py-2 cursor-pointer"
                onClick={() => {
                  auth.logout();
                  toast.success("Logout successfully!");
                }}
              >
                Logout
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
