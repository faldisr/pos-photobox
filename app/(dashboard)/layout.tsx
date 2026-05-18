import { AppSidebar } from "@/components/layouts/app-sidebar"
import { Header } from "@/components/layouts/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}