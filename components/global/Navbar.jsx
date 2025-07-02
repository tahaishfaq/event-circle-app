"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  Plus,
  User,
  Settings,
  LogOut,
  Ticket,
  DollarSign,
  Calendar,
  Info,
  Phone,
} from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user
  const isAuthenticated = !!session

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: false })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }, [router])

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  return (
    <nav className="bg-background text-foreground shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            Event Circle
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-4 text-sm font-medium ml-10">
            <Link href="/" className="nav-link">Events</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            {isAuthenticated && (
              <>
                <Link href="/events/create" className="nav-link">Create Event</Link>
                <Link href="/tickets" className="nav-link">My Tickets</Link>
                <Link href="/finance" className="nav-link">Finance</Link>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.fullName} />
                      <AvatarFallback>
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center p-2 gap-2">
                    <div className="flex flex-col">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate w-[200px]">@{user?.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.username}`}><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tickets"><Ticket className="mr-2 h-4 w-4" /> My Tickets</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/finance"><DollarSign className="mr-2 h-4 w-4" /> Finance</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/events/create"><Plus className="mr-2 h-4 w-4" /> Create Event</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/auth/register"><Button>Sign Up</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 text-base font-medium">
              <MobileNavItem href="/" icon={Calendar} text="Events" />
              <MobileNavItem href="/about" icon={Info} text="About" />
              <MobileNavItem href="/contact" icon={Phone} text="Contact" />
              {isAuthenticated ? (
                <>
                  <MobileNavItem href="/events/create" icon={Plus} text="Create Event" />
                  <MobileNavItem href="/tickets" icon={Ticket} text="My Tickets" />
                  <MobileNavItem href="/finance" icon={DollarSign} text="Finance" />
                  <MobileNavItem href={`/profile/${user?.username}`} icon={User} text="Profile" />
                  <MobileNavItem href="/settings" icon={Settings} text="Settings" />
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-primary flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavItem href="/auth/login" text="Login" />
                  <MobileNavItem href="/auth/register" text="Sign Up" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function MobileNavItem({ href, text, icon: Icon }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
    >
      {Icon && <Icon className="inline mr-2 h-4 w-4" />}
      {text}
    </Link>
  )
}
