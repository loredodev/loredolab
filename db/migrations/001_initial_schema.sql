-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & CONSTANTS
-- -----------------------------------------------------------------------------

CREATE TYPE evidence_level AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'ANECDOTAL');
CREATE TYPE experiment_status AS ENUM ('DRAFT', 'BASELINE', 'INTERVENTION', 'COMPLETED', 'ARCHIVED');
CREATE TYPE phase_type AS ENUM ('BASELINE', 'INTERVENTION', 'WASHOUT');
CREATE TYPE metric_source AS ENUM ('MANUAL', 'CSV_UPLOAD', 'WEARABLE_API');
CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE insight_type AS ENUM ('CORRELATION', 'TREND', 'ANOMALY', 'PREDICTION');

-- -----------------------------------------------------------------------------
-- 2. IDENTITY & ACCESS (LGPD Friendly)
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- LGPD / Privacy Controls
    marketing_consent BOOLEAN DEFAULT FALSE,
    accepted_terms_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_export_requested_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete for audit purposes (Right to be Forgotten logic)
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    billing_email TEXT,
    plan_tier TEXT DEFAULT 'FREE', -- 'FREE', 'PRO', 'ENTERPRISE'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 3. KNOWLEDGE BASE (Global Data)
-- -----------------------------------------------------------------------------

CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doi TEXT UNIQUE,
    title TEXT NOT NULL,
    authors TEXT[],
    publication_date DATE,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    mechanism TEXT NOT NULL, -- The scientific "why"
    evidence_level evidence_level DEFAULT 'BRONZE',
    
    -- Configuration
    default_duration_days INTEGER DEFAULT 14,
    tags TEXT[],
    
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id), -- Nullable (System protocols are null)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE protocol_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE
);

-- Linking papers to protocols to back up claims
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    description TEXT NOT NULL, -- e.g. "Shown to increase dopamine by 250%"
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 100)
);

-- Definitions of what can be measured (Metadata for Metrics)
CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g. 'focus_score', 'sleep_duration_mins'
    display_name TEXT NOT NULL,
    unit TEXT, -- 'score_1_10', 'minutes', 'celsius'
    description TEXT,
    validation_min NUMERIC,
    validation_max NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. EXPERIMENT ENGINE (Transactional Data)
-- -----------------------------------------------------------------------------

CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id), -- Optional, for B2B context
    protocol_id UUID NOT NULL REFERENCES protocols(id),
    
    status experiment_status DEFAULT 'DRAFT',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    hypothesis TEXT, -- User's personal hypothesis
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experiment_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    phase_type phase_type NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks specific blocks of activity (e.g. "I did the NSDR session now")
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    session_type TEXT, -- 'focus_block', 'protocol_execution'
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. METRICS & OBSERVABILITY (Time Series)
-- -----------------------------------------------------------------------------

-- The flexible log table for all measured data points
CREATE TABLE metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES experiment_phases(id), -- Denormalized for easier querying
    user_id UUID NOT NULL REFERENCES users(id), -- for fast user-level aggregation
    
    timestamp TIMESTAMPTZ NOT NULL,
    
    -- Can reference a definition OR be custom
    metric_definition_id UUID REFERENCES metric_definitions(id),
    metric_name TEXT NOT NULL, -- Redundant if definition exists, but good for custom metrics
    
    metric_value NUMERIC NOT NULL,
    
    source metric_source DEFAULT 'MANUAL',
    metadata JSONB DEFAULT '{}', -- Store extra context (e.g. Oura tags, user notes)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generated Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    content_markdown TEXT NOT NULL,
    ai_model_version TEXT -- e.g. "gemini-1.5-pro"
);

-- Normalized Insights (extracted from reports or direct analysis)
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    
    type insight_type NOT NULL,
    description TEXT NOT NULL, -- "Positive correlation between cold shower and focus score"
    confidence_score INTEGER, -- 1-100
    
    related_metrics TEXT[], -- ['focus_score', 'cold_exposure_mins']
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. INDEXES & OPTIMIZATIONS
-- -----------------------------------------------------------------------------

-- Speed up experiment dashboard lookups
CREATE INDEX idx_experiments_user_status ON experiments(user_id, status);

-- Speed up time-series charts
-- BRIN index is often good for time-ordered data, but B-Tree is safer for general SaaS scale
CREATE INDEX idx_metrics_experiment_time ON metric_events(experiment_id, timestamp DESC);
CREATE INDEX idx_metrics_user_time ON metric_events(user_id, timestamp DESC);

-- Session lookups
CREATE INDEX idx_sessions_user_time ON sessions(user_id, start_time DESC);

-- Full text search for protocols
CREATE INDEX idx_protocols_search ON protocols USING GIN (to_tsvector('english', title || ' ' || description));

-- -----------------------------------------------------------------------------
-- 7. TRIGGERS (Auto-update updated_at)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orgs_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_experiments_modtime BEFORE UPDATE ON experiments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
