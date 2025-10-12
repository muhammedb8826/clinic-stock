"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconReport,
  IconListDetails,
  IconFileDescription,
  IconFolder,
  IconUsers,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

/* ----------------------------- Nav Data ----------------------------- */

const data = {
  navSections: [
    {
      items: [
        { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
        { title: "Reports", url: "/reports", icon: IconReport },
      ],
    },
    {
      items: [
        {
          title: "Medicines",
          icon: IconListDetails,
          items: [
            { title: "List", url: "/medicines", icon: IconListDetails },
            { title: "Categories", url: "/categories", icon: IconFolder },
          ],
        },
      ],
    },
    {
      items: [
        {
          title: "Purchase",
          icon: IconListDetails,
          items: [
            { title: "List", url: "/purchase-orders", icon: IconListDetails },
            { title: "New", url: "/purchase-orders/create", icon: IconFileDescription },
          ],
        },
        {
          title: "Sales",
          icon: IconReport,
          items: [
            { title: "List", url: "/sales/list", icon: IconListDetails },
            { title: "New", url: "/sales", icon: IconReport },
          ],
        },
        { title: "Customers", url: "/customers", icon: IconUsers },
        { title: "Suppliers", url: "/suppliers", icon: IconUsers },
        { title: "Users", url: "/users", icon: IconUsers },
      ],
    },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
};

/* ----------------------------- Utilities ---------------------------- */

function isActivePath(currentPath: string, itemUrl?: string) {
  if (!itemUrl) return false;
  return currentPath === itemUrl || currentPath.startsWith(itemUrl + "/");
}

function cls(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

/* ----------------------------- Component ---------------------------- */

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();

  // keep only one parent open at a time
  const [openParent, setOpenParent] = React.useState<string | null>(null);

  // Auto-open the parent that contains the active child (works for Medicines, Purchase, Sales)
  React.useEffect(() => {
    let found = false;
    for (const section of data.navSections) {
      for (const item of section.items) {
        const children = (item as any).items as Array<{ url: string }> | undefined;
        if (children?.some((sub) => isActivePath(pathname, sub.url))) {
          setOpenParent(item.title);
          found = true;
          break;
        }
        if (!children && isActivePath(pathname, (item as any).url)) {
          setOpenParent(null);
        }
      }
      if (found) break;
    }
    // if no active match, keep current openParent as-is (don’t forcibly close others)
  }, [pathname]);

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header / Brand */}
      <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
              >
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
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <nav className="px-2 py-2 space-y-4">
          {data.navSections.map((section, si) => (
            <div key={si}>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const ParentIcon = item.icon as any;
                  const children = (item as any).items as Array<{ title: string; url: string; icon?: any }> | undefined;
                  const hasChildren = !!children?.length;

                  const parentActive =
                    isActivePath(pathname, (item as any).url) ||
                    (hasChildren && children!.some((sub) => isActivePath(pathname, sub.url)));

                  const expanded = hasChildren && openParent === item.title;

                  return (
                    <li key={item.title} className="rounded-lg">
                      {/* Parent row */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => setOpenParent(expanded ? null : item.title)}
                          className={cls(
                            "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition",
                            "hover:bg-gray-50",
                            parentActive
                              ? "text-emerald-700 font-semibold bg-gradient-to-r from-emerald-50 to-blue-50 ring-1 ring-emerald-200"
                              : "text-gray-800 font-semibold"
                          )}
                          aria-expanded={expanded}
                        >
                          <span className="flex items-center gap-2">
                            {ParentIcon && <ParentIcon className="size-4" />}
                            <span className="truncate">{item.title}</span>
                          </span>
                          {expanded ? (
                            <IconChevronDown className="size-4 text-emerald-700" />
                          ) : (
                            <IconChevronRight className="size-4 text-gray-400" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={(item as any).url!}
                          className={cls(
                            "flex items-center gap-2 px-3 py-2 rounded-lg transition",
                            "hover:bg-gray-50",
                            parentActive
                              ? "text-emerald-700 font-semibold bg-gradient-to-r from-emerald-50 to-blue-50 ring-1 ring-emerald-200"
                              : "text-gray-800 font-semibold"
                          )}
                        >
                          {ParentIcon && <ParentIcon className="size-4" />}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      )}

                      {/* Submenu (only renders when expanded) */}
                      {hasChildren && expanded && (
                        <ul className="mt-1 space-y-0.5 pb-1">
                          {children!.map((sub) => {
                            const SubIcon = sub.icon as any;
                            const active = isActivePath(pathname, sub.url);
                            return (
                              <li key={sub.title}>
                                <Link
                                  href={sub.url}
                                  className={cls(
                                    "ml-8 mr-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                                    active
                                      ? "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-200"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                  )}
                                  onClick={() => setOpenParent(item.title)} // keep parent open after navigation
                                >
                                  {SubIcon && (
                                    <SubIcon className={cls("size-3.5", active ? "text-emerald-700" : "text-gray-400")} />
                                  )}
                                  <span className={cls(active && "font-medium")}>{sub.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Secondary */}
        <div className="mt-auto px-2 pt-2">
          <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-gray-400">More</div>
          <ul className="space-y-1">
            {data.navSecondary.map((item) => {
              const Icon = item.icon as any;
              const active = isActivePath(pathname, item.url);
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    className={cls(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition",
                      active
                        ? "bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cls("size-4", active ? "text-emerald-700" : "text-gray-400")} />
                    <span className={cls("text-sm", active && "font-medium")}>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </SidebarContent>

      {/* Footer / User */}
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
