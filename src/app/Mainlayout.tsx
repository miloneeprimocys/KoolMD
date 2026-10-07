"use client";

import React, { useState } from "react";
import MainSidebar from "../components/Mainsidebar";
import MainHeader from "../components/Mainheader";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const [isMini, setIsMini] = useState(false);

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
        onToggleMini={() => setIsMini((m) => !m)}
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