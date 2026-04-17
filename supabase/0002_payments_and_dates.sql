-- ============================================================
-- AUTOLUX-LOCATION — 0002: PAYMENTS + DATE NORMALIZATION
-- Idempotent. Réexécutable sans risque.
-- ============================================================

-- ── 0. FONCTION touch_updated_at (si non encore créée) ───────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── 1. ENUMS ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('cash','card','virement','autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('pending','confirmed','refunded','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. TABLE PAYMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,

  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method          payment_method_type NOT NULL DEFAULT 'cash',
  status          payment_status_type NOT NULL DEFAULT 'pending',

  is_deposit      BOOLEAN NOT NULL DEFAULT FALSE,
  reference       TEXT,

  paid_at         TIMESTAMPTZ,
  refunded_at     TIMESTAMPTZ,
  refund_amount   NUMERIC(10,2) CHECK (refund_amount IS NULL OR refund_amount > 0),

  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT refund_only_if_refunded CHECK (
    (refunded_at IS NULL AND refund_amount IS NULL)
    OR
    (refunded_at IS NOT NULL AND refund_amount IS NOT NULL)
  )
);

-- ── 3. TRIGGER updated_at sur payments ───────────────────────
DROP TRIGGER IF EXISTS trg_payments_touch ON public.payments;
CREATE TRIGGER trg_payments_touch
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 4. INDEXES payments ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at    ON public.payments(paid_at DESC);

-- ── 5. RLS payments ───────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_read_admin"   ON public.payments;
DROP POLICY IF EXISTS "payments_insert_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_admin" ON public.payments;

CREATE POLICY "payments_read_admin" ON public.payments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')
  ));

CREATE POLICY "payments_insert_admin" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')
  ));

CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')
  ));

CREATE POLICY "payments_delete_admin" ON public.payments
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')
  ));

-- ── 6. NORMALISATION DATES BOOKING ───────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_booking_dates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'end_date (%) doit être postérieure à start_date (%)',
      NEW.end_date, NEW.start_date
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_normalize_dates ON public.bookings;
CREATE TRIGGER trg_bookings_normalize_dates
  BEFORE INSERT OR UPDATE OF start_date, end_date
  ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.normalize_booking_dates();

-- ── 7. RPC get_booking_summary ───────────────────────────────
CREATE OR REPLACE FUNCTION public.get_booking_summary(p_booking_id UUID)
RETURNS TABLE (
  booking_id      UUID,
  car_name        TEXT,
  client_name     TEXT,
  start_date      DATE,
  end_date        DATE,
  nb_days         INTEGER,
  final_price     NUMERIC,
  total_paid      NUMERIC,
  remaining       NUMERIC,
  booking_status  TEXT
) LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    c.name,
    b.client_name,
    b.start_date,
    b.end_date,
    b.nb_days,
    b.final_price,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0)::NUMERIC,
    (b.final_price - COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0))::NUMERIC,
    b.status
  FROM public.bookings b
  LEFT JOIN public.cars c ON c.id = b.car_id
  LEFT JOIN public.payments p ON p.booking_id = b.id
  WHERE b.id = p_booking_id
  GROUP BY b.id, c.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_summary(UUID) TO authenticated;

-- ============================================================
-- FIN — tout est idempotent, réexécutable sans risque
-- ============================================================
