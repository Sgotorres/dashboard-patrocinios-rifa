-- ==============================================================================
-- ESQUEMA SQL OPCIONAL PARA SUPABASE (POSTGRESQL) - DASHBOARD DE PATROCINIOS Y RIFAS
-- ==============================================================================
-- NOTA ARQUITECTÓNICA:
-- La aplicación opera actualmente bajo una arquitectura LOCAL-FIRST 100% OFFLINE
-- utilizando IndexedDB (mediante Dexie.js) en el navegador del cliente.
--
-- Este archivo se proporciona como esquema de referencia para una futura migración
-- hacia sincronización en la nube mediante Supabase (PostgreSQL).
-- Si deseas activar la sincronización con Supabase, consulta la guía en:
-- docs/SUPABASE_MIGRATION_GUIDE.md
-- ==============================================================================

-- 1. Tabla de Configuración de la Campaña / Rifa
CREATE TABLE IF NOT EXISTS raffle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL DEFAULT 'Publicidad de Cine & Sorteo a la Playa 2026',
  total_tickets INTEGER NOT NULL DEFAULT 1000,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  ticket_price NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
  ticket_price_cop NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
  ticket_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  target_revenue NUMERIC(14, 2) NOT NULL DEFAULT 50000000.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enum para los estados de pago y moneda
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'pending', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE currency_enum AS ENUM ('COP', 'USD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Comercios Afiliados (Patrocinadores)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  social_url TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  currency currency_enum NOT NULL DEFAULT 'COP',
  tickets_count INTEGER NOT NULL DEFAULT 1,
  ticket_price NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
  payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
  total_fee NUMERIC(14, 2) NOT NULL DEFAULT 50000.00,
  amount_paid NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para acelerar búsquedas y filtros en el Dashboard
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(payment_status);
CREATE INDEX IF NOT EXISTS idx_merchants_currency ON merchants(currency);
CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
CREATE INDEX IF NOT EXISTS idx_merchants_created_at ON merchants(created_at DESC);
