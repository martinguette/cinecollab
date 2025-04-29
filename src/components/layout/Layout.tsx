
import React from "react";
import { NavBar } from "./NavBar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <ScrollArea className="flex-1">
        <main className="container max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </ScrollArea>
    </div>
  );
}
