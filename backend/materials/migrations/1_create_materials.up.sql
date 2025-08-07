CREATE TABLE materials (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'doc', 'note', 'link', 'other')),
  file_url TEXT,
  subject TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_materials_user_id ON materials(user_id);
CREATE INDEX idx_materials_subject ON materials(subject);
CREATE INDEX idx_materials_type ON materials(type);
