export interface Reflection {
  id: number;
  date: Date;
  studyTimeBySubject: Record<string, number>; // subject -> minutes
  mood?: number; // 1-10 scale
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReflectionRequest {
  date: Date;
  studyTimeBySubject?: Record<string, number>;
  mood?: number;
  notes?: string;
}

export interface UpdateReflectionRequest {
  studyTimeBySubject?: Record<string, number>;
  mood?: number;
  notes?: string;
}

export interface ListReflectionsResponse {
  reflections: Reflection[];
}

export interface StudyStatsResponse {
  totalStudyTime: number;
  studyTimeBySubject: Record<string, number>;
  averageMood?: number;
  studyStreak: number;
}
