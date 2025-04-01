"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Database,
  Users,
  Trophy,
  BarChart2,
  Image,
  LinkIcon,
  RefreshCw,
  UserPlus,
  Home,
  PlusCircle,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Database Setup",
      items: [
        {
          title: "Add Image Column",
          href: "/admin/add-image-column",
          icon: Image,
        },
        {
          title: "Add Bio Columns",
          href: "/admin/add-bio-columns",
          icon: Database,
        },
      ],
    },
    {
      title: "Player Management",
      items: [
        {
          title: "Set Transfermarkt URLs",
          href: "/admin/set-transfermarkt-urls",
          icon: LinkIcon,
        },
        {
          title: "Fetch Player Bios (JS)",
          href: "/admin/fetch-player-bios",
          icon: RefreshCw,
        },
        {
          title: "Fetch Player Bios (R)",
          href: "/admin/fetch-player-bios-r",
          icon: RefreshCw,
        },
        {
          title: "Manage Players",
          href: "/admin/players",
          icon: Users,
        },
        {
          title: "Add Player",
          href: "/admin/players/new",
          icon: UserPlus,
        },
      ],
    },
    {
      title: "Team Management",
      items: [
        {
          title: "Manage Teams",
          href: "/admin/teams",
          icon: Trophy,
        },
        {
          title: "Add Team",
          href: "/admin/teams/new",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "League Management",
      items: [
        {
          title: "Manage Leagues",
          href: "/admin/leagues",
          icon: BarChart2,
        },
        {
          title: "Add League",
          href: "/admin/leagues/new",
          icon: PlusCircle,
        },
      ],
    },
  ]

  return (
    <div className="w-64 bg-gray-800 text-white h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-6">
          {navItems.map((section, i) => (
            <li key={i} className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{section.title}</h3>
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === section.href
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  <section.icon className="mr-2 h-4 w-4" />
                  {section.title}
                </Link>
              ) : (
                <ul className="space-y-1 ml-2">
                  {section.items?.map((item, j) => (
                    <li key={j}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-gray-700 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

