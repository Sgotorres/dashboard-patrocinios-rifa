-- ==============================================================================
-- ESQUEMA SQL PARA SUPABASE (POSTGRESQL) - DASHBOARD DE PATROCINIOS Y RIFAS
-- ==============================================================================

-- 1. Tabla de Configuración de la Campaña / Rifa
CREATE TABLE IF NOT EXISTS raffle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL DEFAULT 'Campaña Principal',
  total_tickets INTEGER NOT NULL DEFAULT 500,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  default_sponsor_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enum para los estados de pago
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'pending', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Comercios Afiliados (Patrocinadores)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  logo_url TEXT,
  payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
  total_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para acelerar los filtros superiores en el Dashboard
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(payment_status);
CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
