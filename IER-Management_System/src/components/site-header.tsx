import { useState, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { Search, Settings, LogOut, User, ChevronDown, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useAvatar } from "@/hooks/use-avatar"
import { useUser } from "@/hooks/use-user"
import Fuse from "fuse.js"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SiteHeaderProps {
  onSearch?: (query: string) => void;
  searchData?: {
    id: string;
    name: string;
    id_number: string;
    email: string;
  }[];
}

export function SiteHeader({ onSearch, searchData }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const [location, setLocation] = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { avatarUrl } = useAvatar()
  const { user } = useUser()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleLogout = () => {
    setLocation("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
      setIsSuggestionsOpen(false);
    }
  };

  const handleSuggestionSelect = (item: { name: string; id: string }) => {
    setSearchQuery(item.name)
    if (onSearch) {
      onSearch(item.name)
    }
    setIsSuggestionsOpen(false)
  }

  // Fuzzy search setup
  const fuse = new Fuse(searchData ?? [], {
    keys: ["name", "id_number", "email"],
    threshold: 0.4,
  })

  const filteredSuggestions = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchQuery === "" && onSearch) {
      onSearch("")
    }
  }, [searchQuery, onSearch])

  return (
    <TooltipProvider>
      <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
        <div className="flex h-(--header-height) w-full items-center gap-2 px-2">
          {/* Sidebar Toggle with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 flex items-center justify-center"
                onClick={toggleSidebar}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              <p>Toggle Sidebar</p>
            </TooltipContent>
          </Tooltip>

          <a href="/dashboard" className="flex items-center gap-2">
            <img src="/assets/DENR-Logo.svg" className="h-8" />
            <div className="grid text-left text-sm leading-tight">
              <span className="truncate text-xs font-medium">Integrated Establishment Regulatory</span>
              <span className="truncate text-xs">MANAGEMENT SYSTEM</span>
            </div>
          </a>

          <div className="relative w-full sm:ml-auto sm:w-[400px]" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsSuggestionsOpen(e.target.value.length > 0)
                  }}
                  
                  onFocus={() => searchQuery.length > 0 && setIsSuggestionsOpen(true)}
                />
              </div>
            </form>

           {isSuggestionsOpen && location === "/users" && (
  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
                <Command>
                  <CommandList>
                    <CommandGroup heading="Users">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => handleSuggestionSelect(item)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.id_number} • {item.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      ) : (
                        <CommandItem disabled>No users found</CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          {/* Notification with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <NotificationDropdown />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl || undefined} alt={user?.name || ""} />
                  ) : (
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:flex md:flex-col md:items-start md:leading-none">
                  <span className="text-sm font-medium">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  )
}