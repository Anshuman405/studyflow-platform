export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  color?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  color?: string;
}

export interface ListNotesResponse {
  notes: Note[];
}
