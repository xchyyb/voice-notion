"use client";

import { Menu, Bell, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
      <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
        
        <h1 className="text-2xl font-bold">早上好</h1>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Brain className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}