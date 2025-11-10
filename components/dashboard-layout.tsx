"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Users, Calendar, FileText, Settings, LogOut, Upload, Moon, Sun, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/analytics", icon: BarChart3 },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Clases", href: "/classes", icon: Calendar },
  { name: "Compras", href: "/purchases", icon: FileText },
  { name: "Importar", href: "/import", icon: Upload },
  { name: "Gestión de usuarios", href: "/users", icon: UserCog },
  // { name: "Configuración", href: "/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar shadow-sm border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg text-sidebar-foreground">Siclo Data</span>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-accent",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-sidebar-foreground hover:bg-accent"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-header border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-header-foreground">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Toggle Dark Mode */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="hover:bg-accent">
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>

              {/* User Profile */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.firstName || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm hidden sm:block">
                  <div className="font-medium text-header-foreground">{user ? `${user.firstName} ${user.lastName}` : "Usuario"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || "usuario@email.com"}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
