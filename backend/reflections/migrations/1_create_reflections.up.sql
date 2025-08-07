CREATE TABLE reflections (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  study_time_by_subject JSONB DEFAULT '{}',
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  notes TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, user_id)
);

CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_date ON reflections(date);
