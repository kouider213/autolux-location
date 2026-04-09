-- ============================================================
-- FIK CONCIERGERIE â SCRIPT SQL COMPLET
-- ExÃ©cuter dans Supabase > SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (liÃ©e Ã  auth.users de Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('kouider', 'houari', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: cars
-- ============================================================
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,      -- Prix Houari (propriÃ©taire)
  resale_price NUMERIC(10,2) NOT NULL,    -- Prix Kouider (revendeur)
  image_url TEXT,
  category TEXT DEFAULT 'standard',
  seats INTEGER DEFAULT 5,
  fuel TEXT DEFAULT 'essence',
  transmission TEXT DEFAULT 'manuelle',
  available BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Infos client
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  client_age INTEGER NOT NULL,
  client_passport TEXT,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  nb_days INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,
  
  -- Tarification (snapshot au moment de la rÃ©servation)
  base_price_snapshot NUMERIC(10,2) NOT NULL,
  resale_price_snapshot NUMERIC(10,2) NOT NULL,
  final_price NUMERIC(10,2) NOT NULL,
  profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Statut
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  
  -- Notes
  notes TEXT,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- ============================================================
-- FUNCTION: VÃ©rifier disponibilitÃ© (anti-double rÃ©servation)
-- ============================================================
CREATE OR REPLACE FUNCTION check_car_availability(
  p_car_id UUID,
  p_start DATE,
  p_end DATE,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE car_id = p_car_id
      AND status IN ('PENDING', 'ACCEPTED')
      AND (id != p_exclude_id OR p_exclude_id IS NULL)
      AND (
        (start_date <= p_end AND end_date >= p_start)
      )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Cars: lecture publique
CREATE POLICY "Cars lisibles par tous" ON cars FOR SELECT USING (true);
CREATE POLICY "Cars modifiables par admins" ON cars FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('houari', 'kouider'))
);

-- Bookings: lecture selon rÃ´le
CREATE POLICY "Booking: lecture authentifiÃ©e" ON bookings FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Booking: insertion publique" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Booking: update par admins" ON bookings FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('houari', 'kouider'))
);

-- Reviews: lecture publique (approuvÃ©es)
CREATE POLICY "Reviews approuvÃ©es lisibles" ON reviews FOR SELECT USING (approved = TRUE);
CREATE POLICY "Reviews: insertion publique" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews: modif admin" ON reviews FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('houari', 'kouider'))
);

-- Profiles
CREATE POLICY "Profil: lecture par owner" ON profiles FOR SELECT USING (
  auth.uid() = id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'houari')
);

-- ============================================================
-- DONNÃES INITIALES: VOITURES
-- ============================================================
INSERT INTO cars (name, base_price, resale_price, seats, fuel, category) VALUES
  ('Jumpy 9 Places', 44, 55, 9, 'diesel', 'utilitaire'),
  ('Sandero', 22, 35, 5, 'essence', 'citadine'),
  ('Clio 5 Essence', 37, 45, 5, 'essence', 'berline'),
  ('Clio 5 Alpine', 44, 50, 5, 'essence', 'premium'),
  ('i10', 19, 25, 5, 'essence', 'citadine'),
  ('Jogger', 37, 50, 7, 'essence', 'familiale'),
  ('Duster', 31, 45, 5, 'diesel', 'SUV'),
  ('Fiat 500', 24, 35, 4, 'essence', 'citadine'),
  ('Duster (2)', 44, 50, 5, 'diesel', 'SUV'),
  ('Clio 4', 24, 35, 5, 'essence', 'berline'),
  ('Clio 4 (2)', 24, 35, 5, 'essence', 'berline'),
  ('Creta', 24, 45, 5, 'essence', 'SUV'),
  ('Fiat 500 XL', 37, 45, 5, 'essence', 'citadine'),
  ('Berlingo', 44, 55, 7, 'diesel', 'utilitaire');

-- ============================================================
-- NOTE: CrÃ©er les users Kouider et Houari via Supabase Auth
-- puis insÃ©rer dans profiles:
-- INSERT INTO profiles (id, name, role) VALUES ('UUID_AUTH', 'Kouider', 'kouider');
-- INSERT INTO profiles (id, name, role) VALUES ('UUID_AUTH', 'Houari', 'houari');
-- ============================================================
