"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LogOut, Settings, User as UserIcon } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getHomeLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "SUPERVISOR":
        return "/supervisor/dashboard";
      case "TRAINEE":
        return "/trainee/courses";
      default:
        return "/";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="fixed h-16 top-0 left-0 w-full px-4 sm:px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center justify-between z-50 transition-all">
      <Link
        href={getHomeLink()}
        className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2"
      >
        <span className="text-primary">Training</span> System
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {user ? (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full cursor-pointer"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src="" alt={user.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer bg-destructive/5 mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
