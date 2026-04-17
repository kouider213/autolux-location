-- ============================================================
-- AUTOLUX-LOCATION — CORE HARDENING (idempotent)
-- À exécuter dans Supabase SQL Editor.
-- Objectif : verrouiller la base (contraintes, indexes, RPC, RLS)
-- sans casser l'existant. Tout est en IF NOT EXISTS / OR REPLACE.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. CONTRAINTES DATES — end_date > start_date
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_date_order_chk'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_date_order_chk CHECK (end_date > start_date);
  END IF;
END$$;

-- ------------------------------------------------------------
-- 2. INDEXES — performance sur recherches fréquentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_car_dates
  ON public.bookings (car_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings (status);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON public.bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cars_available
  ON public.cars (available);

-- ------------------------------------------------------------
-- 3. RPC check_car_availability — source unique de vérité
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_car_availability(
  p_car_id      UUID,
  p_start       DATE,
  p_end         DATE,
  p_exclude_id  UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_car_id IS NULL OR p_start IS NULL OR p_end IS NULL THEN
    RETURN FALSE;
  END IF;
  IF p_end <= p_start THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.car_id = p_car_id
      AND b.status IN ('PENDING', 'ACCEPTED')
      AND (p_exclude_id IS NULL OR b.id <> p_exclude_id)
      AND b.start_date < p_end
      AND b.end_date   > p_start
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_car_availability(UUID, DATE, DATE, UUID) TO anon, authenticated;

-- ------------------------------------------------------------
-- 4. TRIGGER updated_at sur bookings
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_touch ON public.bookings;
CREATE TRIGGER trg_bookings_touch
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.cars     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cars_read_public" ON public.cars;
CREATE POLICY "cars_read_public" ON public.cars
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "cars_write_admin" ON public.cars;
CREATE POLICY "cars_write_admin" ON public.cars
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')));

DROP POLICY IF EXISTS "bookings_insert_public" ON public.bookings;
CREATE POLICY "bookings_insert_public" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'PENDING');

DROP POLICY IF EXISTS "bookings_read_admin" ON public.bookings;
CREATE POLICY "bookings_read_admin" ON public.bookings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')));

DROP POLICY IF EXISTS "bookings_update_admin" ON public.bookings;
CREATE POLICY "bookings_update_admin" ON public.bookings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')));

DROP POLICY IF EXISTS "bookings_delete_admin" ON public.bookings;
CREATE POLICY "bookings_delete_admin" ON public.bookings
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')));

DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "reviews_read_public" ON public.reviews;
CREATE POLICY "reviews_read_public" ON public.reviews
  FOR SELECT USING (approved = true);

DROP POLICY IF EXISTS "reviews_insert_public" ON public.reviews;
CREATE POLICY "reviews_insert_public" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (approved = false);

DROP POLICY IF EXISTS "reviews_moderate_admin" ON public.reviews;
CREATE POLICY "reviews_moderate_admin" ON public.reviews
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('kouider','houari','admin')));

-- ============================================================
-- FIN — tout est idempotent, réexécutable sans risque
-- ============================================================
