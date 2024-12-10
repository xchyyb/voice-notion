"use client";

import { Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg mx-4 mb-6">
      <Search className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-muted-foreground">闪问 AI</span>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}