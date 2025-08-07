CREATE TABLE colleges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  acceptance_rate DOUBLE PRECISION,
  avg_gpa DOUBLE PRECISION,
  avg_sat DOUBLE PRECISION,
  avg_act DOUBLE PRECISION,
  details JSONB DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_created_by ON colleges(created_by);
