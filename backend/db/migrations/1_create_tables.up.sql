-- Enums
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "EventCategory" AS ENUM ('EXAM', 'STUDY_SESSION', 'ASSIGNMENT', 'LAB', 'OTHER');
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'DOC', 'NOTE', 'LINK', 'IMAGE', 'VIDEO', 'OTHER');
CREATE TYPE "NotificationType" AS ENUM ('REMINDER', 'DEADLINE', 'GROUP_INVITE', 'SYSTEM');
CREATE TYPE "StudyGroupRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');
CREATE TYPE "StudyGroupStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE "DataExportType" AS ENUM ('FULL', 'TASKS', 'NOTES', 'MATERIALS', 'REFLECTIONS');
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    priority "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    status "TaskStatus" NOT NULL DEFAULT 'TODO',
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON tasks (user_id);
CREATE INDEX ON tasks (due_date);
CREATE INDEX ON tasks (status);
CREATE INDEX ON tasks (user_id, status);
CREATE INDEX ON tasks (user_id, due_date);

-- events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    category "EventCategory" NOT NULL DEFAULT 'OTHER',
    location TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON events (user_id);
CREATE INDEX ON events (date);
CREATE INDEX ON events (category);
CREATE INDEX ON events (user_id, date);

-- notes table
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    color TEXT NOT NULL DEFAULT '#ffffff',
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON notes (user_id);
CREATE INDEX ON notes (tags);
CREATE INDEX ON notes (title);
CREATE INDEX ON notes (user_id, updated_at);

-- materials table
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type "MaterialType" NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    subject TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON materials (user_id);
CREATE INDEX ON materials (subject);
CREATE INDEX ON materials (type);
CREATE INDEX ON materials (user_id, created_at);

-- reflections table
CREATE TABLE reflections (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    study_time_by_subject JSONB NOT NULL DEFAULT '{}',
    mood SMALLINT,
    notes TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (date, user_id)
);
CREATE INDEX ON reflections (user_id);
CREATE INDEX ON reflections (date);
CREATE INDEX ON reflections (user_id, date);

-- study_streaks table
CREATE TABLE study_streaks (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (date, user_id)
);
CREATE INDEX ON study_streaks (user_id);
CREATE INDEX ON study_streaks (date);
CREATE INDEX ON study_streaks (user_id, date);

-- colleges table
CREATE TABLE colleges (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    location TEXT,
    acceptance_rate REAL,
    avg_gpa REAL,
    avg_sat INTEGER,
    avg_act INTEGER,
    details JSONB NOT NULL DEFAULT '{}',
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON colleges (name);
CREATE INDEX ON colleges (created_by);
CREATE INDEX ON colleges (acceptance_rate);

-- ai_insights table
CREATE TABLE ai_insights (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    recommendations JSONB NOT NULL,
    insight_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON ai_insights (user_id);
CREATE INDEX ON ai_insights (insight_type);
CREATE INDEX ON ai_insights (created_at);
CREATE INDEX ON ai_insights (user_id, insight_type);
CREATE INDEX ON ai_insights (user_id, created_at);

-- timer_sessions table
CREATE TABLE timer_sessions (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    estimated_time INTEGER NOT NULL,
    actual_time INTEGER,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON timer_sessions (user_id);
CREATE INDEX ON timer_sessions (task_id);
CREATE INDEX ON timer_sessions (created_at);
CREATE INDEX ON timer_sessions (user_id, created_at);
CREATE INDEX ON timer_sessions (user_id, completed);

-- notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type "NotificationType" NOT NULL DEFAULT 'REMINDER',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON notifications (user_id);
CREATE INDEX ON notifications (read);
CREATE INDEX ON notifications (created_at);
CREATE INDEX ON notifications (user_id, read);

-- study_groups table
CREATE TABLE study_groups (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON study_groups (code);
CREATE INDEX ON study_groups (created_by);
CREATE INDEX ON study_groups (is_public);

-- study_group_members table
CREATE TABLE study_group_members (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    role "StudyGroupRole" NOT NULL DEFAULT 'MEMBER',
    status "StudyGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, group_id)
);
CREATE INDEX ON study_group_members (user_id);
CREATE INDEX ON study_group_members (group_id);
CREATE INDEX ON study_group_members (status);

-- group_tasks table
CREATE TABLE group_tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    due_date TIMESTAMPTZ,
    priority "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    status "TaskStatus" NOT NULL DEFAULT 'TODO',
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    assigned_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON group_tasks (group_id);
CREATE INDEX ON group_tasks (assigned_by_id);
CREATE INDEX ON group_tasks (due_date);
CREATE INDEX ON group_tasks (status);

-- group_notes table
CREATE TABLE group_notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    color TEXT NOT NULL DEFAULT '#ffffff',
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON group_notes (group_id);
CREATE INDEX ON group_notes (author_id);
CREATE INDEX ON group_notes (tags);
CREATE INDEX ON group_notes (title);

-- data_exports table
CREATE TABLE data_exports (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    type "DataExportType" NOT NULL,
    status "ExportStatus" NOT NULL DEFAULT 'PENDING',
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON data_exports (user_id);
CREATE INDEX ON data_exports (status);
CREATE INDEX ON data_exports (created_at);
