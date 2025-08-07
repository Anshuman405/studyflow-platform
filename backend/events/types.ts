export type EventCategory = "exam" | "study_session" | "assignment" | "lab" | "other";

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: Date;
  category: EventCategory;
  location?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  date: Date;
  category: EventCategory;
  location?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: Date;
  category?: EventCategory;
  location?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListEventsResponse {
  events: Event[];
  pagination?: PaginationInfo;
}
