"use client";

import React, { useState, useEffect } from "react";
import MainSidebar from "../components/Mainsidebar";
import MainHeader from "../components/Mainheader";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// Global cache to maintain mini state across client-side page navigations
let cachedIsMini: boolean | null = null;

const getInitialIsMini = (): boolean => {
  if (cachedIsMini !== null) return cachedIsMini;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("koolmd_sidebar_mini");
      if (saved !== null) {
        cachedIsMini = JSON.parse(saved);
        return cachedIsMini!;
      }
    } catch {
      // Ignore localStorage errors
    }
  }
  return false;
};

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const [isMini, setIsMini] = useState<boolean>(getInitialIsMini);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("koolmd_sidebar_mini");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        cachedIsMini = parsed;
        setIsMini(parsed);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleMini = () => {
    setIsMini((prev) => {
      const next = !prev;
      cachedIsMini = next;
      try {
        localStorage.setItem("koolmd_sidebar_mini", JSON.stringify(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-page text-heading">
      <input id="sidebar-toggle" type="checkbox" className="peer sr-only" />

      <label
        htmlFor="sidebar-toggle"
        aria-label="Close menu"
        className="fixed inset-0 z-30 hidden bg-brand-navy/40 backdrop-blur-sm peer-checked:block lg:hidden"
      />

      <MainSidebar
        isMini={isMini}
        onToggleMini={handleToggleMini}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MainHeader title={title} />
        <main className="flex-1 overflow-y-auto bg-page p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;