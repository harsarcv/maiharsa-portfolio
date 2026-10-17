-- Maiharsa Portfolio MVP schema. Review existing production tables before applying.
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  main_category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(80),
  description TEXT,
  role VARCHAR(120),
  tools TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  video_embed_url TEXT,
  project_year INTEGER,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(main_category, sub_category);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(is_featured, display_order);

CREATE TABLE IF NOT EXISTS experiences (
  id BIGSERIAL PRIMARY KEY,
  organization VARCHAR(200) NOT NULL,
  role_title VARCHAR(150) NOT NULL,
  exp_type VARCHAR(100),
  period VARCHAR(100),
  description TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS furokidz_highlights (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  views_count VARCHAR(50),
  published_at DATE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_name VARCHAR(120) NOT NULL,
  sender_email VARCHAR(150) NOT NULL,
  inquiry_type VARCHAR(80) NOT NULL CHECK (inquiry_type IN ('Recruitment','3D Project','Video Production','Photography','Other')),
  message TEXT NOT NULL CHECK (char_length(message) <= 5000),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_download_logs (
  id BIGSERIAL PRIMARY KEY,
  user_agent TEXT,
  referrer TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
