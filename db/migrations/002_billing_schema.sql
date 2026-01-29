
-- -----------------------------------------------------------------------------
-- 8. BILLING & SUBSCRIPTIONS (Stripe Sync)
-- -----------------------------------------------------------------------------

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

-- Products table (synced from Stripe via webhook)
CREATE TABLE products (
  id TEXT PRIMARY KEY, -- Stripe Product ID
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

-- Prices table (synced from Stripe via webhook)
CREATE TABLE prices (
  id TEXT PRIMARY KEY, -- Stripe Price ID
  product_id TEXT REFERENCES products(id), 
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT,
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);

-- Subscriptions table (synced from Stripe via webhook)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY, -- Stripe Subscription ID
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id), -- B2B Logic
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT timezone('utc', now()),
  current_period_start TIMESTAMPTZ DEFAULT timezone('utc', now()),
  current_period_end TIMESTAMPTZ DEFAULT timezone('utc', now()),
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);

-- Add billing fields to organization
ALTER TABLE organizations 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_id TEXT REFERENCES subscriptions(id);
