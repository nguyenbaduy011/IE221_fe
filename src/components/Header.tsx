"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@//components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white px-6 py-3 flex items-center justify-between z-20 shadow-lg">
      <Link href="/" className="text-xl font-bold">
        Training System
      </Link>

      <nav className="flex gap-6 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            Account ▾
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <form action="/logout" method="POST">
                Logout
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
