"use client";

import { Card } from "@/components/ui/card";
import { NoteCardProps } from "../types/note";

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Card className="p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="text-sm text-muted-foreground mb-2">
        {note.timestamp}
      </div>
      <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
      <p className="text-muted-foreground">{note.content}</p>
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}