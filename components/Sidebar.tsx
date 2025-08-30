"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Users,
  Building2,
  Briefcase,
  Heart,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [dswdOpen, setDswdOpen] = useState(false); // ✅ collapse state

  // Base navigation (visible to everyone)
  let navItems = [
    {
      label: "Search Applicants",
      href: "/dashboard/search",
      icon: Search,
      description: "Find applicants",
    },
    {
      label: "TUPAD Program",
      href: "/dashboard/tupad",
      icon: Briefcase,
      description: "Employment assistance",
    },
    {
      label: "DOH Services",
      href: "/dashboard/doh",
      icon: Heart,
      description: "Health services",
    },
  ];

  // Extra menu only for Admin
  if (user?.role === "admin") {
    navItems = [
      navItems[0], // Search Applicants
      {
        label: "Users Management",
        href: "/dashboard/users",
        icon: Users,
        description: "Manage system users",
      },
      {
        label: "DSWD Programs",
        href: "/dashboard/dswd",
        icon: Building2,
        description: "Social welfare programs",
      },
      ...navItems.slice(1),
      // {
      //   label: "Reports",
      //   href: "/dashboard/reports",
      //   icon: BarChart3,
      //   description: "Analytics & reports",
      // },
    ];
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen shadow-sm hidden md:block">
      <div className="px-6 py-6">
        {/* Logo/Title Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Congress</h2>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-red-200 text-red-600"
          >
            Version 1.0
          </Badge>
        </div>

        <Separator className="mb-6" />

        {/* Navigation */}
        <nav className="space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Main Navigation
            </h3>
          </div>

          {/* Normal nav items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link href={item.href} key={item.href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-3 text-left transition-all duration-200 group",
                    isActive
                      ? "bg-red-50 text-red-700 border-r-2 border-red-600 hover:bg-red-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        isActive
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "font-medium text-sm",
                          isActive ? "text-red-700" : "text-gray-900"
                        )}
                      >
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    )}
                  </div>
                </Button>
              </Link>
            );
          })}
          
          {/* Collapsible DSWD (for user only) */}
          {user?.role === "user" && (
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-3 text-left transition-all duration-200 group text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setDswdOpen(!dswdOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-md bg-gray-100 text-gray-500 group-hover:bg-gray-200">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">DSWD Programs</span>
                </div>
                {dswdOpen ? (
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                )}
              </Button>

              {/* Collapsible links */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  dswdOpen ? "max-h-60 mt-2" : "max-h-0"
                )}
              >
                <div className="ml-10 space-y-1">
                  {[
                    {
                      href: "/dashboard/dswd/encoded",
                      label: "Encoded DSWD",
                    },
                    {
                      href: "/dashboard/dswd/approved",
                      label: "Approved DSWD",
                    },
                    { href: "/dashboard/dswd/pullout", label: "Pullout DSWD" },
                    { href: "/dashboard/dswd/claimed", label: "Claimed DSWD" },
                    {
                      href: "/dashboard/dswd/unclaimed",
                      label: "Unclaimed DSWD",
                    },
                  ].map((sub) => (
                    <Link href={sub.href} key={sub.href}>
                      <div
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-md text-sm cursor-pointer transition-colors",
                          pathname === sub.href
                            ? "bg-red-50 text-red-600 font-semibold"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        <span>{sub.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-900">Need Help?</h4>
                <p className="text-xs text-red-700">Contact support team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
