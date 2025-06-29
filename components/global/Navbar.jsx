"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, User, Settings, LogOut, Shield, Wallet, Calendar } from "lucide-react";


export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /**
   * Handle logout action
   */
  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [router]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl cursor-pointer font-bold text-primary transition-colors"
              aria-label="Event Circle Home"
            >
              Event Circle
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div
                className="animate-pulse rounded-full h-10 w-10 bg-gray-200"
                aria-label="Loading user status"
              ></div>
            ) : session ? (
              <>
                {/* Create Event Button */}
                <Link href="/events/create" aria-label="Create a new event">
                  <Button className="hidden sm:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button size="sm" className="sm:hidden">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            session.user?.profilePicture || "/placeholder.svg"
                          }
                          alt={`${
                            session.user?.fullName || "User"
                          }'s profile picture`}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {session.user?.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal flex items-center space-x-2">
                      <div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              session.user?.profilePicture || "/placeholder.svg"
                            }
                            alt={`${
                              session.user?.fullName || "User"
                            }'s profile picture`}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {session.user?.fullName?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs leading-none text-muted-foreground">
                          @{session.user?.username || "username"}
                        </p>
                        <p className="text-xs truncate leading-none text-muted-foreground line-clamp-1">
                          {session.user?.email || "email@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${session.user?.username}`}
                        className="cursor-pointer flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/tickets" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Tickets</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="cursor-pointer flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/finance"
                        className="cursor-pointer flex items-center"
                      >
                        <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Finance</span>
                      </Link>
                    </DropdownMenuItem>

                    {session.user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/dashboard"
                            className="cursor-pointer flex items-center"
                          >
                            <Shield
                              className="mr-2 h-4 w-4"
                              aria-hidden="true"
                            />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login" aria-label="Login to your account">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link
                  href="/auth/register"
                  aria-label="Sign up for a new account"
                >
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
