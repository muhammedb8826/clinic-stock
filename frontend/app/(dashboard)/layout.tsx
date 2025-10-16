import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import  ProtectedRoute  from "@/components/protected-route";
import {
  IconInnerShadowTop,
} from "@tabler/icons-react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          {/* Mobile Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
                <a href="/dashboard" aria-label="Damina Tech">
                  <div className="flex items-center gap-2">
                    {/* Logo mark */}
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 grid place-items-center text-white shadow-sm ring-1 ring-emerald-300/40">
                      <IconInnerShadowTop className="size-4" />
                    </div>
                    {/* Brand text */}
                    <span className="text-lg font-extrabold tracking-tight text-emerald-600">
                      Waan <span className="text-emerald-700">Ofii</span>
                    </span>
                  </div>
                </a>
            </div>
          </header>
          
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-auto p-4 lg:p-6">
              <AppBreadcrumb />
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
