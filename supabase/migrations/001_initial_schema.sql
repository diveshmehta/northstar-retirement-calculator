-- Retirement Calculator Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Retirement Plan',
  mode TEXT NOT NULL DEFAULT 'traditional' CHECK (mode IN ('traditional', 'fire', 'barista', 'coast', 'fatfire')),
  
  -- Person A
  person_a_name TEXT,
  person_a_age INTEGER,
  person_a_retirement_age INTEGER,
  
  -- Person B (optional)
  person_b_name TEXT,
  person_b_age INTEGER,
  person_b_retirement_age INTEGER,
  
  -- Timeline
  life_expectancy INTEGER DEFAULT 85,
  fi_age INTEGER,
  full_retirement_age INTEGER,
  
  -- Assumptions
  inflation DECIMAL(5,4) DEFAULT 0.06,
  pre_fi_return DECIMAL(5,4) DEFAULT 0.12,
  post_fi_return DECIMAL(5,4) DEFAULT 0.08,
  swr DECIMAL(5,4) DEFAULT 0.04,
  buffer_percent DECIMAL(5,4) DEFAULT 0.10,
  step_up_sip_percent DECIMAL(5,4) DEFAULT 0.10,
  salary_growth DECIMAL(5,4) DEFAULT 0.08,
  
  -- Current SIP
  existing_sip DECIMAL(15,2) DEFAULT 0,
  
  -- Full plan data as JSONB for flexibility
  plan_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  return_override DECIMAL(5,4),
  is_liquid BOOLEAN DEFAULT true,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table (buckets)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'onetime' CHECK (type IN ('monthly_living', 'onetime', 'yearly', 'custom')),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_mode TEXT DEFAULT 'today' CHECK (amount_mode IN ('today', 'future')),
  target_year INTEGER,
  start_year INTEGER,
  end_year INTEGER,
  escalation DECIMAL(5,4) DEFAULT 0.06,
  priority TEXT DEFAULT 'must' CHECK (priority IN ('must', 'optional')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income streams table
CREATE TABLE IF NOT EXISTS income_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('parttime', 'pension', 'rental', 'other')),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_mode TEXT DEFAULT 'today' CHECK (amount_mode IN ('today', 'future')),
  start_age INTEGER,
  end_age INTEGER,
  growth_rate DECIMAL(5,4) DEFAULT 0.03,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_plan_id ON assets(plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_income_streams_plan_id ON income_streams(plan_id);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_streams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans
CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for assets
CREATE POLICY "Users can view assets of their plans"
  ON assets FOR SELECT
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can create assets for their plans"
  ON assets FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update assets of their plans"
  ON assets FOR UPDATE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete assets of their plans"
  ON assets FOR DELETE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses of their plans"
  ON expenses FOR SELECT
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can create expenses for their plans"
  ON expenses FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update expenses of their plans"
  ON expenses FOR UPDATE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete expenses of their plans"
  ON expenses FOR DELETE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

-- RLS Policies for income_streams
CREATE POLICY "Users can view income_streams of their plans"
  ON income_streams FOR SELECT
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can create income_streams for their plans"
  ON income_streams FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update income_streams of their plans"
  ON income_streams FOR UPDATE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete income_streams of their plans"
  ON income_streams FOR DELETE
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_streams_updated_at
  BEFORE UPDATE ON income_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
