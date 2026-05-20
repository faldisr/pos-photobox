"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Settings,
  Store,
  ShoppingBag,
  Tag,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const allMenuItems = [
  {
    title: "Home",
    roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "CASHIER", "INVENTORY_STAFF"],
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "CASHIER", "INVENTORY_STAFF"],
      },
    ],
  },
  {
    title: "Transaksi",
    roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "CASHIER"],
    items: [
      {
        title: "Kasir",
        icon: ShoppingCart,
        href: "/kasir",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "CASHIER"],
      },
      {
        title: "Riwayat",
        icon: FileText,
        href: "/transactions",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "CASHIER"],
      },
    ],
  },
  {
    title: "Master Data",
    roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "INVENTORY_STAFF"],
    items: [
      {
        title: "Pelanggan",
        icon: Users,
        href: "/customers",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
      },
      {
        title: "Produk",
        icon: ShoppingBag,
        href: "/products",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
      },
      {
        title: "Inventory",
        icon: Package,
        href: "/inventory",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "INVENTORY_STAFF"],
      },
      {
        title: "Cabang",
        icon: Store,
        href: "/settings/branches",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
      },
      {
        title: "Promo",
        icon: Tag,
        href: "/admin/promos",
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Laporan",
    roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
    items: [
      {
        title: "Reports",
        icon: FileText,
        href: "/reports",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
      },
    ],
  },
  {
    title: "Pengaturan",
    roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
    items: [
      {
        title: "Settings",
        icon: Settings,
        href: "/settings",
        roles: ["SUPER_ADMIN", "BRANCH_MANAGER"],
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role ?? ""

  const menuItems = allMenuItems
    .filter((section) => section.roles.includes(role))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ORIJIN</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/")

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}