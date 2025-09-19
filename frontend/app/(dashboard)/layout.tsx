import { AppSidebar } from "@/components/app-sidebar";
import { AppFooter } from "@/components/app-footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import  ProtectedRoute  from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <AppFooter />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
