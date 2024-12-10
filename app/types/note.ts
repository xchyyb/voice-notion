export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags?: string[];
}

export interface NoteCardProps {
  note: Note;
}